# Pegler Web Services

This repository contains the source code for the Pegler Web Services company website.

## Overview

Pegler Web Services provides specialized Web3 development and consulting services including:

- SDK Development
- Smart Contract Integration
- Developer Experience Audits
- Technical Documentation

## Website

The website is built with vanilla HTML, CSS and JavaScript and is hosted via GitHub Pages.

## Local Development

To run the site locally:

1. Clone this repository
2. Either open `index.html` in your browser, or run `npm run dev` and visit `http://localhost:3000` (clean URLs resolve to directory routes like `/blog/` and `/resume/`)

## Deployment

The site is automatically deployed to GitHub Pages whenever changes are pushed to the main branch.

All internal links use extensionless directory URLs (e.g. `/resume/`, `/blog/`, `/blog/post-slug/`) so the site works on GitHub Pages without server rewrites. Each route maps to an `index.html` file inside its folder. For local dev, `npm run dev` still uses `serve` and `serve.json` for convenience, but production behavior is driven by the generated folder structure.

Last updated: 2025-05-01 23:04:56

## Contact

For inquiries, reach out to pegler.web.services@gmail.com 