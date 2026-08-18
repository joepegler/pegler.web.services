# JD keyword index

Quick lookup: **keyword** → employer (`resume.json`) → theme id in [`bodies-of-work.md`](bodies-of-work.md).

## defi.app

| Keywords | Theme |
|----------|-------|
| Polymarket, prediction market, prediction markets, CLOB, central limit order book, market maker, RFQ, market close, event markets | `defi-polymarket` |
| ERC-4337, bundler, UserOperation, user op, EntryPoint, eth_getUserOperationReceipt, MEV protection, sponsorship, paymaster | `defi-bundler-4337` |
| Solana, Jito, Jupiter, paymaster, ATA, CPI, cross-chain swap | `defi-solana-execution` |
| LiFi, Relay, Crossmint, route, swap, provider integration, execution manager, quote, simulation | `defi-route-providers` |
| revenue share, referral, treasury, outage alerts | `defi-revenue-ops` |
| fund recovery, recovery SPA, WalletConnect | `defi-recovery` |
| trading, exchange, derivatives, high volume | `defi-execution-general` (also CoinFLEX in JSON) |
| TradingView, order book, trader UI, markets frontend, coinflex | `coinflex-markets` |

## Biconomy

| Keywords | Theme |
|----------|-------|
| abstractjs, @biconomy/abstractjs, TypeScript SDK, viem, modular client, smart account | `bico-abstractjs` |
| biconomy-client-sdk, account abstraction, AA SDK, paymaster client, bundler client | `bico-client-sdk` |
| ERC-4337 gas, gas estimation, UserOperation gas, simulation, debug_traceCall | `bico-gas-estimations` |
| error catalog, aa-errors, structured errors, SDK troubleshooting, regex matching | `bico-aa-errors` |
| documentation, docs, tutorials, integrator, developer experience, DX, Vocs, Docusaurus | `bico-docs` |
| smart sessions, session keys, fusion, EIP-7702, 7702, passkey, P-256, composability | `bico-sessions-7702` |
| React hooks, useAA, use-aa, frontend integration | `bico-use-aa` |
| examples, quickstart, Next.js demo, ecosystem, test network | `bico-examples-ecosystem` |
| Nexus, smart account contracts, hardhat deploy | `bico-nexus` (low authored volume) |

## Enso Finance

| Keywords | Theme |
|----------|-------|
| shortcuts, routing, GraphQL, link backend, token route, DeFi route | `enso-link-backend` |
| shortcuts SDK, wallet simulation, balances, translator | `enso-shortcuts-sdk` |
| Graph, subgraph, indexing | `enso-subgraph` (no authored commits; cite JSON only) |

## Cross-cutting (map to best employer match)

| Keywords | Prefer employer | Theme |
|----------|-----------------|-------|
| integration engineer, partner API, external API, proxy endpoint, webhook | defi.app or Biconomy | `defi-polymarket`, `defi-route-providers`, `bico-client-sdk`, `bico-docs` |
| production debugging, simulation-to-execution, nonce, RPC, structured errors | defi.app | `defi-bundler-4337`, `defi-route-providers`, `bico-aa-errors` |
| SDK architecture, typed API, npm package | Biconomy | `bico-abstractjs`, `bico-client-sdk` |
