---
title: "The Session-Key Fork: EIP-8141 Makes Interoperable Sessions Possible. EIP-8130 Makes Them Probable."
date: 2026-08-24
summary: EIP-8141 makes proper interoperable sessions possible. EIP-8130 makes them probable.
slug: eip-8141-sessions-possible-eip-8130-probable
image: /assets/blog/eip-8141-eip-8130/og.png
imageAlt: "The Session-Key Fork: EIP-8141 Makes Interoperable Sessions Possible. EIP-8130 Makes Them Probable."
---

[Part two](https://peglerweb.services/blog/eip-7702-part-2-erc-7902-escape-hatch/) ended with Charlie Munger's line:

> "Show me the incentive and I will show you the outcome."

Its conclusion was that EIP-7702 made EOAs programmable without making that programmability dependable across wallets. ERC-7902 offers an escape hatch, but only if wallets rationally choose to support overlapping account implementations.

That leaves a harder question. Should Ethereum standardise transaction machinery and ask wallets to reconstruct a common account model above it, or should authority itself become visible and shared?

[EIP-8130](https://eips.ethereum.org/EIPS/eip-8130) and [EIP-8141](https://eips.ethereum.org/EIPS/eip-8141) draw that boundary differently. Both can support sessions, but they do not leave the same work undone. EIP-8141 makes custom authority a decision of account validation code. EIP-8130 makes actor authority a protocol-visible mapping and keeps it separate from execution.

Neither draft gives dapps a finished API. EIP-8130 still needs a common wallet grant interface, policy vocabulary and caller-preserving policy path. But that is a smaller last-mile problem than the shared authority model and wallet coordination EIP-8141 leaves open.

I entered this comparison attached to neither architecture, armed only with one practical frame: `supercooldapp.xyz` has to serve `whateverWalletShowedUp`. Which proposal makes one scoped session over the user's existing EOA something the dapp can depend on?

## The disagreement in one exchange

A recent exchange between [Chris Hunter](https://x.com/_chunter/status/2090848665812242635), the author of EIP-8130, and [lightclient](https://x.com/lightclients/status/2090862398928552188), one of the authors of EIP-8141, captures the philosophical split.

Hunter argues that a native account-abstraction standard should be judged by whether it serves chains, wallets, apps and users together. Portability and a common account model are explicit design goals.

Lightclient's objection is that "half of 8130 is application-layer specifics that shouldn't be defined in the protocol." EIP-8141 instead preserves permissionless innovation by allowing wallets and users to supply arbitrary validation logic.

The strongest version of that position is straightforward: cross-wallet session convergence is not a consensus-layer success criterion. The protocol should make arbitrary account validation possible, then let wallets and ERCs compete over the product model above it. That is a coherent boundary.

My disagreement is that, once native account abstraction is judged by what applications can depend on, exporting that convergence problem is itself an architectural choice. EIP-8141 still enshrines a model in which the sender's account code decides which authentication carries authority. What the protocol declines to standardise must be settled by wallets, or remain fragmented.

## The test

Part two introduced `supercooldapp.xyz` and `whateverWalletShowedUp`. The dapp should request a narrow session over the user's existing EOA, have the wallet display and approve it, then act within those limits without prompting for every interaction.

The dapp should hold only the restricted session key. There should be no companion account, embedded wallet or separate pool of funds. The same integration should work across the major external wallets.

That gives us one test:

> Can a dapp request, receive, exercise and revoke the same scoped session permission over an existing EOA across the major external wallets?

## What EIP-8141 standardises, and what it exports

EIP-8141 introduces frame transactions. `VERIFY` frames approve execution; subsequent `SENDER` frames call directly as the user's account. Codeless EOAs gain a default path for ordinary signatures, batching and sponsorship, but not for recognising a session actor or its limits.

That freedom is the attraction. Enshrine a general transaction mechanism once, then let EVM code absorb future validation schemes without repeatedly changing consensus. Somebody must still define how a session key is installed, where its authority lives, how its limits and revocation are encoded, and how a wallet requests and displays the grant.

Frames may be straightforward for a wallet to submit. The hard work is agreeing on the contracts, permission semantics, discovery, RPC methods and presentation that turn a generic Frame into the same session feature across wallets. The relevant complexity is not implementing a Frame transaction. It is agreeing what a session means. EIP-8141 exports that product coordination to wallets.

Protocol-defined default paths can be evaluated directly. A custom session path is different: a `VERIFY` frame executes the sender account's code, which decides whether to call `APPROVE`. Public-mempool nodes must simulate that validation prefix and enforce trace, opcode and storage-dependency rules. The protocol sees approval, but not a stable actor or grant shared across account implementations.

Approval is valid only when the approving frame resolves to the sender account. A standalone app policy contract cannot approve arbitrary calls for somebody else's EOA. The account's code, its 7702 delegate or a trusted module must participate. An app contract works when activity terminates there, but not by itself for arbitrary `SENDER` calls as the EOA. Public-mempool rules also restrict storage reads outside `tx.sender`, making a shared external registry awkward without an exception or precompile.

The likely response is rational divergence. MetaMask can adapt its Delegator contracts and caveat system. Ambire and other account teams can adapt their own validators and modules. The protocol succeeds, while dapps face different grant requests, policy encodings and revocation paths behind the same frame transaction.

EIP-7702 is the relevant precedent. Wallets chose account implementations they controlled and understood. EIP-8141 removes none of those incentives. They were free to coordinate after EIP-7702 too.

> EIP-8141 standardises the transaction envelope. It exports the account model.

## What EIP-8130 changes: the account model

Ethereum's original EOA model kept authority in the protocol through a single intrinsic mapping from a secp256k1 key to an account. EIP-7702 added wallet execution code without moving that root authority into the wallet bytecode. EIP-8130 generalises the mapping from one key to multiple actors and authentication schemes.

```text
execution       -> wallet bytecode
authentication  -> declared authenticator
authority       -> protocol-visible actor configuration
```

The transaction names an authenticator. That authenticator resolves an actor, then the protocol loads the actor's configuration, expiry and scope from the shared Keystore. Canonical authenticators can be recognised directly; accepted non-canonical authenticators use a single bounded `STATICCALL`. Execution remains wallet-defined, but authority no longer has to be rediscovered inside each wallet's validation code.

A restricted actor can be bound to a policy manager and opaque commitment. That gives installation, expiry, revocation and replay protection a shared home. What is missing is the wallet-facing grant request, a common permission vocabulary and a caller-preserving policy executor. Under the current `POLICY` gate, an ordinary manager enforces the action but downstream calls come from the manager rather than the user's EOA.

In a discussion with me about this use case, Hunter described a possible canonical policy precompile that could validate the commitment and make approved downstream calls as the account, without routing through or replacing the wallet's existing 7702 delegate. That is a contemplated extension, not part of the current specification, but it shows how the model could pass the `whateverWalletShowedUp` test:

- The wallet signs a standard actor grant.
- The keystore records the session key, expiry and policy commitment.
- A canonical policy path enforces the permission and executes permitted calls as the user's existing account.

Crucially, this 8130 session path would not run through MetaMask's Delegator, Ambire's account code or any other wallet-specific delegate. Those implementations could remain in place for the wallets' other 7702 features, while 8130 handled session authority and the canonical policy path executed the session independently. Wallets would still need to expose and display the actor grant and let the user sign it, but they would not need to modify or replace the 7702 implementations they had already deployed.

> EIP-8141 asks account code whether a transaction is authorised. EIP-8130 asks who acted, then lets the protocol decide whether that actor has authority.

## What cannot be pushed into an ERC

Not every mechanism in EIP-8130 belongs in Ethereum's permanent protocol surface. Permission languages should evolve. But the actor and authority mapping is not merely an application interface. It is the minimum shared object EIP-8141 lacks.

An ERC layered over Frames could make grants look similar to dapps. It could not make authority visible to clients or remove EIP-8141's code-mediated validation. Wallets would still need to agree that their different implementations gave the interface the same meaning. An ERC could hide fragmentation without eliminating it.

The ossification objection still matters. Wallet design will evolve, and every consensus rule adds maintenance. The task is to find the smallest durable authority layer that creates more interoperability than ossification risk.

Non-enshrinement is not neutral at the product layer. It transfers decisions to wallet teams with rational reasons to diverge. Protocol optionality becomes dapp complexity.

The choice is not enshrinement versus none. EIP-8141 already makes durable choices about Frames, approval scopes, default-account behaviour and expiry. A better boundary is a stripped-back EIP-8130-shaped authority mapping in Core, with changing permission semantics above it.

The native authority layer should define:

- actor identity and authorisation by the account's root authority;
- installation, expiry, revocation and replay protection;
- binding to a policy manager and opaque commitment;
- an execution path that preserves the existing account as the caller.

Separate ERCs should define:

- spending limits, targets, functions and argument constraints;
- recurring periods and subscription semantics;
- wallet RPC, discovery and human-readable presentation.

This cannot be only a common RPC envelope. If each wallet gives the actor, policy or revocation a different meaning behind the same method name, the fragmentation has merely been hidden. Concrete permissions can evolve. The session lifecycle should not have to be rediscovered by every wallet.

> EIP-8141 standardises the verbs: verify, approve and send. A native authority layer standardises the nouns: actors, grants and revocations. ERCs can define the adjectives: under 50 USDC, until Friday, and only for this contract.

## Possibility versus probability

Protocol adoption is only the first hurdle. EIP-8141 may clear it more easily, but a shared authority model must then be invented and exposed consistently by wallets. EIP-8130 asks for a harder consensus decision. If it lands, however, the shared actor model already exists. Wallets still need to expose the grant, but they are no longer inventing what the grant is.

This is why I keep arriving at the same shorthand:

> EIP-8141 makes proper interoperable sessions possible. EIP-8130 makes them probable.

That difference changes what I would actually build. After EIP-8141 alone, I would still expect an embedded smart account with a separate asset boundary to be the simplest dependable session experience across `whateverWalletShowedUp`, despite the extra transfer or approval boundary.

With a stripped-back native authority standard built around EIP-8130, I would no longer expect to need that fallback. The dapp could offer the same bounded session over the user's existing EOA, regardless of which compatible wallet arrived.

## Follow the incentives

Munger's test makes the constituencies clearer. These are incentive predictions, not claims about anyone's roadmap.

If I am a dapp developer, I want an EIP-8130-shaped outcome because I pay for every wallet adapter and lose every unsupported customer. Users should want the same permission to mean the same thing wherever they take it.

If I am MetaMask, EIP-8141 is the natural fit. It can adapt its [Delegation Framework](https://docs.metamask.io/smart-accounts-kit/), caveat enforcers and Delegator contracts without surrendering its permission model as a point of differentiation.

If I am a core protocol developer, EIP-8141 is also easier to prefer. It offers a general EVM mechanism and avoids deciding which account concepts deserve permanent consensus status. The product coordination lands with wallets, while the extra integrations land in dapp backlogs.

If I am Base or Coinbase, EIP-8130 is understandable. A portable configuration layer can spread a common application experience beyond one wallet or chain without requiring the same account code everywhere.

Wallets with less sunk cost may be more agnostic. MetaMask is not the only incumbent, though. Rabby and others also have account models and security assumptions they will rationally preserve.

None of these positions is irrational. The architecture decides whose costs are solved and whose are exported.

## My prediction: EIP-8141 wins

If the choice is framed as EIP-8130 or EIP-8141, I expect EIP-8141 to become the de facto winner.

It does not better pass the `supercooldapp.xyz` test. I expect it to win because Ethereum's social governance has centres of gravity, and EIP-8141 sits close to them. Vitalik Buterin is an author, alongside client engineers and established account-abstraction developers. If that group and the core process coalesce, an alternative faces enormous gravitational pull.

No single person can order an EIP into a fork, but influence over the agenda, technical legitimacy and client implementation is not evenly distributed. Technical possibility is permissionless. Hard-fork inclusion is not.

The replacement of EIP-3074 by EIP-7702 is the recent precedent. It does not prove EIP-8141 is right. It shows how EIP-8130 could better pass the dapp test and still lose the L1 transaction contest.

If core developers prefer the cleaner primitive, they should also account for its predictable ecosystem cost. Protocol minimalism can export a known coordination problem to actors whose incentives point away from solving it.

## My conclusion

The `supercooldapp.xyz` test leaves me with a clear boundary. Execution can remain wallet-defined and permission languages can evolve through ERCs, but the actor-authority mapping must be shared. Companion ERCs can improve EIP-8141's surface without giving clients visibility into authority or removing code-mediated validation.

EIP-8141's supporters therefore need to answer one question:

> If rational wallet incentives produced divergent account and session implementations after EIP-7702, what mechanism causes those same wallets to converge after EIP-8141?

The answer cannot simply be another interface standard promised for later. By then wallets may already be shipping incompatible Frame-based account systems. Hope is not a coordination mechanism.

EIP-8130 is unfinished, but it is pointed at the problem the ecosystem needs solved. Its remaining last mile is a common wallet request, shared policy vocabulary and caller-preserving policy path. EIP-8141 supplies the transaction machinery, then asks wallets to agree on the authority model and product semantics that make it useful to dapps.

Put differently, EIP-8130 has built most of the bridge and still needs its final span. EIP-8141 delivers construction materials to every wallet and hopes they independently build bridges that meet in the middle.

> EIP-8141 alone makes wallet-specific sessions easier. EIP-8130 is far closer to what the ecosystem actually needs.

Munger's line points to the same conclusion. Wallets will rationally build systems they control. A shared authority object lets them compete without making every dapp absorb the difference.
