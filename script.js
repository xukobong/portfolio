const projects = [
  {
    title: "Recoverly",
    description: "A local-first backup prototype that wraps the open-source Restic engine, so the archive stays with the owner.",
    tags: ["Python", "Local-first", "Backup"],
    url: "https://github.com/xukobong/sme-cloud-backup"
  },
  {
    title: "Fieldshift",
    description: "Decision support that helps farmers explore crop-rotation strategies using NASA Earth data.",
    tags: ["Python", "Data", "Agriculture"],
    url: "https://github.com/xukobong/fieldshift"
  },
  {
    title: "Stackduck",
    description: "A backend monitoring and admin platform for developers running more than one project.",
    tags: ["Monitoring", "Admin"],
    url: "https://github.com/xukobong/stackduck"
  },
  {
    title: "NodeDots",
    description: "A clearer review before you merge. The first focus is the code itself, not just the pull-request description.",
    tags: ["TypeScript", "Code review"],
    url: "https://github.com/xukobong/nodedots"
  },
  {
    title: "Snapsme",
    description: "A lightweight expense tracker for small teams. Snap a photo or send a voice note and keep the record.",
    tags: ["JavaScript", "Local-first"],
    url: "https://github.com/xukobong/snapsme"
  },
  {
    title: "Enrollocus",
    description: "A Moodle plugin that gives administrators, teachers, and stakeholders one view of enrollment.",
    tags: ["PHP", "Education"],
    url: "https://github.com/xukobong/enrollocus"
  }
];

function renderProjects() {
  const container = document.getElementById("projects-grid");
  if (!container) return;

  container.innerHTML = projects.map(p => `
    <a class="project-card" href="${p.url}" target="_blank" rel="noopener noreferrer">
      <h3>${p.title}</h3>
      <p>${p.description}</p>
      <div class="project-tags">
        ${p.tags.map(t => `<span class="tag">${t}</span>`).join("")}
      </div>
      <span class="project-link">View repository</span>
    </a>
  `).join("");
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
}

const MEDIUM_PROFILE = "https://medium.com/@xukobong";
const MEDIUM_FEED = "https://medium.com/feed/@xukobong";

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

function watchTimeline() {
  const frame = document.querySelector(".tweet-frame");
  if (!frame) return;

  const reveal = () => {
    const iframe = frame.querySelector("iframe");
    const note = frame.querySelector(".timeline-fallback");
    if (iframe && iframe.offsetHeight > 40) {
      if (note) note.remove();
      return;
    }
    if (note) return;
    frame.insertAdjacentHTML("beforeend", `
      <div class="timeline-fallback">
        <p>Posts from @xukobong load here when X serves the timeline.</p>
        <a class="text-link" href="https://x.com/xukobong" target="_blank" rel="noopener noreferrer">Open @xukobong</a>
      </div>
    `);
  };

  const bind = () => {
    if (window.twttr && twttr.events) {
      twttr.events.bind("rendered", () => setTimeout(reveal, 400));
    }
    setTimeout(reveal, 4500);
  };

  if (window.twttr && twttr.ready) twttr.ready(bind);
  else setTimeout(bind, 1200);
}

document.addEventListener("DOMContentLoaded", () => {
  renderProjects();
  setupNav();
  loadGithub();
  loadMedium();
  watchTimeline();
});
