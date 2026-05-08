# Joe Pegler
Cork, Ireland | [peglerweb.services](https://peglerweb.services) | [GitHub](https://github.com/joepegler) | [LinkedIn](https://linkedin.com/in/joe-pegler)

## Integration Engineer | TypeScript SDKs, EVM Integrations, and Developer Platforms
Engineer focused on **making protocol and execution integrations succeed in production**: unified developer surfaces (SDKs and APIs), multi-provider routing, and reliable EVM transaction flows. Comfortable owning technical design discussions, narrowing ambiguous integration problems, and shipping **documentation-friendly** abstractions that other teams can adopt without re-learning chain specifics.

### Fit for partner-facing integration work
- Turns many external integrations into **one stable TypeScript integration layer** so partners and internal teams ship faster with fewer edge cases.
- **Architects SDKs and APIs** (naming, batching, errors, examples) so integrators get clear contracts—not tribal knowledge.
- **Debugs production execution issues** using simulation, retries, structured decoding, and methodical reproduction—then closes the loop with fixes or clearer docs.

## Selected impact
- **Unified multi-provider quote and execution** (LiFi, Jupiter, 1inch, Odos, Mayan, LayerZero, Relay, and related paths) behind a **single integration surface**—the same class of work as onboarding and maintaining diverse partner stacks.
- **Architected flagship TypeScript SDKs** for smart-account and multi-chain execution (Biconomy); standardized modular clients (viem, Safe) to **lower integration complexity** for account and bundler systems.
- **Standardized internal integration layer** (`RouteClient`, `ExecutionManager`) at defi.app so frontend and backend teams share **one execution contract**.
- **Designed ERC-4337-oriented bundler architecture** with parallelized simulation and execution; hardened orchestration with retries and **ABI-backed error decoding** for sponsored and gasless flows.
- **Open-sourced [Statecraft](https://github.com/joepegler/statecraft)**—TypeScript tooling for **deterministic Ethereum integration testing** (typed fixtures, pinned state, isolated runtimes)—supporting clearer developer workflows.
- **Extended intents and solver-related execution** at Enso; shipped 0→1 client and execution stack adjacent to **DEX routing and settlement** problem spaces.

## Experience

### defi.app | Web3 Infrastructure Engineer
May 2025 - Present | Canada
- Own transaction infrastructure and **developer tooling** for a unified cross-chain DeFi product; focus on **integration reliability** and consistent execution behavior across providers.
- Designed trusted transaction orchestration (bundler-style paths) with parallelized simulation and execution and **actionable error surfaces** for integrators and operators.
- **Unified multi-provider routing** behind one API so product teams do not maintain one-off partner integrations per venue.
- **Standardized the TypeScript SDK layer** used across frontend and backend for quotes, routes, and execution—reducing cross-team friction and duplicate integration logic.
- Architected EVM and Solana simulation and sponsorship infrastructure, including validation paths for sponsored transaction safety.

Tech stack: TypeScript, Node.js, viem, EVM, Solana, PostgreSQL, NestJS

### Biconomy | Lead SDK Engineer
Dec 2023 - May 2025 | Dubai
- Led the **core developer SDK** for smart accounts and multi-chain transaction execution; owned **public API shape** and developer experience for integrators.
- **Architected the flagship TypeScript SDK from zero** and led API design for account-abstraction execution flows (batching, composability, typed errors).
- Implemented EIP-712 and EIP-1271 signing with P-256 passkey support for **keyless and gasless** flows—common integration requirements for modern wallets and apps.
- Standardized viem-based modular clients with Safe support so teams could integrate **accounts, bundlers, and policies** without bespoke glue code.
- Raised production readiness with **typed errors**, composable batching, and CI coverage (Vitest, Bun, GitHub Actions, Codecov).

Tech stack: TypeScript, Node.js, viem, ERC-4337, Safe, Vitest

### Enso | Lead Web3 / dApp Developer
Jul 2021 - Nov 2023 | Zurich
- Delivered Enso’s client dApp and **transaction execution stack** end-to-end—from product UX to backend services—**translating protocol behavior into shippable product**.
- Built and maintained a **Graph-based indexing pipeline** consumed by product and backend teams for **on-chain data integrations**.
- Extended **intents and solver infrastructure** for decentralized trade execution (routing and settlement-adjacent work).

Tech stack: TypeScript, Node.js, EVM, Graph Protocol, Solidity, React

### CoinFLEX | Head of UI/UX
Aug 2019 - Jul 2021 | London
- Led the exchange trading interface in a **high-stakes, real-time** environment; partnered with stakeholders on delivery and **operational quality**.
- Automated CI/CD for the interface stack to improve **release safety** and velocity on a live trading platform.

Tech stack: TypeScript, React, Node.js, CI/CD, GitHub Actions

## Earlier experience
- GameAnalytics, Lead Frontend Developer (2016–2019): led a team of five, defined frontend architecture and standards, company MVP 2018/19.
- FSI, Healthcare 21, and Nixatel (2013–2016): enterprise and greenfield products in small teams.

## Education
University College Cork, M.Sc. Computer Science (First Class Honours), 2012–2014

## Skills (aligned to role)
- **Integrations & APIs:** multi-provider routing, REST/JSON and SDK-first patterns, versioning and breaking-change discipline, typed errors
- **Ethereum / EVM:** account abstraction (ERC-4337), transaction simulation, EIP-712 / EIP-1271, viem, Solidity (production-adjacent at Enso)
- **Languages:** TypeScript, JavaScript, Node.js; Solidity where smart-contract context is required
- **Developer experience:** SDK architecture, examples and internal docs as part of shipping, CI for libraries (Vitest, GitHub Actions)
- **Cross-functional delivery:** product, frontend, backend, and infrastructure touchpoints on execution-critical systems
