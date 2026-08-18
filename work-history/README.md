# Work history corpus

Curated, git-evidenced bodies of work for resume tailoring. Source repos are symlinked under [`projects/`](../projects/).

## How the resume-tailor skill uses this

1. Read [`resume.json`](../resume.json) for employers, titles, dates, and metrics (canonical).
2. Read [`INDEX.md`](INDEX.md) and match JD keywords (company, product, APIs, domain).
3. Read matching sections in [`bodies-of-work.md`](bodies-of-work.md).
4. Reframe bullets and cover-letter paragraphs using evidenced themes **under the correct `resume.json` employer**.

## Honesty rules

| Rule | Detail |
|------|--------|
| Employers, titles, dates | Only from `resume.json` |
| Metrics ($ volume, npm downloads, success rates) | Only from `resume.json` unless the cited git work clearly supports a new metric (rare; prefer JSON) |
| Extra bullets | Allowed when a theme cites repo paths and commit SHAs **and** maps to an existing `work[]` row. Metadata-only themes (e.g. `markets` with empty git) may inform phrasing but should not add new factual claims beyond what JSON already states. |
| Partner-facing / integration language | Allowed when git evidence shows external provider APIs, proxy endpoints, SDK surfaces, or integrator docs |
| New employers | Forbidden |
| Invented duties | Forbidden |

When the JD asks for something with no INDEX match and no JSON support, omit from the CV or note `Gap: …` in chat.

## Regenerating

Re-crawl authored history in `projects/` (filter: `Joe Pegler`, `joepegler`, `pegler`), then update `INDEX.md` and `bodies-of-work.md`. Do not dump raw `git log` into these files. If a symlink has no git history (e.g. `markets`), document metadata-only evidence and note the limitation.

Last curated: 2026-08-18 (added `markets` scan).
