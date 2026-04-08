---
title: How I built a bulletproof ERC-2612 permit system
date: 2026-03-23
summary: Two-pass permit detection, ephemeral-key simulation, and a stub-and-swap runtime pattern for gasless ERC-20 approvals.
slug: bulletproof-erc2612-permits
---

# How I built a bulletproof ERC-2612 permit system

You hold 500 USDC in an external wallet. Zero ETH. You want to swap. The app says "approve USDC first." You click approve, and nothing happens, because approvals are on-chain transactions, and on-chain transactions cost gas, and you have no gas.

This is the ERC-20 cul-de-sac. Tokens without native balance can't authorize spending. Getting out usually means funding the EOA from another wallet or an on-ramp, just to send one approval. It's a terrible experience.

[ERC-2612](https://eips.ethereum.org/EIPS/eip-2612) fixes this by turning approvals into off-chain signatures. You sign a typed-data message; someone else submits the `permit` call on your behalf. No native gas needed from the token holder. I shipped this on [defi.app](https://defi.app) and it works. But getting there meant solving a harder problem than the spec suggests.

---

## The spec lies (sometimes)

ERC-2612 defines a `permit(owner, spender, value, deadline, v, r, s)` function. Tokens that implement it also expose `DOMAIN_SEPARATOR()`, `nonces(address)`, and usually `name()`. So the naive detection strategy is: call those view functions, and if they all return sensible data, the token supports permits.

This is wrong often enough to be dangerous.

Lido's stETH exposes every view function. `DOMAIN_SEPARATOR` returns bytes, `nonces` returns a uint, `name()` returns `"Liquid staked Ether 2.0"`. It looks like a textbook 2612 token. But call `permit()` and it reverts. Same story with bsdETH on Base (version `"3.4.0"` breaks the EIP-712 domain). Same with certain Morpho vault tokens that pass every heuristic check but fail the actual permit execution.

The cost of a false positive is real: the user sees a signing prompt, signs, the transaction reverts, and trust is gone. I needed a system where if a user sees a permit prompt, it will work. Every time.

---

## Pass 1: heuristic probing. Does this token look like it supports permits?

The first pass is a cheap screening filter. For every new token I index, I batch four `aggregate3` subcalls per token via Multicall3 in a single RPC round-trip:

```typescript
// Per token, four view calls in a single multicall
const calls = tokenAddresses.flatMap((address) => [
  { target: address, callData: "DOMAIN_SEPARATOR()", allowFailure: true },
  { target: address, callData: "nonces(0x0…0)", allowFailure: true },
  { target: address, callData: "name()", allowFailure: true },
  { target: address, callData: "version()", allowFailure: true },
]);
```

Three of these are **required**: `DOMAIN_SEPARATOR`, `nonces`, and `name` must succeed and decode to non-empty values. If any of them are missing or return empty bytes, the token fails immediately. No ERC-2612 token can function without a domain separator, a nonce tracker, or a name for the EIP-712 domain.

The fourth call, `version()`, is **optional**. This is where the defaults come in.

`version()` isn't actually in the ERC-2612 spec. It comes from EIP-712's optional domain fields. Many major tokens, including USDC, use version `"1"` internally but never expose a `version()` getter. If I required it, I'd reject half the tokens that genuinely support permits. So I tolerate its absence and default to `"1"` downstream, which has been reliable across OpenZeppelin, Solmate, and most custom implementations.

The outcome per token is one of three values: `true` (candidate: the interface looks right), `false` (definitely not: required view functions are missing), or `null` (inconclusive: RPC failed, decode error, try again later). This three-valued logic matters. I never want to commit to "unsupported" based on a transient RPC failure, and I never want to commit to "supported" based on heuristics alone.

That last point is critical: pass 1 **never writes `true` to the database**. It can only rule tokens out or nominate them for the real test.

---

## Pass 2: prove it. Simulate a real permit with throwaway keys

Every pass-1 positive advances here. I don't trust view functions alone. Tokens like stETH and certain Morpho vault tokens expose perfect ERC-2612 interfaces but revert when you actually call `permit()`. So I call it.

The idea is simple: generate ephemeral keys that hold nothing, sign a real EIP-712 permit with them, execute it against the live chain, and check whether the allowance was set. If it was, the token genuinely supports permits. If it wasn't, it doesn't, no matter what the view functions claim.

Here's the core of it:

```typescript
async simulatePermitBatch(inputs: Record<ChainId, Address[]>) {
    // Fresh throwaway keys per chain, no real funds, no state pollution
    const ownerAccount = privateKeyToAccount(generatePrivateKey());
    const spenderAccount = privateKeyToAccount(generatePrivateKey());
    const owner = ownerAccount.address;
    const spender = spenderAccount.address;

    for (const [chainId, tokens] of Object.entries(inputs)) {
        // Step 1: for each candidate token, read name/version/nonce and sign
        // a real EIP-712 Permit with the ephemeral owner key.
        // version defaults to "1" if the contract doesn't expose version().
        const permits = await Promise.all(
            tokens.map(async (token) => {
                const info = await this.generatePermit({
                    tokenAddress: token,
                    spender,
                    value: '1',
                    chainId,
                    owner: ownerAccount,
                });
                return { token, info };
            }),
        );

        // Step 2: multicall permit() then allowance() for each token
        const contracts = permits.flatMap(({ token, info }) => [
            {
                address: token,
                abi: ERC2612_PERMIT_ABI,
                functionName: 'permit',
                args: [owner, spender, 1n, info.deadline, info.v, info.r, info.s],
            },
            {
                address: token,
                abi: ERC2612_PERMIT_ABI,
                functionName: 'allowance',
                args: [owner, spender],
            },
        ]);

        const results = await publicClient.multicall({ contracts, allowFailure: true });

        // Step 3: supported only if permit succeeded AND allowance matches
        for (let i = 0; i < tokens.length; i++) {
            const permitOk = results[i * 2]?.status === 'success';
            const allowanceOk =
                results[i * 2 + 1]?.status === 'success'
                && results[i * 2 + 1].result === 1n;
            supported = permitOk && allowanceOk;
        }
    }
}
```

This is what makes the two-pass system iron-clad. Pass 1 checks "does this contract have the right interface?" Pass 2 checks "does the permit actually work when you execute it?"

The simulation runs against the live chain. These are real `eth_call` executions via multicall, not local EVM forks. The same defaults apply here as in pass 1: `version` falls back to `"1"` if the token doesn't expose `version()`, `nonce` is read from chain for the ephemeral owner address, and `name` is read directly from the contract. The EIP-712 domain and Permit typed data are constructed identically to how they'd be constructed for a real user. The only difference is the signer is a throwaway key.

A token is only marked as supported when **both** calls succeed **and** the resulting allowance equals the expected value. This catches everything pass 1 can't: tokens with correct view functions but broken `permit()` implementations, tokens with non-standard signature verification, tokens where the domain hash computation doesn't match the contract's expectations. If the contract's `permit` would revert for a real user, it reverts here too, and I mark it `false` before any user is ever involved.

---

## The pipeline: how both passes connect

The two passes run as a batch job over all tokens where `supports_eip_2612` is still `NULL` in the database:

```
┌─────────────────────────────────────────────────────────────────┐
│  All asset_to_chain rows where supports_eip_2612 = NULL         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    Process in chunks of 10
                           │
              ┌────────────▼────────────┐
              │  Pass 1: Heuristic      │
              │  Does the interface     │
              │  look right?            │
              └────┬────────┬───────┬───┘
                   │        │       │
               false      true    null
                   │        │       │
                   ▼        ▼       ▼
           DB: false   ┌────▼────┐  Left as NULL
                       │ Pass 2  │  (retry next run)
                       │ Execute │
                       │ permit  │
                       └──┬───┬──┘
                          │   │
                     pass │   │ fail
                          ▼   ▼
                    DB: true  DB: false
```

Together, the two passes form a tight funnel. Pass 1 is cheap and eliminates the obvious non-candidates. Pass 2 is more expensive but definitive. It answers the only question that matters: does `permit()` actually work on this contract?

Three design decisions reinforce this:

**`true` is only written after pass 2 succeeds.** Heuristics alone never flip the flag. A token can look perfect on paper and still fail the actual permit call: stETH, bsdETH, certain Morpho vaults. The simulation is the gatekeeper.

**`null` means "unsupported" at read time.** When the application checks whether to offer a permit flow, the lookup is:

```typescript
return token?.supports_eip_2612 ?? false;
```

A token that hasn't been simulated yet, or where the RPC failed, or where the batch threw. All of these read as `false`. The user gets a standard approval flow instead. I'd rather miss a permit opportunity than show a signing prompt that reverts.

**Chunk-level error isolation.** If one chunk of 10 tokens fails, processing continues with the next chunk. If `simulatePermitBatch` throws for a set of pass-1 positives, those tokens stay `NULL` and get retried on the next run. The system is self-healing.

---

## Runtime: the stub-and-swap pattern

Once `supports_eip_2612 = true` is in the database, the runtime flow uses a placeholder pattern that avoids wallet popups during quote browsing.

```
  User            SDK               API              Wallet
   │                │                 │                 │
   │  Request quote │                 │                 │
   │───────────────>│  GET /quote     │                 │
   │                │────────────────>│                 │
   │                │                 │                 │
   │                │  beforeAction:  │                 │
   │                │  { data: '0xStubPermit',          │
   │                │    context: 'PERMIT' }            │
   │                │<────────────────│                 │
   │                │                 │                 │
   │  Browse quotes │  (no wallet     │                 │
   │  Compare routes│   popup)        │                 │
   │                │                 │                 │
   │  Confirm swap  │                 │                 │
   │───────────────>│  signTypedData  │                 │
   │                │────────────────────────────────── >│
   │                │                 │    EIP-712 sign │
   │                │< ─────────────────────────────────│
   │                │                 │                 │
   │                │  POST /action   │                 │
   │                │  { signature,   │                 │
   │                │    deadline,    │                 │
   │                │    nonce }      │                 │
   │                │────────────────>│                 │
   │                │                 │                 │
   │                │  Real calldata: │                 │
   │                │  permit() +     │                 │
   │                │  transferFrom() │                 │
   │                │<────────────────│                 │
   │                │                 │                 │
   │                │  Execute batch  │                 │
   │                │────────────────>│                 │
   │  Swap complete │                 │                 │
   │<───────────────│                 │                 │
```

**At quote time**, the backend includes the permit as a `beforeAction` step, but with synthetic placeholder data:

```typescript
{
    data: '0xStubPermit',
    customData: { context: 'PERMIT' }
}
```

No real signature, no wallet interaction. The user can browse quotes, compare routes, and change their mind without being interrupted by signing prompts.

**At confirm time**, the SDK detects the stub:

```typescript
private shouldUsePermit(beforeAction): boolean {
    return beforeAction?.transactionRequests?.some(
        (tx) => tx.customData?.context === 'PERMIT' && tx.data === '0xStubPermit'
    ) ?? false;
}
```

When the user commits, the SDK requests the EIP-2612 signature from their wallet, sends the `{ deadline, nonce, signature }` back to the API, and the API returns real calldata (the actual `permit()` call plus the `transferFrom`), replacing the stub. Execution proceeds with proven calldata.

The SDK-side signing handles the same `version()` quirk I deal with server-side:

```typescript
const [name, nonce, version] = await Promise.all([
  publicClient.readContract({
    address: tokenAddress,
    abi,
    functionName: "name",
  }),
  publicClient.readContract({
    address: tokenAddress,
    abi,
    functionName: "nonces",
    args: [owner],
  }),
  publicClient
    .readContract({ address: tokenAddress, abi, functionName: "version" })
    .catch(() => "1"), // Default to "1" if version() doesn't exist
]);

const domain = {
  name,
  version: String(version),
  chainId,
  verifyingContract: tokenAddress,
};
```

The `.catch(() => '1')` on `version()` is the same fuzzy tolerance I apply during detection. If the token doesn't expose `version()`, I use `"1"`. This has been reliable across every 2612 implementation I've encountered: OpenZeppelin, Solmate, USDC, Aave's GHO, Morpho's token, and others.

---

## Dev quirks and lessons

**The `version()` default is load-bearing.** This single design decision, `.catch(() => '1')`, unlocks permits for a huge number of tokens that technically comply with ERC-2612 but omit the optional `version()` accessor. Both passes use the same default, which means the heuristic and the simulation are constructing identical EIP-712 domains. If the default works in the simulation, it will work for the real user. If it doesn't, the simulation catches it and the token is marked unsupported. The default is never a guess that goes untested.

**Defaults propagate consistently across the stack.** The server-side simulation, the batch heuristic job, and the SDK-side signing code all share the same fallback logic: read `name` and `nonces` from chain, try `version()`, default to `"1"`. This means the exact domain that I prove in pass 2 is the exact domain the user will sign against at runtime. No domain mismatch between detection and execution.

**Gas is pre-quoted with fixed estimates.** Rather than calling `estimateGas` on every permit (which would add latency to every quote), I use fixed per-chain gas constants. The permit call is predictable enough that static estimates work well:

```
Ethereum:  105,000 gas
Base:       72,000 gas
Arbitrum:   72,000 gas
Sonic:      80,000 gas
BSC:        80,000 gas
```

**New tokens start conservative.** When I index a previously unseen token, pass 1 runs inline. If it returns `false`, I persist that immediately. If it returns `true` or `null`, I persist `null`, and the token won't be offered as permit-capable until the batch job runs pass 2 and confirms it. No user is ever the first to test a permit.

---

## Results

Zero user-facing permit failures on tokens marked as supported. Every `true` in the database has been proven by an actual on-chain permit execution with ephemeral keys before any real user signed anything.

The conservative `null → false` policy means I occasionally miss permit opportunities. A token that supports 2612 but hasn't been simulated yet will get a standard approval flow. That's the right tradeoff. A missed optimization is invisible; a failed signing prompt is not.

Try this flow with zero native balance and a 2612-enabled token. If you hit edge cases or unsupported variants, [ping me](https://x.com/Joepegler). I am always keen to hear about new ones.
