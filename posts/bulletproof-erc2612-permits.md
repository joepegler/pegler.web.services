---
title: A safer pattern for ERC-2612 permits
date: 2026-03-23
summary: ERC-2612 detection is unreliable in practice. The robust pattern is cheap interface screening followed by on-chain permit simulation with identical EIP-712 domain logic.
slug: bulletproof-erc2612-permits
---

# A safer pattern for ERC-2612 permits

ERC-2612 is supposed to solve a simple problem. A token holder should be able to authorize spending with a signature instead of an on-chain approval transaction. In practice, deciding whether a token actually supports `permit()` is much harder than the spec implies.

The failure mode is not missing support. The failure mode is a false positive. If you surface a permit flow, ask the user to sign, and the contract reverts, the damage is already done.

The pattern I ended up trusting is simple:

Never surface a permit flow unless you have already proven that the contract accepts a real permit on-chain.

---

## Failure mode

ERC-2612 defines a `permit(owner, spender, value, deadline, v, r, s)` function. Tokens that implement it also expose `DOMAIN_SEPARATOR()`, `nonces(address)`, and usually `name()`. So the naive detection strategy is: call those view functions, and if they all return sensible data, the token supports permits.

This is wrong often enough to be dangerous.

Lido's stETH exposes every view function. `DOMAIN_SEPARATOR` returns bytes, `nonces` returns a uint, `name()` returns `"Liquid staked Ether 2.0"`. It looks like a textbook 2612 token. But call `permit()` and it reverts. Same story with bsdETH on Base (version `"3.4.0"` breaks the EIP-712 domain). Same with certain Morpho vault tokens that pass every heuristic check but fail the actual permit execution.

False negatives are annoying. False positives are expensive. If you miss a valid permit, you fall back to a normal approval path. If you misclassify an invalid permit as supported, you show a signature request that leads to a revert.

---

## Why naive detection fails

View-function probing is only an interface check. It does not prove behaviour.

There are several ways a token can look correct and still fail:

- The contract exposes the expected getters but reverts inside `permit()`.
- The token uses a domain layout that does not match the obvious EIP-712 construction.
- `version()` is omitted even though the contract expects `"1"` internally.
- Signature validation is non-standard enough that a generic client builds the wrong typed data.

This is the core lesson: interfaces lie. Execution does not.

Cheap probing is still useful, but only as a filter. It can rule obvious non-candidates out. It cannot promote a token into the "safe to surface" set on its own.

---

## General solution pattern

I treat ERC-2612 validation as a two-phase problem.

Phase 1 is a cheap heuristic pass. Check that `DOMAIN_SEPARATOR()`, `nonces(address)`, and `name()` behave sensibly. Try `version()` too, but do not require it. This step exists to save work, not to establish truth.

Phase 2 is the real test. Construct an actual permit, sign it with ephemeral keys, execute `permit()` with `eth_call`, and then verify the postcondition. In practice that means checking that `allowance(owner, spender)` changed to the value you signed for.

This is the reusable pattern:

- Use heuristics to narrow the candidate set.
- Use execution to establish ground truth.
- Only surface permit support after the execution-level check passes.

The critical property is that phase 2 exercises the same path a real user will rely on. If the token's `permit()` would fail in production, it should fail during validation first.

```typescript
async function supportsPermit(tokenAddress, chainId, publicClient) {
  const owner = privateKeyToAccount(generatePrivateKey());
  const spender = privateKeyToAccount(generatePrivateKey()).address;

  const [name, nonce, version] = await Promise.all([
    publicClient.readContract({ address: tokenAddress, abi, functionName: "name" }),
    publicClient.readContract({
      address: tokenAddress,
      abi,
      functionName: "nonces",
      args: [owner.address],
    }),
    publicClient
      .readContract({ address: tokenAddress, abi, functionName: "version" })
      .catch(() => "1"),
  ]);

  const signature = await owner.signTypedData({
    domain: {
      name,
      version: String(version),
      chainId,
      verifyingContract: tokenAddress,
    },
    types: {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "Permit",
    message: {
      owner: owner.address,
      spender,
      value: 1n,
      nonce,
      deadline: MAX_UINT256,
    },
  });

  const { v, r, s } = parseSignature(signature);

  const [permitResult, allowanceResult] = await publicClient.multicall({
    contracts: [
      {
        address: tokenAddress,
        abi,
        functionName: "permit",
        args: [owner.address, spender, 1n, MAX_UINT256, v, r, s],
      },
      {
        address: tokenAddress,
        abi,
        functionName: "allowance",
        args: [owner.address, spender],
      },
    ],
    allowFailure: true,
  });

  return (
    permitResult.status === "success" &&
    allowanceResult.status === "success" &&
    allowanceResult.result === 1n
  );
}
```

The exact mechanics can vary. You can batch candidates. You can cache outcomes. You can rerun periodically. None of that changes the principle. Do not trust the ABI surface. Verify the state transition.

## Key technical insights

### EIP-712 domain construction is where many implementations break

Most permit failures are not about the `permit` function signature itself. They are about building the wrong EIP-712 domain or message. `name`, `chainId`, `verifyingContract`, `nonce`, and `deadline` all need to match the contract's expectations exactly.

`version()` is the most common trap. It is not part of ERC-2612 itself. It comes from EIP-712 domain fields, and many legitimate tokens do not expose a `version()` getter even when they expect `"1"` in the domain.

Defaulting `version()` to `"1"` has been the right choice across a large share of real implementations, including USDC and many OpenZeppelin- or Solmate-style tokens. But the important part is not the default alone. The important part is that the same default must be used everywhere.

### Simulation logic and runtime logic must be identical

If your validator signs one domain and your production signer builds another, your validation is worthless. The validator, the signer, and any fallback code path need to share the same domain-construction rules, especially around `version()`.

That is why the simulation is so valuable. It tests not just the token, but your own assumptions about how to build the typed data.

### Check effects, not just call success

A successful `eth_call` to `permit()` is not enough. Verify the state transition you care about. For ERC-2612, the simplest postcondition is that `allowance(owner, spender)` equals the permitted value immediately after the simulated call.

---

## Tradeoffs

This approach costs more than naive probing. You are doing extra RPC work, extra signing, and at least one simulated state transition per candidate token.

I think that trade is worth it.

The real choice is false negatives versus false positives. A conservative validator will sometimes miss tokens that actually support permits. That is acceptable. A validator that produces false positives will eventually put users in front of a broken signing flow.

If you have to choose, bias toward certainty. Missing a permit opportunity is a performance loss. Surfacing a permit that reverts is a correctness failure.

---

## Takeaway

ERC-2612 support is not something I trust from interfaces alone. I trust it only after I have executed a real permit path with ephemeral keys and verified the resulting allowance on-chain.

That is the pattern I would reuse on any stack:

- Probe the interface cheaply.
- Simulate the actual permit.
- Reuse the exact same EIP-712 construction in validation and production.
- Never surface a permit flow unless you have already proven it works on-chain.
