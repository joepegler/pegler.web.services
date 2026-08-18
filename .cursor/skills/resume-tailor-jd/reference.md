# Reference: JD tailoring + PDF pipeline

## Markdown output template

Use **`pegler.web.services/tailored-resumes/resume.<slug>.md`**. `<slug>`: lowercase ASCII, hyphens, company + condensed role (`acme-protocol-senior-typescript`). Keep tailored outputs under **`tailored-resumes/`** (gitignored).

Suggested section order:

1. **H1**: Full name  
2. **One line**: **Cork, Ireland** (candidate residence; from `resume.json` `basics.location` when set) · site · GitHub · LinkedIn (URLs from `resume.json` basics). Do **not** copy `work[].location` here—it describes jobs, not where you live.  
3. **H2**: Role-aligned headline (not necessarily exact JD title; must be defensible from JSON summary/roles)  
4. **Paragraph**: 2–4 sentences bridging JD vocabulary to JSON-backed themes  
5. **H3** *Why hire / Role fit*: 3 bullets mapping JSON `whyHire` + JD themes  
6. **H2** *Selected impact*: 4–7 bullets synthesized from `selectedImpact` (+ work highlights); lead with JD-relevant wins  
7. **H2** *Experience*: for each JSON `work` entry (sorted newest first — match `resume.js`/site ordering): company + title, dates, location, bullets, **Tech stack** line from JSON `techStack`  
8. **H2** *Earlier experience* / *Education*: from JSON `education`, `additionalWorkExperience` fields if present  
9. **H2** *Skills*: grouped headings echoing JD clusters; each bullet must tie to JSON  
10. **H2** *References* (optional): last section when the user asks or the JD requests referees—either brief **professional references available on request.** (names omitted) **or** a full list built **only** from **`resume.json` `references`**. Omit for ATS-first uploads unless the user or JD wants names.

---

## Canonical `references` shape (`resume.json`)

When **`references`** exists, each element should include **`name`**, **`position`**, **`company`**, and **`profiles`** (same pattern as **`basics.profiles`**). Today contacts use **Telegram**: **`username`** and **`url`** (typically `https://t.me/<username>`).

Suggested markdown rows (adapt names/titles verbatim from JSON only):

```markdown
## References

**Ajdin Kahrovic**, Engineering Manager · defi.app — Telegram [@ajdin_kahrovic](https://t.me/ajdin_kahrovic)  
**Mislav**, VP Product · biconomy — Telegram [@oxshaman](https://t.me/oxshaman)
```

Tie referees only to overlaps with **`resume.json` `work`** when useful (same employers). Prefer **privacy**: if the JD does not ask, a single closing line **Professional references available on request.** is acceptable **without** listing handles; when listing, use JSON only.

## Keyword matrix (post-draft)

Paste a short table in the chat (not required inside the PDF):

| JD phrase | Resume location (section / first words) |

Only include mappings where JSON or work-history corpus supports the capability.

Include a second row when a corpus theme drove a bullet not obvious from `resume.json` alone: `corpus: <theme-id>`.

## Cover letter markdown template

Use **`pegler.web.services/tailored-resumes/cover-letter.<slug>.md`**. Reuse the **same `<slug>`** as `resume.<slug>.md` so filenames pair naturally.

Suggested structure (markdown):

1. **Date** (optional first line; use application date if known, else plain text date).  
2. **Recipient block** if the posting names a hiring manager or “Dear Hiring Team” style line is enough: keep generic when the addressee is unknown.  
3. **Opening**: role title + organization (from JD), one or two sentences on fit, tied to JSON-backed themes.  
4. **Body**: 2–3 short paragraphs—specific problems the JD emphasizes, mapped to real outcomes/tools from `resume.json` and matched `work-history` themes (no new facts). Echo their product/protocol vocabulary where accurate.  
5. **Closing**: brief thanks, standard sign-off, **Joe Pegler** on its own line; repeat **site / GitHub / LinkedIn** on one line if useful (URLs from `resume.json` basics). Optionally one line **References available upon request** or a short JSON-backed sentence naming referees (see **`references`** in `resume.json`); invent no referees.

Generate **`cover-letter.<slug>.pdf`** with the same script as the resume:

```bash
pegler.web.services/.cursor/skills/resume-tailor-jd/scripts/md-to-pdf.sh pegler.web.services/tailored-resumes/cover-letter.ACME-role.md
```

## Honesty rules

| Situation | Action |
|-----------|--------|
| JD asks for skill not in JSON | Check `work-history/INDEX.md`; if a theme matches an existing employer, use corpus bullets; else omit or gap in chat |
| Reframing “partner/integration” vibe | Allowed when JSON, corpus, or both describe external-provider APIs, proxy endpoints, SDKs, or integrator docs |
| Extra bullets beyond JSON highlights | Allowed when `work-history/bodies-of-work.md` cites repo/path/SHA under the same `work[]` employer |
| Inflating title | Forbidden—use JSON `position` strings |
| Referees | Only **`resume.json` `references`**. Use **`name`**, **`position`**, **`company`**, Telegram from **`profiles`**. Do not invent email/phone unless the user provided them |

## Work-history corpus

Before tailoring, load:

1. [`work-history/INDEX.md`](../../../work-history/INDEX.md) — JD keyword → theme id  
2. [`work-history/bodies-of-work.md`](../../../work-history/bodies-of-work.md) — evidenced outcomes per employer  

Honesty rules: [`work-history/README.md`](../../../work-history/README.md). Source repos: [`projects/`](../../../projects/).

## Do not publish

Never add links to **`tailored-resumes/resume.<slug>.pdf`**, **`tailored-resumes/cover-letter.<slug>.pdf`**, or similar in [`index.html`](../../../index.html), [`resume/index.html`](../../../resume/index.html), or deploy config unless explicitly requested separately.

## LinkedIn notice source

After PDFs exist, find someone at the employer the user can message so the CV is more likely to be opened. Output: **`tailored-resumes/<project-slug>/linkedin-outreach.md`**. Never send the message from the agent.

Candidate LinkedIn: `https://linkedin.com/in/joe-pegler` (`resume.json` `basics.profiles`).

### Search order

Run these as **WebSearch** (and fetch posting HTML) before any logged-in LinkedIn UI:

1. Recruiter named on the JD / Greenhouse / Ashby / Lever “Posted by” line.
2. `"<Company>" (recruiter OR "talent acquisition" OR "talent partner") site:linkedin.com/in`
3. `"<Company>" ("<team or product from JD>") ("engineering manager" OR "head of" OR "hiring manager") site:linkedin.com/in`
4. Alumni (high leverage): `"<Company>" ("defi.app" OR Biconomy OR "Enso Finance" OR CoinFLEX OR "University College Cork") site:linkedin.com/in`
5. `"<Company>" ("<role family, e.g. integrations OR partner APIs>") site:linkedin.com/in`

If browser tools can open LinkedIn **already signed in**: company **People** filter for Recruiter / the JD team; open the posting for the poster. Stop immediately on login, CAPTCHA, or “join to view.” Do not scrape search result lists beyond a handful of named profiles.

Prefer **current employees**. Discard consultants, spammy “open to work” posters at unrelated firms, and anyone whose company does not match.

### Rank and pick

| Priority | Who | Why message them |
|----------|-----|------------------|
| 1 | Named on the posting | They own the req |
| 2 | TA / recruiter for that org or role family | They can surface the application |
| 3 | EM / hiring manager for the team | They decide |
| 4 | Alumni from `work[]` or UCC now at target | Warm-ish; easier reply |
| 5 | IC on the relevant team | Employee referral |

Choose **one primary** and **1–2 backups**. If two people are equal, prefer the one whose title matches the JD team over a generic company recruiter.

### Outreach file template

```markdown
# LinkedIn outreach — <Company> / <role>

## Primary
- **Name:**
- **Title:**
- **Profile:** https://www.linkedin.com/in/...
- **Why them:** (one line: posting owner / TA / EM / alumni / team IC)
- **How to reach:** connection note / InMail / existing thread

## Backups
- ...

## Connection note (≤200 characters, paste as-is)

...

## DM / InMail

...

## Searches run
- (queries + whether login blocked LinkedIn UI)
```

### Message rules

- First person, Joe. Name the **exact role** and company. One concrete `resume.json` overlap (product, stack, or employer), not a CV dump.
- Connection note **≤200 characters** including spaces (LinkedIn limit). No links in the connection note if they blow the limit; put `peglerweb.services` or LinkedIn profile only in the longer DM.
- Longer DM/InMail: 4–6 short sentences. Offer to send the CV; do not attach files in the markdown (user sends from LinkedIn).
- **Forbidden:** invented mutuals, fake “saw you posted this,” claims of knowing them, tagging `resume.json` `references` as if they will intro unless the user asked.
- If no named person: still write a generic note addressed to a recruiter/hiring team and list the queries for the user to run logged in.

### Example connection note (length-check before saving)

`Hi <Name>, applying for <Role> at <Company>. I built partner/API integration surfaces at defi.app and Biconomy and would value a pointer to the right person on the req.`

Trim until ≤200 characters. Swap the overlap sentence for whatever `resume.json` actually supports for that JD.

---

## PDF: `scripts/md-to-pdf.sh`

From repo root:

```bash
pegler.web.services/.cursor/skills/resume-tailor-jd/scripts/md-to-pdf.sh pegler.web.services/tailored-resumes/resume.ACME-role.md
pegler.web.services/.cursor/skills/resume-tailor-jd/scripts/md-to-pdf.sh pegler.web.services/tailored-resumes/cover-letter.ACME-role.md
```

Works for any markdown in `tailored-resumes/`: writes **`.html`** beside the source and **`.pdf`** in the **same directory as the markdown**. Filenames that start with `cover-letter` get HTML `<title>` / metadata **Cover letter**; resume files keep **Résumé**.

### Manual equivalent

1. `pandoc` MD → standalone HTML with GitHub Markdown CSS CDN.  
2. Patch `<head>` / `<body>`: inject print CSS, `class="markdown-body"` on body, hide `header#title-block-header`.  
3. Chrome headless: `--headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf=out.pdf file:///abs/path/to.html`

Concrete `pandoc` invocation matches the shell script.

### Requirements

- `pandoc` on PATH  
- Chromium or Chrome: macOS default `Google Chrome.app`; override with `CHROME` env var

### LaTeX

Not used; avoids `pdflatex` dependency.
