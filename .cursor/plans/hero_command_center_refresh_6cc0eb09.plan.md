---
name: hero_command_center_refresh
overview: Redesign the above-the-fold landing experience into a more visually distinctive command-center hero while keeping the GitHub heatmap as a core element. The plan focuses on stronger hierarchy, better use of your infra/operator positioning, and subtle motion that feels polished rather than gimmicky.
todos:
  - id: audit-hero-content
    content: Map the current hero copy, CTA, and GitHub widget into a new command-center information hierarchy for the first viewport.
    status: completed
  - id: design-hero-layout
    content: Plan a two-column hero with a restored H1, operator proof chips, and a right-side activity panel built around the GitHub heatmap.
    status: completed
  - id: plan-visual-system
    content: Define the CSS/SVG visual system and subtle motion treatment so the hero feels infra-relevant instead of generic dark-theme ambient.
    status: completed
isProject: false
---

# Command-Center Hero Refresh

## Why Change It

The current hero in `[/Users/joepegler/Workspace/pegler.web.services/index.html](/Users/joepegler/Workspace/pegler.web.services/index.html)` is clear but not memorable:

- The landing fold is a centered text stack with one CTA, so it reads more like a placeholder than a differentiated product/operator page.
- The most distinctive asset you already have, the GitHub heatmap, is buried in `About` instead of helping the first impression.
- The visible hero heading is currently missing because the `h1` is commented out, which weakens both hierarchy and SEO.
- The background effects are ambient but generic, so they do not reinforce your actual positioning: bundlers, infra, routing, SDKs, and execution reliability.

```74:85:/Users/joepegler/Workspace/pegler.web.services/index.html
<section class="hero" id="home" aria-labelledby="hero-heading">
    <div class="container">
        <div class="hero-content">
            <!-- <h1 id="hero-heading">I build and scale cross-chain transaction infrastructure from zero to production</h1> -->
            <p>Web3 infrastructure engineer: smart accounts, ERC-4337, and developer tooling on Ethereum. SDKs, bundlers, DeFi integrations, sponsored flows.</p>
            <ul class="operator-summary" aria-label="Key outcomes">
```

## Proposed Direction

Rework the hero into a two-column command-center layout:

- Left side: restore a strong `h1`, tighten the subhead, add 2-3 compact operator/value chips, and keep one primary CTA with one quieter secondary CTA.
- Right side: promote the GitHub heatmap into a hero “activity panel” and pair it with 1-2 supporting cards such as `Current focus`, `Infra shipped`, `Based in Cork / GMT`, or a lightweight route-execution visual.
- Add a custom infra-themed visual layer using CSS/SVG, not stock art: route lines, chain nodes, status dots, faint grid, and transaction-path motifs that feel relevant to ERC-4337 / multi-chain execution.
- Keep motion subtle: soft panel float, tiny pulse on status indicators, slow glow drift, and restrained parallax only on decorative layers.

## Implementation Approach

### 1. Restructure the hero markup

Update `[/Users/joepegler/Workspace/pegler.web.services/index.html](/Users/joepegler/Workspace/pegler.web.services/index.html)`:

- Replace the single centered `.hero-content` block with a split layout such as `.hero-layout`, `.hero-copy`, and `.hero-panels`.
- Move the GitHub contribution widget from `About` into the hero panel area, or duplicate the wrapper in hero and simplify/remove the later version to avoid repetition.
- Add concise proof points that feel operational, for example: `ERC-4337`, `Multi-chain execution`, `SDKs shipped`, `Infra & DevEx`.
- Add a secondary action like `View case studies` so the fold offers both contact and proof.

### 2. Rebuild hero styling around a dashboard composition

Update `[/Users/joepegler/Workspace/pegler.web.services/styles.css](/Users/joepegler/Workspace/pegler.web.services/styles.css)`:

- Replace center-aligned hero rules with a responsive split layout and stronger asymmetry.
- Introduce hero-specific panel styles so the GitHub card, status chips, and supporting cards look intentionally designed rather than reused from lower sections.
- Add decorative CSS/SVG layers: faint grid, diagonal route lines, node clusters, localized glow, and a better depth stack behind the content.
- Tighten scale and spacing so the first viewport reads as premium and dense enough to feel substantive without becoming cluttered.
- Ensure mobile collapses to a clean single-column order with the heatmap still visible early.

### 3. Refine motion and remove generic/duplicated effects

Review `[/Users/joepegler/Workspace/pegler.web.services/script.js](/Users/joepegler/Workspace/pegler.web.services/script.js)`:

- Keep reveal timing and mild parallax where useful, but reduce any effects that feel randomly decorative.
- Scope motion to the hero visual system so it reinforces the command-center concept instead of moving every section equally.
- Clean up duplicate ambient background injection if needed, since the HTML already includes background elements and the script prepends them again.

```1:5:/Users/joepegler/Workspace/pegler.web.services/script.js
// Add background elements to the DOM
document.addEventListener('DOMContentLoaded', () => {
  // Create background elements
  setupBackgroundEffects();
```

## Creative Elements To Use

These are the strongest visual ideas for this redesign:

- A `Live activity` panel wrapping the GitHub heatmap as if it were part of an operator console.
- A small “execution path” graphic made from CSS or inline SVG showing quote -> simulate -> route -> execute.
- Metric chips like `10+ years`, `4337`, `EVM + Solana`, `SDKs / bundlers / DevEx` to create quick scan value.
- Subtle scan-line, grid, or node-link textures instead of generic starfield ambience.
- Optional tiny company/logo strip or role badges if the fold needs more trust without adding more paragraphs.

## Success Criteria

The new hero should:

- Feel distinctive within 2 seconds of landing.
- Surface your strongest proof immediately, especially the GitHub activity widget.
- Read as infra/operator-focused rather than generic personal-site copy.
- Stay performant and professional, with subtle motion only.
- Still work cleanly on mobile without losing hierarchy.
