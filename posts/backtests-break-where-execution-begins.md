---
title: Backtests Break Where Execution Begins
date: 2026-05-08
summary: A concise retrospective on a 2018 TradingView Pine Script that looked strong in backtests until realistic execution assumptions changed the result.
slug: backtests-break-where-execution-begins
---

# Backtests Break Where Execution Begins

[Original 2018 script on TradingView](https://www.tradingview.com/script/QoNKoXwW-Simple-profitable-trading-strategy/)

## Opening

In 2018, I published an open-source Pine Script called **Simple profitable trading strategy**.

It spread further than I expected. The page reached around 66,000 views and around 3.1k uses, enough that it felt viral for a niche technical script.

The interesting part, in hindsight, was not the name and not the headline equity curve.

The interesting part was discovering how quickly a promising backtest falls apart when execution assumptions are wrong.

## What the strategy did

The logic was simple trend and oscillator confluence:

- EMA stack: 8, 13, 21, 34, 55
- RSI filter
- Stochastic filter
- Long/short entries only when trend and oscillators aligned
- Exits on EMA crossover deterioration or oscillator extremes

Core setup:

```pine
strategy(
  default_qty_type = strategy.percent_of_equity,
  default_qty_value = 100,
  commission_type = strategy.commission.percent,
  commission_value = .0020,
  slippage = 3,
  pyramiding = 0
)
```

It was not meant as a production-grade execution system. It was a compact strategy model in TradingView.

## Why it looked good

The backtest looked stronger than it deserved for predictable reasons:

- Bitcoin spent long periods in trend-friendly conditions
- Indicator confluence made entries feel "validated"
- Full-equity sizing amplified curve shape
- Strategy Tester outputs made results easy to trust quickly

This is a common trap. Strong presentation can hide weak assumptions.

## Where it broke

The key mistake was fee modeling.

I had set:

```pine
commission_value = .0020
```

With percent commissions in Pine, that is **0.002%**, not **0.2%**.  
That is a 100x difference.

Someone in the comments spotted the mismatch at the time. I replied that it was an oversight and that it materially changed the result.

For a strategy that enters and exits frequently, that difference is not cosmetic:

- Taker fees compound fast
- Slippage and spread add friction on top
- Churn can erase apparent edge

Once fees were modeled more realistically, the strategy profile changed materially.

## Backtests are incomplete by default

Most backtests are not misleading on purpose. They are incomplete by default.

They often skip the factors that decide live outcomes:

- Real fee tiers and maker/taker routing
- Spread, slippage, and depth
- Partial fills and latency
- API instability and exchange downtime
- Recalculation quirks and execution timing differences
- Regime dependency and overfitting

A backtest is useful, but it is still a hypothesis. Execution is the test.

The script even attracted inbound from a crypto trading automation startup. That was the useful signal: people wanted to connect simple TradingView logic to live execution. But automation does not fix a weak edge. It executes assumptions faster.

## Why this still matters in my current work

This later became familiar territory in account abstraction and transaction execution: a UserOperation can simulate cleanly and still fail inclusion, a route can quote well and still settle poorly, and an alert can fire and still fail to fill.

The hard part is not writing logic that works in ideal conditions.  
The hard part is surviving production conditions consistently.

## What I would do differently now

If I were evaluating the same strategy today, I would prioritize execution realism early:

- Use realistic fee tiers per exchange
- Separate maker and taker assumptions
- Model spread and slippage by regime
- Validate across market regimes and out-of-sample windows
- Add position and drawdown constraints
- Paper trade with production-like alert and monitoring flows
- Treat alerts as untrusted until execution confirms fills
- Add risk limits and kill switches before real capital

## Closing

The lesson was not that I had found a Bitcoin money machine.

The lesson was that execution assumptions are part of the strategy.

A backtest is not evidence of profit. It is a hypothesis.  
Execution is where the hypothesis gets tested.
