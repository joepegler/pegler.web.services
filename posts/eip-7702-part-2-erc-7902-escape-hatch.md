---
title: "EIP-7702 Part 2: The ERC-7902 Escape Hatch"
date: 2026-08-23
summary: Wallets do not need to agree on one smart account if dapps can request a reviewed execution environment that wallets are willing to authorize.
slug: eip-7702-part-2-erc-7902-escape-hatch
image: /assets/blog/eip-7702-part-2/og.png
imageAlt: "EIP-7702 Part 2: The ERC-7902 Escape Hatch"
---

Wallets do not need to agree on one smart account. ERC-7902 matters because it could let them disagree without making that disagreement every dapp's integration problem.

In [part one](https://peglerweb.services/blog/eip-7702-dapp-interoperability/), I argued that EIP-7702 can reasonably be considered a success for wallets while still falling short of the interoperability dapps need for sessions.

The problem is simple. A wallet can make an existing EOA programmable through 7702, but a dapp still gets whatever wallet and account implementation the user happens to bring. If a useful capability exists only inside one implementation, it has not yet become a dependable capability of the wider wallet platform.

[ERC-7902](https://eips.ethereum.org/EIPS/eip-7902) offers an escape hatch. Through an EIP-5792 capability called `eip7702Auth`, a dapp can request that an EOA delegate to a particular account implementation, while the wallet decides which implementations it is prepared to authorize.

That is a smaller coordination problem than asking every wallet to adopt the same account. It is also something the ecosystem can try with today's protocol stack. EIP-7702 is already live and EIP-5792 already provides the wallet capability surface. ERC-7902 remains a Draft and major external wallets do not broadly expose it today, but another Ethereum hard fork is not the blocker for this path.

## What success looks like for a dapp

Imagine I run supercooldapp.xyz.

A user arrives with whateverWalletShowedUp. Perhaps 60% of my users arrive through MetaMask and the remaining 40% through Rabby, Ambire or something else. This is an illustrative split, not a wallet-market-share estimate. The exact split is not important. I cannot choose which wallet arrives.

If the experience only works through MetaMask, I am degrading it for the other 40%, turning those users away or asking them to adopt a different account model first.

For sessions, the experience I want is:

1. The user connects their existing EOA through whateverWalletShowedUp.
2. My dapp generates a narrowly scoped session key.
3. Their wallet shows what that key may do, including targets, functions, spending limits and expiry.
4. The user approves the session once using their existing wallet.
5. supercooldapp.xyz can now act within those limits without summoning whateverWalletShowedUp for every interaction.

I want to implement that once against a shared interface and have it work regardless of which major external wallet arrives. There should be no companion account or separate pool of funds. The dapp should hold only the restricted session key, while the external wallet remains the root authorization, recovery and revocation boundary.

Sessions are a useful test because they can do for onchain interactions something like Amazon's one-click purchase did for checkout: turn repeated friction into one bounded authorization. A trading application might let one router spend up to 50 USDC per day for a week; a game might allow low-value moves without another confirmation; an automation might act while the user is offline. The user authorizes once, then the dapp acts only inside that envelope.

That gives me a concrete interoperability test:

> Can a dapp request, receive and use the same scoped session permission over an existing EOA across the major external wallets?

ERC-7902 is not that final session interface. It is useful in the gap before such interfaces converge: the dapp can request an execution environment whose session model it already understands.

## What ERC-7902 adds

EIP-7702 lets an EOA delegate its execution to deployed smart-account code. [EIP-5792](https://eips.ethereum.org/EIPS/eip-5792) gives dapps a common API for discovering wallet capabilities and submitting calls. ERC-7902 adds account-abstraction capabilities to that 5792 surface, including `eip7702Auth`.

In simplified form:

```ts
eip7702Auth: {
  account: "0xUserEOA",
  delegation: "0xReviewedImplementation",
}
```

The dapp names the EOA and the implementation it wants. If the wallet supports the capability and accepts that implementation, it supplies the corresponding EIP-7702 authorization.

ERC-7902 says wallets should maintain a strict shortlist of well-known, publicly audited account implementations rather than sign arbitrary delegation addresses supplied by websites. The application can participate in account selection, but the wallet keeps the veto.

For dapps, the useful property is overlap. MetaMask, Rabby and Ambire could keep different account implementations as their defaults while independently approving one mature session-capable implementation for `eip7702Auth`. supercooldapp.xyz could then build one session path against that implementation and request it when any of those wallets arrives.

Several serious account stacks already provide versions of the capability we care about. [Kernel's EIP-7702 flow](https://docs.zerodev.app/get-started/eip-7702/quickstart) can attach Kernel functionality to an EOA and support session keys. [Biconomy's Smart Sessions](https://docs.biconomy.io/sdk-reference/sessions) provide fine-grained policies with EIP-7702 delegate mode for Nexus-based accounts. [MetaMask's Delegation Framework](https://docs.metamask.io/smart-accounts-kit/guides/advanced-permissions/execute-on-metamask-users-behalf/) provides another sophisticated permission model.

A wallet reviewing one of these would need to approve a particular deployment, audit scope, upgrade model and migration path rather than a brand name. If several wallets independently approved the same mature implementation, the dapp could build against one known environment while the user kept the EOA they already own.

Longer term, standards such as [ERC-7715](https://eips.ethereum.org/EIPS/eip-7715) and [ERC-7710](https://eips.ethereum.org/EIPS/eip-7710) aim closer to the interface the dapp actually wants: request a permission through the wallet and redeem it through a common onchain surface. If wallets converge on useful permission semantics, the dapp should stop caring whether Kernel, Nexus, Delegator or something else sits underneath.

ERC-7902 is interesting during the interval before that convergence.

## Wallets can disagree. They still have to cooperate.

The coordination problem may be smaller, but coordination is not automatic.

Kernel, Nexus, MetaMask's Delegator framework and other account systems make different choices around validation, recovery, upgrades, permissions and trust assumptions. Wallet teams have invested heavily in those systems and the products built around them. Even if another delegate can be supported safely, making account implementations interchangeable may offer the wallet little direct upside.

ERC-7902 itself is useful evidence here. Its authors, Yoav Weiss, Alex Forshtat, Dror Tirosh and Shahaf Nacson, are all co-authors of [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337), and all four are also among the authors of [EIP-8141](https://eips.ethereum.org/EIPS/eip-8141). Yet, as of August 2026, I could not verify a public `eip7702Auth` surface across the major independent consumer wallets discussed in part one.

There are reasonable explanations. ERC-7902 remains a Draft. Wallets may be waiting for specification stability, audits, migration tooling and evidence of demand. [Alchemy's Wallet APIs](https://www.alchemy.com/docs/wallets/transactions/using-eip-7702) already show that the capability can coexist with a strict allowlist: they expose `eip7702Auth` while currently accepting only Alchemy's own Modular Account v2 delegation address.

That may also be the privately rational shape for a wallet. If I already have a delegate with my own session, recovery and sponsorship stack, approving several external implementations means taking on security and support costs while making the account layer I built less differentiated. Supporting only my own implementation is safer, simpler and preserves the wallet's differentiation around those features.

A wallet does not need to be hostile to interoperability for the incentives to point that way. The plumbing can exist while the useful overlap never appears.

## Redelegation has a real cost

There is also a good technical reason for wallets to prefer the simpler path.

An EOA has one active 7702 delegation on a chain. If the account currently points to the wallet's implementation and the user authorizes Kernel, Nexus or another implementation, the new authorization replaces that pointer. Wallet-native batching, sponsorship, recovery or permissions may depend on the implementation being replaced, and switching back is another security-sensitive transition.

Persistent storage makes this harder. Delegated code executes in the EOA's context, so changing the delegate does not remove state written by the previous implementation. EIP-7702 treats changing delegation as security-critical because unrelated storage layouts can collide.

[ERC-7779](https://eips.ethereum.org/EIPS/eip-7779) gives delegated accounts machinery to identify themselves, report the storage namespaces they have used and optionally prepare for redelegation. That can make an approved transition less opaque and gives implementations a common way to cooperate with migration tooling.

But 7779 also illustrates how large a can of worms a wallet is volunteering to open. Cleanup is best-effort, some state may be difficult or impossible to remove, and the wallet still needs to understand the implementations and transitions it supports. [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702) adds another awkward edge: a processed delegation is not rolled back merely because later transaction execution fails, so the wallet must handle cases where the new delegate is installed but its intended initialization or session setup is not.

For a wallet, the comparison can therefore be stark. It can review, simulate, explain and support migrations among several dapp-requested implementations, or authorize only the delegate it already knows and controls. ERC-7779 makes redelegation more tractable; it does not make the first option strategically attractive.

## What happens without overlap

If a shared session surface has not arrived and wallet shortlists do not overlap, supercooldapp.xyz has three familiar options:

1. Support one wallet's permission model and give only those users the full experience.
2. Integrate several account and session systems independently.
3. Introduce a companion or application-controlled smart account whose behaviour the dapp can depend on.

The first fragments the product. The second fragments the engineering. The third fragments the user's account.

The integration matrix quickly grows beyond a set of wallet logos:

`wallet × version × chain × delegate × permission model × relayer path`

Those paths can differ in capability discovery, policy encoding, signatures, execution, revocation, simulation and failure modes. Because they ultimately control user funds, each path becomes security-sensitive infrastructure that has to be maintained.

A companion account restores consistency, but at the cost of another account boundary. Assets or allowances may need to move into it, the dapp may need deployment and sponsorship infrastructure, and the product then has to explain or hide the additional address underneath the experience.

That engineering can be worthwhile. It is still an odd outcome when the user's existing EOA has already been made programmable by the protocol. Much of the application-layer work ends up recreating consistency around a second programmable account because the dapp cannot depend on the programmability of the first one.

## Just because the ecosystem could coordinate does not mean it will

There is a slightly uncomfortable game-theory problem underneath all of this.

Wallet teams are rationally incentivized to make their own account stack excellent. Approving interchangeable third-party delegates adds audit, migration and support costs, and can commoditize features the wallet has spent years building.

Dapp teams are rationally incentivized to reach as much of the market as possible. A beautiful session flow that works for only part of the wallet market is often less useful than a worse interaction that works for everyone. Until wallet coverage exists, the dapp has good reason to fall back to another signature, multiple adapters or an account it controls.

Protocol developers face the mirror image of the same problem. Ethereum should be cautious about embedding today's preferred wallet semantics into consensus. [EIP-8141](https://eips.ethereum.org/EIPS/eip-8141), for example, provides powerful native account-abstraction primitives while leaving account behaviour, including the shape of session policies, largely to higher layers. That restraint reduces the risk of ossifying the wrong abstraction, but it also pushes the developer-experience coordination problem upward.

Users cannot solve any of this. They choose a wallet, arrive at a dapp and get whatever intersection of capabilities the other actors happened to produce.

None of those decisions are unreasonable. Taken together, though, they can produce an equilibrium in which the EOA is programmable, sophisticated permission systems exist, and the user still clicks through another wallet prompt because nobody has sufficient individual incentive to make the capability portable.

This is why the lack of broad `eip7702Auth` adoption is interesting rather than merely disappointing. The protocol plumbing exists. The standard exists. Serious account implementations exist. ERC-7779 is addressing some of the redelegation machinery. Another hard fork is not required to try this route.

What remains is coordination, and coordination has to survive the incentives of the people being asked to do the work.

Charlie Munger's line applies neatly here: **"Show me the incentive and I will show you the outcome."**

EIP-8130 and EIP-8141 take different approaches to how much of account abstraction should be made explicit at the protocol layer, particularly around restricted authority and sessions. That comparison deserves a separate article. For ERC-7902, the more immediate lesson is simpler: just because the ecosystem could expose an interoperable capability does not mean the ecosystem will.

EIP-7702 made the EOA programmable. Whether applications can depend on that programmability may ultimately have as much to do with incentives as with protocol design.
