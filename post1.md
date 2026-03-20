---
title: A faster path for sponsored ERC-4337
date: 2026-03-20
summary: Trusted bundler flow, minimal UserOps, and why it reduces latency.
slug: faster-sponsored-erc4337
---

# A faster path for sponsored ERC-4337: trusted bundler and minimal UserOps

In the usual ERC-4337 story, bundlers collect `UserOperation`s from an alt-mempool, simulate them, and submit via `EntryPoint.handleOps()`. They get reimbursed from the UserOp’s fee fields or from a paymaster, so the UserOp has to carry real `maxFeePerGas`, `maxPriorityFeePerGas`, and `preVerificationGas`, and often paymaster data. That implies gas-price lookups and paymaster round-trips before the user signs, and simulation is often tied to that same preparation. We found that when the bundler is a trusted first-party that pays for execution itself, you can use a different UserOp shape and a different backend layout and end up with fewer round-trips and better parallelization than the standard path.

This post is a short technical note on how that works and why it’s faster, without claiming it’s the right choice for every team, only that it’s a viable optimization when you control the client, the bundler, and the wallet pool.

---

## How the standard flow adds latency

In the [ERC-4337 model](https://docs.erc4337.io/bundlers/index.html), bundlers “act like miners for smart wallets”: they verify, package, and submit UserOps and are compensated via the [priority fees specified in each UserOperation](https://docs.erc4337.io/bundlers/index.html) and refunds from the account or paymaster. That reward is what incentivises bundlers to include a given UserOp; in a shared or public alt mempool, bundlers compete for that same reward, which can create incentives to front-run or race for inclusion. So the client (or middleware) typically:

1. Fetches gas prices for the UserOp (e.g. [Pimlico’s `getUserOperationGasPrice`](https://docs.pimlico.io/permissionless/v0_1/reference/pimlico-bundler-actions/getUserOperationGasPrice) for `maxFeePerGas` / `maxPriorityFeePerGas`).
2. Optionally calls a paymaster to get sponsorship data ([`sponsorUserOperation`](https://docs.pimlico.io/references/permissionless/v0_1/reference/pimlico-paymaster-actions/sponsorUserOperation)), which returns `preVerificationGas`, gas limits, and paymaster payload.
3. Builds the full UserOp and only then signs and submits.

Simulation often happens in the same pipeline: you need a valid-looking UserOp (including fee fields) before the bundler can simulate or the paymaster can validate. So gas estimation, fee lookup, and paymaster calls tend to sit on the critical path and can be serialized or tightly coupled. Platforms like [ZeroDev](https://docs.zerodev.app/sdk/v5_3_x/) give you a full-featured smart-account and sponsorship story, but that story is built around the standard UserOp and reimbursement flow, not a latency-specialized trusted-relayer shortcut.

---

## The deviation: zero-fee UserOp + bundler pays

If the bundler is **trusted** and **pays for execution itself**, you don’t need the EntryPoint to charge the user or a paymaster. You only need the EntryPoint to accept and run the UserOp. You also need some way of ensuring that the UserOp’s calldata has come from your own backend (e.g. signed or issued by your service), not arbitrary data a user might submit, so the bundler only executes operations you’ve authorised. So you can:

- Set `preVerificationGas`, `maxFeePerGas`, and `maxPriorityFeePerGas` in the UserOp to **zero** (or omit them in your packed format).
- Omit paymaster usage: `paymasterAndData` can be `"0x"`.

The EntryPoint still computes a charge as `requiredGas × effectiveGasPrice`. With those fee fields at zero, `effectiveGasPrice` is zero, so the EntryPoint debits **nothing** from the user’s deposit. The **bundler** then submits a normal transaction `EntryPoint.handleOps([userOp], bundlerAddress)`; that transaction is paid by the **bundler EOA**. So the user pays nothing; the bundler wallet pays the L1/L2 fee. This is the same “who pays” split we document internally for the bundler (EntryPoint charges nothing; bundler EOA pays the `handleOps` transaction).

A side effect of this setup: the UserOp carries **no bundler reward**. Malicious or competing bundlers are no longer incentivised by the priority fees in each UserOperation, because those fields are zero. With submission going to your trusted first-party bundler rather than a public or shared alt mempool, there is little opportunity and no fee-driven incentive for another bundler to front-run or race for inclusion. That means less wasted gas from competing inclusion attempts and no extra latency from transaction-hash churn when a submission is front-run by a bundler listening on the same mempool.

---

## Fewer calls before the user signs

On the client, the unsigned UserOp can be built without any gas-price or paymaster RPCs. For example (SDK, trimmed):

```ts
const unsignedUserOp = {
  sender: smartAccount.address,
  nonce,
  callData,
  signature: zeroAddress,
  preVerificationGas: 0n,
  paymasterPostOpGasLimit: 0n,
  paymasterVerificationGasLimit: 0n,
  ...gasLimits, // e.g. callGasLimit, verificationGasLimit from constants
} as unknown as UserOperation;
```

No `getUserOperationGasPrice`, no `sponsorUserOperation`, no `preVerificationGas` estimation. The hot path before signing is basically: nonce (and any session/permission work), then sign and POST to the bundler. So you remove entire round-trips that standard flows need.

---

## Parallelizing the work that remains

The backend still has to: acquire a wallet, decide fees for the **outer** `handleOps` transaction, get a nonce, verify sponsorship policy, simulate the UserOp, and estimate gas for `handleOps`. In a typical flow, some of that might be serialized behind “build UserOp → get gas for UserOp → then simulate.” Here, fee selection belongs to the **bundler’s** transaction, not the UserOp, so all of that can run in parallel as soon as the signed UserOp lands. For example:

```ts
const [feeData, nonce, gas, verified, sim] = await Promise.all([
  this.quicknodeProvider.getFeeData(chainId),
  this.quicknodeProvider.getNonce(chainId, wallet.address),
  publicClient.estimateContractGas({
    address: entryPoint07Address,
    abi: entryPoint07Abi,
    functionName: "handleOps",
    args: [[userOperation], wallet.address as Hex],
    account: wallet.address as Hex,
  }),
  this.txService.verifyCalldata(
    userOperation.sender,
    userOperation.nonce,
    userOperation.callData,
  ),
  backOff(() => this._simulateUserOp(/* ... */)),
]);
```

So simulation runs in the same time window as fee lookup, nonce fetch, sponsorship check, and `handleOps` gas estimation, instead of after a separate user-op gas/paymaster preparation phase. That’s a second kind of win: not just fewer calls, but better overlap of the calls you still need.

The bundler then applies `maxFeePerGas` and `maxPriorityFeePerGas` only to the **wallet** transaction that calls `handleOps`, not to the UserOp’s internal accounting:

```ts
transactionHash = await walletClient.writeContract({
  address: entryPoint07Address,
  abi: entryPoint07Abi,
  functionName: "handleOps",
  args: [[userOperation], wallet.address as Hex],
  account: walletClient.account!,
  gas: gasLimit,
  maxFeePerGas: feeData.maxFeePerGas,
  maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
  nonce: currentNonce,
});
```

---

## Funded wallet pool instead of batching

Standard bundlers often batch UserOps to amortize cost. Our priority is latency: we want a free wallet available for each submission so one UserOp isn’t waiting on another. So we run a **pool of pre-funded EOAs** per chain (e.g. 7–15 per chain, with `topupTargetUsd` and refill logic). The bundler acquires a wallet from the pool, runs the parallel block above, then submits a single `handleOps([userOp], bundlerAddress)` with that wallet. Fees and gas limit are for the **outer** transaction only; the UserOp’s own fee fields stay zero.

So we’re not “bundling” in the sense of packing multiple UserOps into one `handleOps` to save cost. We’re trading wallet count for latency: more wallets so that submissions don’t block each other. If queues grow, the lever we use is increasing the wallet count rather than batching.

---

## Tradeoffs

- **Non-standard UserOp.** The signed UserOp has zero (or omitted) fee fields and no paymaster. Only a bundler that accepts this format can execute it. A generic meta-bundler or third-party bundler expecting standard UserOps would not take the same payload; fallback would require the user to sign again with a standard UserOp.
- **Trust.** This is only safe when the client is your first-party (or otherwise trusted) and the backend is your bundler. The backend enforces sponsorship and execution policy before submitting.
- **Portability.** Similarly optimized setups exist (e.g. some Pimlico/Ultra Relay flows), but the format is deliberately non-standard, so you’re not plugging into the generic ERC-4337 mempool.

---

## Why it’s faster, in short

1. **Fewer pre-sign RPCs:** No gas-price or paymaster calls when building the UserOp; the client only needs nonce (and any session/permission data), then sign and submit.
2. **Better overlap:** Simulation, sponsorship verification, nonce, fee lookup, and `handleOps` gas estimation can run in parallel on the backend instead of being serialized behind user-op fee preparation.
3. **No batching dependency:** A pool of funded wallets means most requests get a sender immediately; latency is dominated by wallet availability and the parallel backend work, not by waiting for a bundle to fill.
4. **No fee-driven front-running:** The UserOp has no bundler reward, and submission is to your trusted bundler, so there is no incentive or practical opportunity for a malicious bundler to front-run for priority fees—reducing wasted gas and avoiding latency from replaced or raced submissions.

This only makes sense when you own the SDK, the bundler, and the wallet pool and can accept the trust and portability tradeoffs. In that setting, we’ve found it a practical way to get sponsored, low-latency execution without the extra round-trips and serialization of the standard ERC-4337 path.
