import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import { markdownItShikiTwoslashSetup } from "markdown-it-shiki-twoslash";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BLOG_OUT = path.join(ROOT, "blog");
const rootPostSources = fs
  .readdirSync(ROOT)
  .filter((f) => /^post\d+.*\.md$/.test(f))
  .map((f) => path.join(ROOT, f));
const nestedPostSources = fs.existsSync(path.join(ROOT, "posts"))
  ? fs.readdirSync(path.join(ROOT, "posts")).map((f) => path.join(ROOT, "posts", f)).filter((p) => p.endsWith(".md"))
  : [];
const POSTS_SOURCES = [...rootPostSources, ...nestedPostSources].filter((p) => fs.existsSync(p));

function layout(options) {
  const { title, description, content, isIndex = false, posts = [] } = options;
  const base = "../"; // blog pages live in blog/ so assets and site links are one level up
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeHtml(description)}">
    <title>${escapeHtml(title)} | Joe Pegler</title>
    <meta property="og:type" content="article">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <link rel="icon" type="image/svg+xml"
        href="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2322c55e'><path d='M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.236L20 9.083v5.834L12 19.764 4 14.917V9.083L12 4.236zm2 4.264v3h-4v-3h4z'/></svg>">
    <link rel="stylesheet" href="${base}styles.css">
    <link rel="stylesheet" href="${base}blog.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body class="blog-page">
    <header class="site-header">
        <div class="container">
            <div class="logo">
                <a href="${base}index.html" title="Home"><h1>Joe Pegler</h1></a>
                <span>Cork, Ireland</span>
            </div>
            <nav aria-label="Main navigation">
                <ul>
                    <li><a href="${base}index.html">Home</a></li>
                    <li><a href="index.html"${isIndex ? ' aria-current="page"' : ""}>Blog</a></li>
                    <li><a href="${base}resume.html">Resume</a></li>
                </ul>
            </nav>
        </div>
    </header>
    <main class="blog-main">
        <div class="container">
            <div class="blog-content-wrap">
${content}
            </div>
        </div>
    </main>
    <footer>
        <div class="container">
            <p>&copy; <span class="current-year"></span> Joe Pegler. All rights reserved. | Cork, Ireland</p>
        </div>
    </footer>
    <script>
        document.querySelectorAll('.current-year').forEach(function(el){ el.textContent = new Date().getFullYear(); });
    </script>
</body>
</html>`;
}

function layoutIndex(posts) {
  const listHtml = posts
    .map(
      (p) => `
                <article class="blog-card glass-card">
                    <h2 class="blog-card-title"><a href="${escapeHtml(p.slug)}.html">${escapeHtml(p.title)}</a></h2>
                    <time class="blog-card-date" datetime="${escapeHtml(toIsoDate(p.date))}">${formatDate(p.date)}</time>
                    <p class="blog-card-summary">${escapeHtml(p.summary || "")}</p>
                    <a href="${escapeHtml(p.slug)}.html" class="blog-card-link">Read more</a>
                </article>`
    )
    .join("\n");
  return layout({
    title: "Blog",
    description: "Technical notes on transaction infrastructure, account abstraction, and execution systems. Joe Pegler.",
    content: `
                <header class="blog-index-header">
                    <h1>Blog</h1>
                    <p class="blog-index-intro">Technical notes on transaction infrastructure, bundlers, and execution.</p>
                </header>
                <div class="blog-index-list">
${listHtml}
                </div>`,
    isIndex: true,
    posts,
  });
}

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toIsoDate(d) {
  if (!d) return "";
  return d instanceof Date ? d.toISOString() : String(d);
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IE", { year: "numeric", month: "long", day: "numeric" });
}

async function main() {
  const shiki = await markdownItShikiTwoslashSetup({
    theme: "github-dark",
    wrapFragments: true,
  });
  const md = new MarkdownIt({ html: true });
  md.use(shiki);

  if (!fs.existsSync(BLOG_OUT)) fs.mkdirSync(BLOG_OUT, { recursive: true });

  const posts = [];
  for (const filePath of POSTS_SOURCES) {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const slug = data.slug || path.basename(filePath, ".md").replace(/^post\d+_?/, "") || path.basename(filePath, ".md");
    const title = data.title || slug;
    const date = data.date || null;
    const summary = data.summary || "";
    const bodyHtml = md.render(content);
    const fullHtml = layout({
      title,
      description: summary || title,
      content: `
                <article class="blog-post">
                    <header class="blog-post-header">
                        <h1 class="blog-post-title">${escapeHtml(title)}</h1>
                        ${date ? `<time class="blog-post-date" datetime="${escapeHtml(toIsoDate(date))}">${formatDate(date)}</time>` : ""}
                    </header>
                    <div class="blog-content prose">
${bodyHtml}
                    </div>
                </article>`,
      isIndex: false,
    });
    fs.writeFileSync(path.join(BLOG_OUT, `${slug}.html`), fullHtml, "utf-8");
    posts.push({ slug, title, date, summary });
  }

  posts.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

  const indexHtml = layoutIndex(posts);
  fs.writeFileSync(path.join(BLOG_OUT, "index.html"), indexHtml, "utf-8");

  console.log("Blog build done:", posts.length, "posts → blog/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
