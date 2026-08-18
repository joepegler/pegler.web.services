---
name: resume-tailor-jd
description: >-
  Tailors Joe Pegler’s resume from pegler.web.services/resume.json to a pasted job URL or JD:
  researches public posting plus employer/developer docs for vocabulary alignment, loads git-evidenced
  themes from pegler.web.services/work-history/ (INDEX + bodies-of-work) to surface JD-relevant
  bullets under existing employers, produces an honest keyword-aware markdown resume (no invented
  roles or duties), optional **References** section from **`resume.json` `references`** when the user
  or JD asks, always generates `tailored-resumes/<project-slug>/Joe.Pegler.pdf` and
  `tailored-resumes/<project-slug>/Joe.Pegler.Cover.Letter.pdf` (same pipeline), then finds a
  LinkedIn person to message so the CV is more likely to get noticed, without linking
  or publishing artifacts on pegler.web.services.
  Use when the user pastes a job description or URL, asks for ATS-aligned resume tailoring,
  cover letters, application PDF generation, CV reframing for a role, LinkedIn outreach,
  a hiring-manager/recruiter to ping, or “tailor resume like CoW.”
disable-model-invocation: true
---

# Tailor resume (+ cover letter) to job description → PDF

## Preconditions

Canonical facts live in [`resume.json`](../../../resume.json) (`pegler.web.services/resume.json` from repo root): employers, dates, highlights, tech stacks, and optional **`references`** (professional contacts with titles and Telegram profiles).

**Personal location:** use **Cork, Ireland** for the tailored resume heading line and anywhere a candidate city/country is needed (prefer `resume.json` `basics.location` when present; it must stay aligned with Cork, Ireland). **`work[].location` is employer or role geography only** (office, HQ region, Remote, etc.). Never treat a job row’s `location` as where *you* are based.

## Workflow

### 1) Ingest JD

- If the user provides a URL, fetch readable text (`WebFetch`, browser tools, or similar).
- Extract: title, responsibilities, required/preferred skills, stack, seniority, team/domain language.

### 2) Research employer docs (short pass)

Before drafting, infer product/protocol context from URL or company name. Open **public** pages only (no login): `docs.*`, `developers.*`, `/documentation`, “For developers,” whitepapers, careers detail if it adds terminology.

Goal: steal **their honest vocabulary** (product names, APIs, concepts) for headline/bullets where it reflects real experience already in `resume.json`.

If nothing useful is found: use posting + homepage only—**do not** invent stack or internal tooling.

### 3) Load canonical resume

- Read **`pegler.web.services/resume.json`** fully. Prefer JSON for every factual claim (employer names, titles, ranges, bullets, `techStack`, `selectedImpact`, `whyHire`, **`references`** when present).
- Optional: if JSON is incomplete or stale for phrasing only, **`pegler.web.services/resume.optimized.md`** or **`resume.recruiter-pack.md`**—never contradict JSON dates/employers.

### 3b) Load work-history corpus

- Read **`pegler.web.services/work-history/INDEX.md`** and match JD terms (company, product, APIs, protocols, domain language from steps 1–2).
- Read matching theme sections in **`pegler.web.services/work-history/bodies-of-work.md`**.
- Use evidenced outcome lines to **reorder and rephrase** bullets under the correct `resume.json` `work[]` employer. Each extra bullet must trace to a corpus theme with repo/path/commit evidence.
- Employers, titles, dates, and metrics still come from **`resume.json`** only (see [`work-history/README.md`](../../../work-history/README.md) honesty rules).
- If the JD matches a corpus theme but not `resume.json`, you may surface it in tailored bullets **only** when the theme’s employer matches an existing `work[]` row.

### 4) Tailor markdown (honest reframing only)

Project folder slug: lowercase, hyphenated from company + short role fragment, e.g. `cow-dao-integration-engineer`.

Write **`pegler.web.services/tailored-resumes/<project-slug>/Joe.Pegler.md`** with structure and section order per [reference.md](reference.md):

- Align **headline/subtitle + opening paragraph** with the role family **only where `resume.json` supports it** (boost with matched corpus themes from step 3b).
- **Reorder bullets** inside each role so JD-relevant outcomes come first; prefer corpus-evidenced lines when they match the JD.
- Rewrite for **JD + doc vocabulary** surfaced on lines that already express that work (integrations, SDKs, EVM execution, reliability, cross-functional delivery, etc.).
- **Skills** section: clusters that echo the JD grouping; keywords must trace to JSON `techStack`, bullets, or matched corpus themes.
- **References** (optional tail section): if the user asks for references on the CV, if the JD or form asks for them, or you use **references available upon request** (see [reference.md](reference.md)). Only include people from JSON **`references`**. Each row: **`name`**, **`position`**, **`company`**, plus **`profiles`** (for example Telegram **`url`** / `@username` from JSON). Invent no other messengers or contact channels.

Forbidden:

- New employers, date changes, fabricated projects, fabricated “partner-facing” duties unless evidenced in JSON, corpus (`work-history/bodies-of-work.md`), or user-provided prose.
- **References:** no people, titles, or companies absent from **`resume.json` `references`**. Do **not** add phone or email unless the user supplied them in chat for that specific draft.
- Editing **`index.html`**, **`resume/index.html`**, or other published site surfaces to advertise this PDF unless the user explicitly requests that in another task.

Gaps:

- Where the JD asks for something missing from JSON **and** the corpus, **omit from resume** or add a brief **Note for applicant** comment in chat (not necessarily in PDF): `Gap: … (not in resume.json or work-history)`.

Keyword check (reply to user briefly after PDF exists):

| JD term → | resume line/bullet (abbreviate) |

Include corpus-backed mappings when they drove a bullet not obvious from `resume.json` alone.

### 4b) Cover letter markdown (required)

Use the **same `<project-slug>`** folder as the resume so pairs line up.

Write **`pegler.web.services/tailored-resumes/<project-slug>/Joe.Pegler.Cover.Letter.md`** with structure per [reference.md](reference.md#cover-letter-markdown-template).

- Ground every claim in **`resume.json`** (roles, impact, stack, **`references`** if mentioned) and matched **`work-history`** themes; same **Forbidden** / **Gaps** rules as the resume: no invented employers, dates, or duties or referees.
- Mirror **JD vocabulary** from steps 1–2 where it honestly matches experience; name the role and company (or team/product from the posting) in the opening.
- **References:** name or cite only people in **`resume.json` `references`**. Omit unless it fits naturally; never invent referees.
- Keep tone direct and professional; one page when printed is the target length.

### 5) Generate PDFs (primary artifacts)

- **Resume:** produce **`pegler.web.services/tailored-resumes/<project-slug>/Joe.Pegler.pdf`** as the CV upload target.
- **Cover letter:** produce **`pegler.web.services/tailored-resumes/<project-slug>/Joe.Pegler.Cover.Letter.pdf`** in the same run.

Implementation: run **`pegler.web.services/.cursor/skills/resume-tailor-jd/scripts/md-to-pdf.sh`** once per markdown file (resume path, then cover-letter path every time)—or follow the identical manual steps in [reference.md](reference.md).

The **`tailored-resumes/`** directory is gitignored; keep generated `.pdf` / `.html` / tailored `.md` there unless the user asks otherwise.

### 5b) LinkedIn notice source (required)

Find **one primary person** plus **1–2 backups** at the employer who can help the application get seen. Goal: a real LinkedIn profile the user can message (connection note, InMail, or DM). **Do not send any message.**

Search public sources first (job post “Posted by,” Google `site:linkedin.com/in`, company People snippets). If a LinkedIn tab is already signed in, use browser tools on company People / posting; **stop at login or CAPTCHA** and keep public hits. Full query ranking, alumni pass, and message templates: [reference.md](reference.md#linkedin-notice-source).

Pick people in this order (skip anyone you cannot name with a URL):

1. Recruiter or hiring manager **named on the posting**
2. Talent / recruiting covering that team or role family
3. Hiring manager / EM for the team in the JD
4. **Alumni**: someone now at the target whose profile mentions a `resume.json` `work[].company` (defi.app, Biconomy, Enso Finance, CoinFLEX) or UCC
5. A well-placed IC on the relevant team (employee referral)

Write **`pegler.web.services/tailored-resumes/<project-slug>/linkedin-outreach.md`**: ranked names, titles, profile URLs, why this person, copy-paste **connection note (≤200 characters)** and a short DM/InMail. Ground the note in the JD + `resume.json` only. Invent no people, titles, or “we know each other” claims.

If nobody public is findable: say so, paste the search queries for the user to run while logged in, and still write the outreach file with a generic “Hiring Team” fallback note.

### 6) Deliver

- Confirm path(s) to **`tailored-resumes/<project-slug>/Joe.Pegler.pdf`** and **`tailored-resumes/<project-slug>/Joe.Pegler.Cover.Letter.pdf`** (and intermediates `.md` / `.html` if kept).
- Confirm **`tailored-resumes/<project-slug>/linkedin-outreach.md`**: primary contact, profile URL, and the copy-paste note. Lead the chat reply with that person so the user can message them immediately.
- Do **not** update `resume.json` unless the user asked to synchronize canonical resume facts (including **`references`**).

## Further detail

Templates, pandoc/chrome args, folder slug rules, work-history corpus, and LinkedIn outreach: [reference.md](reference.md)
