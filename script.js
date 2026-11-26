const projects = [
  {
    title: "VennURL",
    description: "Inspect a link’s destination, strip common tracking, and share it with context. No account for a basic check.",
    tags: ["Web"],
    url: "https://vennurl.com",
    caseStudy: true,
    image: "project-vennurl.png",
    imageAlt: "VennURL product visual showing a link review card",
    role: "Product design and development",
    outcome: "A basic link check works without an account, with destination context and tracking cleanup before sharing."
  },
  {
    title: "Way2Sign",
    description: "Sign, fill, and handle PDFs in the browser. Scan, compress, and OCR without a required account.",
    tags: ["Documents"],
    url: "https://way2sign.com",
    caseStudy: true,
    image: "project-way2sign.png",
    imageAlt: "Way2Sign product artwork for its free browser-based PDF tools",
    role: "Product design and development",
    outcome: "19 free document tools run in the browser; the core workflow needs no account and adds no watermark."
  },
  {
    title: "Tabmeet",
    description: "A browser extension that summarizes and compares the tabs you choose, then points back at the original sources.",
    tags: ["Browser"],
    url: "https://www.tabmeet.com",
  },
  {
    title: "Stackduck",
    description: "Project health, errors, users, and uptime for every app, from one portfolio.",
    tags: ["Dev tools"],
    url: "https://stackduck.app",
  },
  {
    title: "icebloop",
    description: "Icebreakers, live polls, and idea voting for Zoom, Meet, and Teams. No install for participants.",
    tags: ["Meetings"],
    url: "https://icebloop.com",
  },
  {
    title: "Asterscholar",
    description: "Grounds every sentence in peer-reviewed papers, and saves sources from the browser into the library.",
    tags: ["Research"],
    url: "https://www.asterscholar.com",
  },
  {
    title: "Recoverly",
    description: "A local-first backup prototype that wraps the open-source Restic engine, so the archive stays with the owner.",
    tags: ["Backup"],
    url: "https://github.com/xukobong/sme-cloud-backup"
  },
  {
    title: "Fieldshift",
    description: "Decision support that helps farmers explore crop-rotation strategies using NASA Earth data.",
    tags: ["Data"],
    url: "https://github.com/xukobong/fieldshift"
  },
  {
    title: "NodeDots",
    description: "A clearer review before you merge. The first focus is the code itself, not just the pull-request description.",
    tags: ["Code review"],
    url: "https://github.com/xukobong/nodedots"
  },
  {
    title: "Snapsme",
    description: "A lightweight expense tracker for small teams. Snap a photo or send a voice note and keep the record.",
    tags: ["Finance"],
    url: "https://github.com/xukobong/snapsme"
  },
  {
    title: "Enrollocus",
    description: "A Moodle plugin that gives administrators, teachers, and stakeholders one view of enrollment.",
    tags: ["Education"],
    url: "https://github.com/xukobong/enrollocus"
  }
];

function projectCard(project) {
  const label = project.url.includes("github.com") ? "View repository" : "Open site";
  if (project.caseStudy) {
    return `
      <article class="case-study-card">
        <div class="case-study-visual">
          <img src="${project.image}" alt="${project.imageAlt}" loading="lazy" decoding="async">
          <iframe src="${project.url}" title="${project.title} live landing page preview" loading="lazy" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin" tabindex="-1" aria-hidden="true"></iframe>
          <a class="case-preview-open" href="${project.url}" target="_blank" rel="noopener noreferrer" aria-label="Open ${project.title} in a new tab"></a>
          <span class="case-preview-status">Loading live preview</span>
        </div>
        <div class="case-study-copy">
          <div class="case-study-heading">
            <div><p class="kicker">Case study</p><h3><a href="${project.url}" target="_blank" rel="noopener noreferrer">${project.title}</a></h3></div>
            <span class="tag">${project.tags[0]}</span>
          </div>
          <p class="case-study-description">${project.description}</p>
          <dl class="case-study-facts">
            <div><dt>Role</dt><dd>${project.role}</dd></div>
            <div><dt>Outcome</dt><dd>${project.outcome}</dd></div>
          </dl>
          <a class="case-study-link" href="${project.url}" target="_blank" rel="noopener noreferrer">${label} <span aria-hidden="true">↗</span></a>
        </div>
      </article>
    `;
  }
  return `
    <a class="project-card" href="${project.url}" target="_blank" rel="noopener noreferrer">
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <span class="tag">${project.tags[0]}</span>
      <span class="visually-hidden">${label}</span>
    </a>
  `;
}

function renderProjects() {
  const featured = document.getElementById("featured-grid");
  const rest = document.getElementById("projects-grid");
  if (featured) featured.innerHTML = projects.filter((project) => project.caseStudy).map(projectCard).join("");
  if (rest) rest.innerHTML = projects.filter((project) => !project.caseStudy).map(projectCard).join("");
}

function setupLivePreviews() {
  document.querySelectorAll(".case-study-visual").forEach((preview) => {
    const frame = preview.querySelector("iframe");
    const status = preview.querySelector(".case-preview-status");
    if (!frame || !status) return;

    frame.addEventListener("load", () => {
      try {
        if (frame.contentWindow.location.href === "about:blank") {
          preview.classList.add("preview-fallback");
          status.textContent = "Product image · open full site";
          return;
        }
      } catch (error) {
        // A loaded cross-origin page correctly blocks the parent from reading its URL.
      }
      preview.classList.add("preview-live");
      status.textContent = "Live preview · open full site";
    });
  });
}

function streaks(days) {
  let current = 0;
  let index = days.length - 1;
  if (index >= 0 && days[index].count === 0) index -= 1;
  while (index >= 0 && days[index].count > 0) {
    current += 1;
    index -= 1;
  }

  let best = 0;
  let run = 0;
  for (const day of days) {
    run = day.count > 0 ? run + 1 : 0;
    if (run > best) best = run;
  }
  return { current, best };
}

function formatRange(days) {
  const fmt = new Intl.DateTimeFormat("en", { month: "short", year: "numeric" });
  const start = new Date(days[0].date + "T00:00:00");
  const end = new Date(days[days.length - 1].date + "T00:00:00");
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

function renderHeatmap(days) {
  const grid = document.getElementById("heatmap");
  if (!grid) return;

  const first = new Date(days[0].date + "T00:00:00");
  const pad = first.getDay();
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < pad; i += 1) {
    const empty = document.createElement("span");
    empty.className = "heat-cell heat-pad";
    fragment.appendChild(empty);
  }

  for (const day of days) {
    const cell = document.createElement("span");
    cell.className = "heat-cell";
    cell.dataset.level = String(Math.min(4, day.level));
    const label = day.count === 1 ? "1 contribution" : `${day.count} contributions`;
    cell.title = `${day.date}: ${label}`;
    fragment.appendChild(cell);
  }

  grid.replaceChildren(fragment);
  grid.setAttribute(
    "aria-label",
    `${days.reduce((sum, day) => sum + day.count, 0).toLocaleString()} GitHub contributions from ${formatRange(days)}`
  );
}

function setStat(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}

async function loadGithub() {
  const range = document.getElementById("gh-range");
  try {
    const [contribRes, userRes] = await Promise.all([
      fetch("https://github-contributions-api.jogruber.de/v4/xukobong?y=last"),
      fetch("https://api.github.com/users/xukobong")
    ]);

    if (userRes.ok) {
      const user = await userRes.json();
      setStat("gh-repos", Number(user.public_repos).toLocaleString());
    }

    if (!contribRes.ok) throw new Error("contributions unavailable");
    const data = await contribRes.json();
    const days = data.contributions || [];
    if (!days.length) throw new Error("empty contributions");

    const total = data.total && data.total.lastYear != null
      ? data.total.lastYear
      : days.reduce((sum, day) => sum + day.count, 0);

    const { current, best } = streaks(days);
    const showCurrent = current > 1;
    setStat("gh-contrib", Number(total).toLocaleString());
    setStat("gh-streak", (showCurrent ? current : best).toLocaleString());
    setStat("gh-streak-label", showCurrent ? "day streak" : "best streak");
    renderHeatmap(days);
    if (range) range.textContent = formatRange(days);
  } catch (error) {
    if (range) {
      range.textContent = "The contribution graph didn’t load. The profile is still on GitHub.";
    }
  }
}

function setupNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.getElementById("nav-links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  links.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    });
  });

  const anchors = [...links.querySelectorAll("a")];
  const sections = anchors
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const setCurrent = (id) => {
    links.querySelectorAll("a").forEach((link) => {
      if (link.getAttribute("href") === `#${id}`) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setCurrent(visible.target.id);
    }, { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.2, 0.6] });
    sections.forEach((section) => observer.observe(section));
  }

  const initial = (location.hash || "#home").replace("#", "");
  setCurrent(document.getElementById(initial) ? initial : "home");
}

function setupDiscordHandle() {
  const button = document.querySelector("[data-discord-handle]");
  const status = document.getElementById("discord-copy-status");
  const label = button?.querySelector("span");
  if (!button || !label || !status) return;

  const handle = button.dataset.discordHandle;
  let resetTimer;

  button.addEventListener("click", async () => {
    if (!navigator.clipboard?.writeText) {
      status.textContent = `Copy unavailable. Discord handle: ${handle}.`;
      return;
    }

    try {
      await navigator.clipboard.writeText(handle);
      label.textContent = "Copied";
      status.textContent = `Copied Discord handle ${handle}.`;
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => { label.textContent = handle; }, 1800);
    } catch (error) {
      status.textContent = `Could not copy. Discord handle: ${handle}.`;
    }
  });
}

const MEDIUM_PROFILE = "https://medium.com/@xukobong";
const MEDIUM_FEED = "https://medium.com/feed/@xukobong";
const CONTACT_FORM_ENDPOINT = "https://formsubmit.co/ajax/saviourukobong@gmail.com";

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[ch]));
}

function plainText(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
}

function childText(item, names) {
  for (const name of names) {
    const node = [...item.children].find((child) => child.localName === name);
    if (node && node.textContent.trim()) return node.textContent.trim();
  }
  return "";
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") return url.href;
  } catch (error) {
    return MEDIUM_PROFILE;
  }
  return MEDIUM_PROFILE;
}

function formatPostDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function mediumCard(post) {
  const excerpt = post.excerpt ? `<p>${escapeHtml(post.excerpt)}</p>` : "";
  const date = post.date ? `<time datetime="${escapeHtml(post.date)}">${escapeHtml(formatPostDate(post.date))}</time>` : "";
  return `
    <a class="medium-card" href="${escapeHtml(safeUrl(post.link))}" target="_blank" rel="noopener noreferrer">
      ${date}
      <h3>${escapeHtml(post.title)}</h3>
      ${excerpt}
      <span class="project-link">Read on Medium</span>
    </a>
  `;
}

function renderMedium(posts) {
  const container = document.getElementById("medium-feed");
  if (!container) return;

  if (!posts.length) {
    container.innerHTML = `
      <p class="feed-status">No published stories in the feed yet. New articles will show up here.</p>
      <a class="text-link" href="${MEDIUM_PROFILE}" target="_blank" rel="noopener noreferrer">Open Medium</a>
    `;
    return;
  }

  container.innerHTML = posts.slice(0, 4).map(mediumCard).join("");
}

function postsFromXml(xml) {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  if (doc.querySelector("parsererror")) throw new Error("unreadable feed");
  return [...doc.querySelectorAll("item")].map((item) => {
    const html = childText(item, ["encoded", "description"]);
    const excerpt = plainText(html).slice(0, 180);
    return {
      title: childText(item, ["title"]) || "Untitled",
      link: childText(item, ["link"]) || MEDIUM_PROFILE,
      date: childText(item, ["pubDate", "updated"]),
      excerpt
    };
  });
}

function postsFromRss2Json(data) {
  return (data.items || []).map((item) => ({
    title: item.title || "Untitled",
    link: item.link || MEDIUM_PROFILE,
    date: item.pubDate || "",
    excerpt: plainText(item.description || item.content || "").slice(0, 180)
  }));
}

async function loadMedium() {
  const container = document.getElementById("medium-feed");
  const feedUrl = encodeURIComponent(MEDIUM_FEED);
  try {
    const direct = await fetch(`https://api.allorigins.win/raw?url=${feedUrl}`);
    if (!direct.ok) throw new Error("proxy");
    renderMedium(postsFromXml(await direct.text()));
  } catch (error) {
    try {
      const backup = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${feedUrl}`);
      if (!backup.ok) throw new Error("rss2json");
      const data = await backup.json();
      if (data.status !== "ok") throw new Error("rss2json");
      renderMedium(postsFromRss2Json(data));
    } catch (backupError) {
      if (container) {
        container.innerHTML = `
          <p class="feed-status">Stories didn’t load this time.</p>
          <a class="text-link" href="${MEDIUM_PROFILE}" target="_blank" rel="noopener noreferrer">Open Medium</a>
        `;
      }
    }
  }
}

function setupReach() {
  const form = document.getElementById("reach");
  const note = document.getElementById("reach-note");
  if (!form || !note) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (form._honey.value) return;

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    if (!name || !email || !message || !form.email.checkValidity()) {
      note.textContent = "Add a name, a real email, and a note.";
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    const originalLabel = button.textContent;
    const payload = Object.fromEntries(new FormData(form).entries());
    payload._subject = `Portfolio note from ${name}`;
    payload._replyto = email;

    button.disabled = true;
    button.textContent = "Sending…";
    note.textContent = "Sending your note…";

    try {
      const response = await fetch(CONTACT_FORM_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      const accepted = result.success === true || result.success === "true";

      if (!response.ok || !accepted) {
        throw new Error(result.message || "The form service could not accept your note.");
      }

      form.reset();
      note.textContent = "Your note has been sent. Thanks for reaching out.";
    } catch (error) {
      note.textContent = "Your note couldn’t be sent. Please try again or email saviourukobong@gmail.com.";
    } finally {
      button.disabled = false;
      button.textContent = originalLabel;
    }
  });
}

function setupNewsletter() {
  const form = document.getElementById("newsletter-form");
  const note = document.getElementById("newsletter-note");
  const apiBase = document.querySelector('meta[name="newsletter-api-url"]')?.content.trim();
  if (!form || !note) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailField = form.elements.namedItem("email");
    const honeypot = form.elements.namedItem("website");
    if (honeypot?.value) return;
    if (!emailField.value.trim() || !emailField.checkValidity()) {
      note.textContent = "Enter a valid email address.";
      emailField.focus();
      return;
    }
    if (!apiBase) {
      note.textContent = "Newsletter signup is being set up. Please check back soon.";
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = "Sending…";
    note.textContent = "Sending a confirmation email…";

    try {
      const endpoint = new URL("/api/newsletter/subscribe", apiBase);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: emailField.value.trim(), website: honeypot?.value || "" })
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) {
        throw new Error(result.message || "Signup failed.");
      }

      form.reset();
      note.textContent = "Check your inbox for a confirmation email to finish subscribing.";
    } catch (error) {
      note.textContent = "Signup couldn’t be completed. Please try again later.";
    } finally {
      button.disabled = false;
      button.textContent = originalLabel;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderProjects();
  setupLivePreviews();
  setupNav();
  setupDiscordHandle();
  loadGithub();
  setupReach();
  setupNewsletter();
  loadMedium();
});
