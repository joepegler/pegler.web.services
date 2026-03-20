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
2. Either open `index.html` in your browser, or run `npm run dev` and visit `http://localhost:3000` (with optional clean URLs like `/blog` and `/resume` via `serve.json`)

## Deployment

The site is automatically deployed to GitHub Pages whenever changes are pushed to the main branch.

All internal links use explicit `.html` URLs (e.g. `resume.html`, `blog/index.html`, `blog/post-slug.html`) so the site works on GitHub Pages without any server rewrites. For local dev, `npm run dev` uses `serve` and `serve.json` to allow extensionless URLs like `/blog` and `/resume`; production relies only on the `.html` links.

Last updated: 2025-05-01 23:04:56

## Contact

For inquiries, reach out to pegler.web.services@gmail.com 