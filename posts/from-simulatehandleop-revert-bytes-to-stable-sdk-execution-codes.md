---
title: Turning ERC-4337 Simulation Failures Into Useful SDK Errors
date: 2026-05-28
summary: Why production ERC-4337 bundlers need a reliability layer that translates messy simulation and submission failures into stable SDK-facing execution codes.
slug: from-simulatehandleop-revert-bytes-to-stable-sdk-execution-codes
---

# Turning ERC-4337 Simulation Failures Into Useful SDK Errors

## The problem users actually see

A user tries to swap, bridge, or approve through a smart account flow.  
The action fails.  
The wallet says: "transaction failed."

That message is not useful for anyone:

- not for the user, who needs to know what to fix
- not for the SDK, which needs a stable programmatic error
- not for support, which needs enough context to debug quickly

The real cause might be:

- insufficient token allowance
- insufficient balance
- slippage threshold not met
- account validation failure
- paymaster rejection
- nonce mismatch
- gas or RPC/provider behavior

In many ERC-4337 stacks, these all collapse into one vague failure because the raw backend error is too low-level to expose directly.

This post is about the production layer that fixes that.

## ERC-4337 context, only what we need

At a high level:

- users submit `UserOperation` objects, not normal L1/L2 transactions
- a bundler receives these operations
- the bundler simulates first, then decides whether to submit

Why simulate first? Because submitting obviously invalid operations wastes gas, burns time, and creates noisy failure states.

So simulation is not a nice-to-have. It is the first reliability gate.

## Why simulation failures are messy in real systems

In a clean toy environment, a simulation failure can look straightforward. In production, it usually is not.

What I see in real traffic:

- provider clients wrap errors inside multiple nested objects
- useful payloads are often raw ABI-encoded revert bytes
- known ABI coverage is never complete
- sometimes I only get a selector and no friendly signature
- sometimes I only get string fragments, including `AAxx` style messages
- different RPC providers shape the same underlying failure differently

So "just decode the revert" is not a production strategy. It is one step in a chain.

## The decode pipeline that holds up in production

I use a staged pipeline so decode quality can vary without breaking the SDK contract:

```txt
raw provider error
  -> extract revert bytes
  -> decode known ABI errors
  -> fallback selector lookup
  -> fallback message-pattern classification
  -> map to typed SDK error code
```

### 1) Extract revert data from wrappers

First, walk nested provider errors and extract whatever canonical signal exists:

- raw revert bytes
- selector
- provider error summary
- traversal trail for debugging

Without this step, downstream decode logic never sees the real payload.

### 2) Decode known ABI errors

Try deterministic ABI decode first for errors I expect to be common, like:

- allowance failures
- slippage-style failures
- known `FailedOp` patterns

When this works, the mapping is clean and confidence is high.

### 3) Fallback on selector signatures

If ABI decode misses, look up the selector signature and cache the result.  
This catches cases where payload shape is valid but local ABI coverage is incomplete.

### 4) Fallback on message patterns

If structured decode still fails, classify based on resilient patterns:

- allowance-related message variants
- balance-related variants
- slippage variants
- `AA20` / `AA23` / `AA25` style patterns

This is less precise, but still better than returning "unknown" for everything.

### 5) Emit typed errors with stable codes

No matter which decode stage succeeds, the output to SDKs stays stable:

```ts
if (!decodedSignal) {
  return {
    code: "UNKNOWN_SIMULATION_ERROR",
    reason: fallbackMessage ?? "simulation failed",
  };
}

return mapDecodedSignalToStableCode(decodedSignal);
```

The internal decode strategy can evolve. The external API contract should not.

## Stable SDK codes are the product boundary

This is the core point: stable execution codes are not log decoration. They are the product boundary between bundler infrastructure and every downstream consumer.

I treat these codes as contract-level outputs, for example:

- `INSUFFICIENT_ALLOWANCE`
- `INSUFFICIENT_BALANCE`
- `SLIPPAGE_EXCEEDS_THRESHOLD`
- `AA_VALIDATION_ERROR`
- `NONCE_TOO_LOW`
- `UNKNOWN_SIMULATION_ERROR`

Why this matters:

- SDKs can drive deterministic UI copy
- clients can choose retry vs no-retry safely
- analytics can track real failure classes over time
- support can triage without digging through raw RPC payloads

If the code surface is unstable, every integration becomes fragile.

## Keep simulation classification separate from submission recovery

These are related, but they are not the same problem.

Simulation classification answers: "Is this operation valid enough to submit?"

Submission recovery answers: "Submission failed, now what?"

I keep the policies separate:

- do not retry deterministic user-state failures like allowance/slippage
- do retry selected operational failures like transient RPC timeouts
- treat nonce errors as a hint-driven retry path, not blind increment
- quarantine unhealthy bundler wallets and retry with guardrails
- enforce strict retry depth and timeout limits

A small example of nonce hint extraction:

```ts
function parseNextNonceHint(message: string): number | undefined {
  const m = message.match(/next nonce\s+(\d+)/i);
  if (!m) return undefined;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : undefined;
}
```

That is a reliability control, not a convenience feature.

## What production adds beyond spec compliance

Spec alignment is required. It is not enough.

A spec-compliant bundler can still produce bad operational outcomes if it lacks:

- robust provider-wrapper extraction
- decode fallback layering
- stable SDK-facing taxonomy
- explicit retry and quarantine policy
- structured observability with safe debug context

In other words, passing interface-level checks does not automatically make failures legible to real users and real SDKs.

## Testing this layer properly

I want deterministic coverage for both classification and recovery behavior. The minimum serious set looks like:

- allowance failure maps to `INSUFFICIENT_ALLOWANCE`
- balance failure maps to `INSUFFICIENT_BALANCE`
- slippage failure maps to `SLIPPAGE_EXCEEDS_THRESHOLD`
- AA validation failures map consistently
- unknown selectors still map to stable unknown categories
- nonce hints parse correctly and guide retry behavior
- wallet quarantine exits cleanly and does not loop forever
- retry paths stop at hard limits

Without these tests, reliability regressions show up in production first.

## Main takeaway

A bundler is not just a relay.

In production, it is a reliability layer that translates low-level execution failures into stable, actionable outputs for SDKs, wallets, UIs, support, and operators.

Calling simulation correctly is table stakes.  
Turning messy simulation and submission failures into stable execution codes is the hard part.

That translation layer is core transaction infrastructure.