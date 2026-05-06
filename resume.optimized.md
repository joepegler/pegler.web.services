# Joe Pegler
Cork, Ireland | [peglerweb.services](https://peglerweb.services) | [GitHub](https://github.com/joepegler) | [LinkedIn](https://linkedin.com/in/joe-pegler)

## Staff Infrastructure Engineer | Low-Latency Execution Systems and Reliability
Staff-level infrastructure engineer focused on transaction execution systems, production reliability, and developer platforms. Designs and operates low-latency execution pipelines, simulation systems, and developer tooling across EVM and Solana. Strong in failure handling, operational debugging, and systems that hold up under real-world production conditions.

### Why hire this person
- Solves hard execution infrastructure problems where reliability and latency both matter.
- Designs transaction pipelines with simulation, retries, fallback logic, and structured error handling.
- Reduces execution failures and integration complexity for product and backend teams.

## Selected Impact
- Designed a trusted ERC-4337 bundler architecture that reduced transaction latency versus existing provider flows through parallelized simulation and execution paths.
- Hardened production transaction orchestration with retries, simulation, and ABI-backed error decoding for sponsored and gasless flows.
- Unified multi-provider execution routing across EVM and Solana, replacing chain-specific integrations with one execution surface.
- Architected core TypeScript SDKs for smart-account, quote, and transaction execution workflows used across frontend and backend teams.
- Architected Biconomy's flagship TypeScript SDK and led API design for smart-account and multi-chain execution.
- Open-sourced [Statecraft](https://github.com/joepegler/statecraft), a TypeScript SDK for deterministic Ethereum integration testing with typed fixtures, pinned state, and isolated runtimes.
- Implemented EIP-712 and EIP-1271 signing with P-256 passkey support for keyless and gasless transaction UX.

## Experience
### defi.app | Web3 Infrastructure Engineer
May 2025 - Present | Canada
- Lead transaction infrastructure and developer tooling for a unified cross-chain DeFi product.
- Designed a trusted transaction orchestration architecture (bundler) that reduced latency versus provider-managed flows through parallelized simulation and execution, while improving reliability with ABI-backed error decoding.
- Unified multi-provider quote and execution routing across LiFi, Jupiter, 1inch, Odos, Mayan, LayerZero, and Relay behind one integration surface.
- Standardized the TypeScript SDK layer (`RouteClient`, `ExecutionManager`) used by frontend and backend teams for transaction execution.
- Architected EVM and Solana simulation and sponsorship infrastructure, including Jito-aware validation for sponsored transaction safety.
- Open-sourced [Statecraft](https://github.com/joepegler/statecraft) to make Ethereum integration tests deterministic through typed fixtures, pinned state, and per-file isolated runtimes.

Tech stack: TypeScript, Node.js, viem, EVM, Solana, PostgreSQL

### Biconomy | Lead SDK Engineer
Dec 2023 - May 2025 | Dubai
- Led the core developer SDK for smart accounts and multi-chain transaction execution.
- Architected the flagship TypeScript SDK from zero and led API design for account abstraction execution flows.
- Implemented EIP-712 and EIP-1271 signing with P-256 passkey support for keyless and gasless user flows.
- Standardized viem-based modular clients with Safe support to reduce integration complexity for account and bundler systems.
- Hardened production readiness with typed errors, composable batching, and CI coverage using Vitest, Bun, GitHub Actions, and Codecov.

Tech stack: TypeScript, Node.js, viem, ERC-4337, Safe, Vitest

### Enso | Lead Web3 / dApp Developer
Jul 2021 - Nov 2023 | Zurich
- Led 0 to 1 delivery of Enso's client dApp and transaction execution stack.
- Orchestrated end-to-end delivery from frontend product experience to backend execution services.
- Engineered and maintained a Graph-based indexing pipeline used by product and backend systems for on-chain data.
- Extended intents and solver infrastructure for decentralized trade execution.

Tech stack: TypeScript, Node.js, EVM, Graph Protocol, Solidity

### CoinFLEX | Head of UI/UX
Aug 2019 - Jul 2021 | London
- Led delivery of the exchange trading interface and frontend engineering standards.
- Automated CI/CD for the interface stack, improving release safety and shipping velocity on a live trading platform.

Tech stack: TypeScript, React, Node.js, CI/CD, GitHub Actions

## Earlier Experience
- GameAnalytics, Lead Frontend Developer (2016 to 2019): led a team of five, defined frontend architecture and quality standards, and won company MVP 2018/19.
- FSI, Healthcare 21, and Nixatel (2013 to 2016): built cross-platform enterprise applications and delivered 0 to 1 mobile and web products in small teams.

## Education
University College Cork, Masters in Computer Science (First Class Honours), Sep 2012 - Sep 2014

## Skills
- Low-latency transaction execution and reliability engineering
- SDK architecture and developer tooling
- Smart account and account abstraction infrastructure
- Transaction simulation and production debugging
- Multi-provider execution routing and cross-chain systems
- TypeScript and Node.js
- NestJS, PostgreSQL, Redis
- CI/CD (GitHub Actions, Vitest, Bun)
