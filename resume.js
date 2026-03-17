(function () {
  "use strict";

  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  function parseYearMonth(obj) {
    if (!obj || typeof obj !== "object") return null;
    const y = obj.year != null ? Number(obj.year) : null;
    const m = obj.month != null ? Number(obj.month) : null;
    if (y == null) return null;
    return { year: y, month: m != null ? m : 1 };
  }

  function parseDateString(str) {
    if (!str || typeof str !== "string") return null;
    const match = str.match(/^(\d{4})-(\d{2})/);
    if (!match) return null;
    return { year: parseInt(match[1], 10), month: parseInt(match[2], 10) };
  }

  function getStart(entry) {
    return parseYearMonth(entry.start) || parseDateString(entry.startDate);
  }

  function getEnd(entry) {
    if (
      entry.isCurrentRole ||
      (entry.end &&
        typeof entry.end === "object" &&
        Object.keys(entry.end).length === 0)
    ) {
      return { year: 9999, month: 12 };
    }
    return parseYearMonth(entry.end) || parseDateString(entry.endDate);
  }

  function sortWork(work) {
    if (!Array.isArray(work) || work.length === 0) return work;
    return [...work].sort((a, b) => {
      const aEnd = getEnd(a);
      const bEnd = getEnd(b);
      const aStart = getStart(a);
      const bStart = getStart(b);
      if (aEnd && bEnd && aEnd.year !== bEnd.year) return bEnd.year - aEnd.year;
      if (aEnd && bEnd && aEnd.month !== bEnd.month)
        return bEnd.month - aEnd.month;
      if (aStart && bStart && aStart.year !== bStart.year)
        return bStart.year - aStart.year;
      if (aStart && bStart && aStart.month !== bStart.month)
        return bStart.month - bStart.month;
      return 0;
    });
  }

  function formatDateRange(entry) {
    const start = getStart(entry);
    const end = getEnd(entry);
    const isCurrent =
      entry.isCurrentRole ||
      (entry.end &&
        typeof entry.end === "object" &&
        Object.keys(entry.end).length === 0);
    if (!start) return "";
    const startStr = start.month
      ? `${MONTHS[start.month - 1]} ${start.year}`
      : String(start.year);
    if (isCurrent || !end || end.year >= 9999) return `${startStr} – Present`;
    const endStr = end.month
      ? `${MONTHS[end.month - 1]} ${end.year}`
      : String(end.year);
    return `${startStr} – ${endStr}`;
  }

  function formatAwardDate(award) {
    const d = award.fullDate || parseDateString(award.date);
    if (!d) return award.date || "";
    return d.month ? `${MONTHS[d.month - 1]} ${d.year}` : String(d.year);
  }

  function formatEducationDate(edu) {
    const start = parseYearMonth(edu.start) || parseDateString(edu.startDate);
    const end = parseYearMonth(edu.end) || parseDateString(edu.endDate);
    if (!start)
      return edu.startDate && edu.endDate
        ? `${edu.startDate} – ${edu.endDate}`
        : "";
    const startStr = start.month
      ? `${MONTHS[start.month - 1]} ${start.year}`
      : String(start.year);
    if (!end) return startStr;
    const endStr = end.month
      ? `${MONTHS[end.month - 1]} ${end.year}`
      : String(end.year);
    return `${startStr} – ${endStr}`;
  }

  function escapeHtml(str) {
    if (str == null) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderBasics(root, basics) {
    if (!basics) return;
    const name = basics.name || "";
    const label = basics.label || "";
    const summary = basics.summary || "";
    const email = basics.email || "";
    const website = basics.url || basics.website || "";
    const profiles = basics.profiles || [];
    const image = basics.image || basics.picture || "";

    let html = '<div class="resume-header">';
    if (image) {
      html += `<div class="resume-photo"><img src="${escapeHtml(image)}" alt="" width="80" height="80"></div>`;
    }
    html += '<div class="resume-header-text">';
    html += `<h1 class="resume-name">${escapeHtml(name)}</h1>`;
    if (label) html += `<p class="resume-label">${escapeHtml(label)}</p>`;
    if (summary) html += `<p class="resume-summary">${escapeHtml(summary)}</p>`;
    html += '<div class="resume-contact">';
    if (email)
      html +=
        '<a href="mailto:' +
        escapeHtml(email) +
        '">' +
        escapeHtml(email) +
        "</a>";
    if (website)
      html +=
        '<a href="' +
        escapeHtml(
          website.startsWith("http") ? website : "https://" + website,
        ) +
        '" target="_blank" rel="noopener noreferrer">' +
        escapeHtml(website) +
        "</a>";
    profiles.forEach(function (p) {
      if (p.url)
        html += `<a href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.network || p.url)}</a>`;
    });
    html += "</div></div></div>";
    root.insertAdjacentHTML("beforeend", html);
  }

  function renderSelectedImpact(root, items) {
    if (!Array.isArray(items) || items.length === 0) return;
    let html =
      '<section class="resume-section resume-selected-impact" id="resume-selected-impact"><h2>Selected Impact</h2><ul class="resume-selected-impact-list">';
    items.forEach(function (text) {
      const t = text && text.trim ? text.trim() : String(text);
      if (t) html += `<li>${escapeHtml(t)}</li>`;
    });
    html += "</ul></section>";
    root.insertAdjacentHTML("beforeend", html);
  }

  function renderSkills(root, skills) {
    if (!Array.isArray(skills) || skills.length === 0) return;
    let html =
      '<section class="resume-section" id="resume-skills"><h2>Skills</h2><ul class="resume-skills-list">';
    skills.forEach(function (s) {
      const name = s.name || "";
      // const level = s.level ? ` <span class="resume-skill-level">(${escapeHtml(s.level)})</span>` : '';
      html += `<li>${escapeHtml(name)}</li>`;
    });
    html += "</ul></section>";
    root.insertAdjacentHTML("beforeend", html);
  }

  function renderWork(root, work) {
    const sorted = sortWork(work);
    if (sorted.length === 0) return;
    let html =
      '<section class="resume-section" id="resume-experience"><h2>Experience</h2>';
    sorted.forEach(function (entry) {
      const company = entry.company || entry.name || "";
      const position = entry.position || "";
      const url = entry.url || entry.website || "";
      const companyDisplay = url
        ? `<a href="${escapeHtml(url.startsWith("http") ? url : "https://" + url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(company)}</a>`
        : escapeHtml(company);
      const dateRange = formatDateRange(entry);
      const summary = entry.summary || "";
      const highlights = entry.highlights || [];

      html += '<article class="resume-job">';
      html += `<h3 class="resume-job-company">${companyDisplay}</h3>`;
      html += `<p class="resume-job-meta">${escapeHtml(position)}${dateRange ? " · " + dateRange : ""}</p>`;
      if (summary)
        html += `<p class="resume-job-summary">${escapeHtml(summary)}</p>`;
      if (highlights.length) {
        html += '<ul class="resume-job-highlights">';
        highlights.forEach(function (h) {
          const text = h && h.trim ? h.trim() : String(h);
          if (text) html += `<li>${escapeHtml(text)}</li>`;
        });
        html += "</ul>";
      }
      html += "</article>";
    });
    html += "</section>";
    root.insertAdjacentHTML("beforeend", html);
  }

  function renderEducation(root, education) {
    if (!Array.isArray(education) || education.length === 0) return;
    let html =
      '<section class="resume-section" id="resume-education"><h2>Education</h2>';
    education.forEach(function (edu) {
      const institution = edu.institution || "";
      const studyType = edu.studyType || "";
      const area = edu.area || "";
      const score = edu.score || edu.gpa || "";
      const dateStr = formatEducationDate(edu);
      html += '<article class="resume-edu">';
      html += `<h3 class="resume-edu-institution">${escapeHtml(institution)}</h3>`;
      html += `<p class="resume-edu-meta">${escapeHtml(studyType)}${area ? " · " + escapeHtml(area) : ""}${score ? " · " + escapeHtml(score) : ""}${dateStr ? " · " + dateStr : ""}</p>`;
      html += "</article>";
    });
    html += "</section>";
    root.insertAdjacentHTML("beforeend", html);
  }

  function renderAwards(root, awards) {
    if (!Array.isArray(awards) || awards.length === 0) return;
    let html =
      '<section class="resume-section" id="resume-awards"><h2>Awards</h2><ul class="resume-awards-list">';
    awards.forEach(function (a) {
      const title = a.title || "";
      const awarder = a.awarder || "";
      const dateStr = formatAwardDate(a);
      html += "<li>";
      html += `<strong>${escapeHtml(title)}</strong>`;
      if (awarder) html += ` – ${escapeHtml(awarder)}`;
      if (dateStr) html += ` (${dateStr})`;
      html += "</li>";
    });
    html += "</ul></section>";
    root.insertAdjacentHTML("beforeend", html);
  }

  function render(data) {
    const root = document.getElementById("resume-root");
    if (!root) return;
    root.innerHTML = "";

    if (data.basics) renderBasics(root, data.basics);
    if (data.selectedImpact && data.selectedImpact.length)
      renderSelectedImpact(root, data.selectedImpact);
    if (data.skills && data.skills.length) renderSkills(root, data.skills);
    if (data.work && data.work.length) renderWork(root, data.work);
    if (data.education && data.education.length)
      renderEducation(root, data.education);
    if (data.awards && data.awards.length) renderAwards(root, data.awards);
  }

  function setCurrentYear() {
    const year = new Date().getFullYear();
    document.querySelectorAll(".current-year").forEach(function (el) {
      el.textContent = year;
    });
  }

  function initPrintButton() {
    const btn = document.getElementById("resume-print-btn");
    if (btn)
      btn.addEventListener("click", function () {
        window.print();
      });
  }

  function load() {
    fetch("resume.json")
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load resume.json");
        return res.json();
      })
      .then(function (data) {
        render(data);
        setCurrentYear();
        initPrintButton();
      })
      .catch(function (err) {
        const root = document.getElementById("resume-root");
        if (root)
          root.innerHTML =
            '<p class="resume-error">Unable to load resume. Please try again later.</p>';
        setCurrentYear();
        initPrintButton();
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
