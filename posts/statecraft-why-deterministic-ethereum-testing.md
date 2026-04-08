---
title: Why I built Statecraft after debugging flaky Ethereum integration tests
date: 2026-04-08
summary: A technical write-up on recurring Ethereum integration test failures, why hidden setup causes non-determinism, and how I switched to explicit scenario pipelines.
slug: statecraft-why-deterministic-ethereum-testing
---

# Why I built Statecraft after debugging flaky Ethereum integration tests

## Opening: concrete failure

I hit this failure enough times that I stopped calling it random.

A test that verifies token settlement on a mainnet fork passes locally and fails in CI two or three times a week. The assertion is simple. Expected user balance after settlement is `120_000000`, actual is `119_998742`. I rerun the same commit and it passes.

The first version of that test looked like this:

```ts
beforeEach(async () => {
  runtime = await startFork({
    rpcUrl: process.env.MAINNET_RPC_URL!,
    // no block pin here
  });

  clients = makeClients(runtime);
  wallets = await loadWalletsFromMnemonic(process.env.TEST_MNEMONIC!);
  await seedUsdc(clients.publicClient, wallets.maker.address, 120_000000n);
  await deploySettlementRouter(clients.walletClient);
});

test("settles maker order", async () => {
  const result = await settleOrder(clients, wallets.maker, order);
  expect(result.makerUsdcBalance).toBe(120_000000n);
});
```

When this fails, the test body tells me nothing about state assumptions. I have to inspect hooks, helper files, and runtime startup code. By the time I find the cause, I have burned an hour.

## Pattern recognition

I saw the same pattern across multiple Ethereum projects and codebases:

- Setup starts in one `beforeEach`, then moves into helpers.
- Helper calls start sharing mutable runtime handles.
- Forks stop being pinned because pinning is "temporary."
- One new test mutates state and another test starts failing in parallel CI.

The root cause is not flaky assertions. The root cause is hidden setup and implicit chain state.

Most failures looked different on the surface, but they came from the same place: test state was assembled across files, not declared where the test ran.

## Why existing approaches fail

### `beforeEach` hooks

Hooks hide ordering and ownership. If `fundWallet()` runs before `deployRouter()` one day and after it the next day because someone touched helpers, behavior changes without any change in the test body.

### Helper abstractions

Helpers remove duplication, but they also remove visibility. I have seen "single helper" files that start runtimes, deploy contracts, set balances, impersonate accounts, and return five clients. That is not abstraction. That is state compression.

### Fork drift from non-pinned state

Unpinned fork tests are unstable by design. If your test depends on liquidity depth, nonce, allowance, oracle state, or an account's existing balance, you have moving input every time the head block advances.

### Parallel test interference

Parallel file execution magnifies hidden coupling. Shared runtime reuse without explicit rollback creates test-order dependencies. Local runs may pass because files run in one order. CI shards run a different order and expose the coupling.

## The model I switched to

I switched to an explicit `scenario(...)` pipeline where each test declares setup in order.

```ts
import { test, expect } from "vitest";
import { parseEther, parseUnits } from "viem";
import {
  scenario,
  withFork,
  withFundedWallet,
  withErc20Balance,
} from "@st8craft/core";

test(
  "runs against pinned fork with explicit seeded state",
  scenario(
    withFork({
      rpcUrl: process.env.MAINNET_RPC_URL!,
      blockNumber: 22124510,
    }),
    withFundedWallet({ label: "maker" }),
    withErc20Balance({
      wallet: "maker",
      token: "USDC",
      amount: parseUnits("120000", 6),
    }),
    async ({ publicClient, maker }) => {
      const balance = await publicClient.getBalance({ address: maker.address });
      expect(balance).toBeGreaterThan(parseEther("1"));
    },
  ),
);
```

What used to be hidden is now explicit in one place:

- Which chain state I run against
- Whether that state is pinned
- Which wallet exists and with what balance
- What dependencies the test callback receives

I can inspect one test and see the full setup contract.

## What this actually fixes

This model fixes three specific problems for me.

First, reproducibility. A pinned fork plus explicit fixture order means I can rerun the same failing case with the same state assumptions.

Second, state visibility. I stop guessing where runtime, funding, and deployment happened because setup is declared in the scenario pipeline.

Third, debugging speed. When a test fails, I narrow my search to one list of fixture steps instead of tracing hook chains through multiple helper modules.

This does not guarantee bug-free tests. It reduces one class of failure: non-deterministic integration failures caused by hidden or drifting setup state.

## Tradeoffs and when not to use it

I do not use this pattern everywhere.

- If the suite is mostly unit tests, this is extra machinery.
- If integration coverage is tiny and stable, direct setup is faster.
- If you need a full blockchain app framework, this is the wrong layer.

This is a test setup model, not an application architecture.

## Adoption strategy

I adopt it in one suite first, not across the whole repo.

1. Pick a flaky path that already burns review or CI time.
2. Convert only that file to `scenario(...)` fixtures.
3. Pin fork state for any test that depends on existing chain conditions.
4. Keep runner and assertions unchanged.
5. Expand only after failures become easier to reproduce and explain.

This keeps migration small and gives a clear signal quickly.

For project details, see [Statecraft](https://statecraft.services/) and the [GitHub repository](https://github.com/joepegler/statecraft).
