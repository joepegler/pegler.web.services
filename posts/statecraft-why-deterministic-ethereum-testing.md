---
title: Why I built Statecraft for Ethereum integration testing
date: 2026-04-08
summary: Why deterministic fixtures matter for Ethereum integration tests, when Statecraft is a strong fit, and when simpler setups are better.
slug: statecraft-why-deterministic-ethereum-testing
---

# Why I built Statecraft for Ethereum integration testing

I built [Statecraft](https://statecraft.services/) because I kept seeing the same test failure pattern in Ethereum application teams. Integration tests started clean, then slowly accumulated hidden setup in `beforeEach`, chain state assumptions, and helper files that only one or two people understood. That setup looked convenient at first, but it made failures harder to reproduce and made parallel runs noisy.

Statecraft gives me a more explicit model: each test declares setup as typed scenario fixtures in one visible pipeline. I can read a test and immediately see setup order, chain runtime expectations, and seeded state.

## Why teams might use Statecraft

I see Statecraft as most useful when a team wants deterministic integration tests without replacing the rest of their stack:

- **Explicit setup order.** `scenario(...)` makes fixture order visible, so setup does not hide inside hook timing.
- **Deterministic chain state.** Forked tests can pin blocks and keep assumptions reproducible.
- **Composable fixtures.** Teams can combine only the setup they need, such as chain runtime, funded wallet, or ERC-20 balances.
- **Parallel-friendly test files.** Isolated runtimes reduce cross-test state coupling as suites grow.
- **Viem-first TypeScript ergonomics.** It fits teams already writing tests with TypeScript and viem.

## Why this matters in practice

When integration tests are unstable, teams lose confidence in refactors and ship velocity slows. In my experience, the root cause is often not one bad assertion. The root cause is hidden setup behavior and unclear runtime state. I built Statecraft to reduce that class of failure by making setup explicit and typed.

This does not make every test perfect. It does make failure analysis more straightforward because the setup pipeline is directly in front of you.

## When I would skip Statecraft

I would not force Statecraft into every project:

- If tests are mostly unit tests with minimal chain interaction, the extra fixture layer can be unnecessary.
- If the integration surface is very small and stable, simple hand-written setup might be sufficient.
- If a team needs a full framework that manages broader blockchain app concerns beyond integration setup, Statecraft is intentionally narrower.

## A practical adoption path

I usually recommend introducing Statecraft in one high-value integration suite first:

1. Pick a flaky or high-maintenance flow.
2. Move setup into a `scenario(...)` pipeline.
3. Pin fork state where reproducibility matters.
4. Keep the rest of the test runner and assertion stack unchanged.
5. Expand only after the team sees easier debugging and cleaner test readability.

That incremental path keeps migration risk low while still giving clear signal on whether the approach improves reliability for your codebase.

If you want the project overview and examples, use the [Statecraft site](https://statecraft.services/) and the [GitHub repository](https://github.com/joepegler/statecraft).
