// ---------- 写作页逻辑 ----------
const form = document.getElementById("writer");
const note = document.getElementById("writer-note");
const titleInput = document.getElementById("f-title");
const dateInput = document.getElementById("f-date");
const tagsInput = document.getElementById("f-tags");
const excerptInput = document.getElementById("f-excerpt");
const contentInput = document.getElementById("f-content");
const previewBox = document.getElementById("preview");
const previewArticle = previewBox.querySelector(".article");
const previewBtn = document.getElementById("preview-btn");
const localList = document.getElementById("local-list");
const listEmpty = document.getElementById("list-empty");
const ghOwnerInput = document.getElementById("gh-owner");
const ghRepoInput = document.getElementById("gh-repo");
const ghTokenInput = document.getElementById("gh-token");
const publishBtn = document.getElementById("publish-btn");

// 默认日期设为今天
dateInput.value = new Date().toISOString().slice(0, 10);

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function buildPost() {
  const base = slugify(titleInput.value) || "untitled";
  const slug = base + "-" + Date.now().toString(36);
  const tags = tagsInput.value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return {
    slug,
    title: titleInput.value.trim(),
    date: dateInput.value,
    tags,
    excerpt: excerptInput.value.trim(),
    content: contentInput.value,
  };
}

function setNote(msg, ok) {
  note.textContent = msg;
  note.style.color = ok ? "var(--cyan)" : "var(--magenta)";
}

function renderLocalList() {
  const posts = readLocalPosts();
  listEmpty.hidden = posts.length > 0;
  localList.innerHTML = posts
    .map(
      (p) => `
      <div class="admin-item">
        <div class="admin-item__info">
          <strong>${escapeHtml(p.title)}</strong>
          <span>${formatDate(p.date)} · ${escapeHtml((p.tags || []).join(", "))}</span>
        </div>
        <div class="admin-item__actions">
          <a class="btn btn--ghost" href="post.html?slug=${encodeURIComponent(p.slug)}" target="_blank">VIEW</a>
          <button class="btn btn--danger" type="button" data-slug="${p.slug}">DELETE</button>
        </div>
      </div>`
    )
    .join("");
}

// ---------- GitHub 发布 ----------
const GH_CONFIG_KEY = "nova_github_config";

function loadGhConfig() {
  try {
    const cfg = JSON.parse(localStorage.getItem(GH_CONFIG_KEY) || "{}");
    if (cfg.owner) ghOwnerInput.value = cfg.owner;
    if (cfg.repo) ghRepoInput.value = cfg.repo;
    if (cfg.token) ghTokenInput.value = cfg.token;
  } catch (err) {
    /* ignore */
  }
}

function saveGhConfig(owner, repo, token) {
  localStorage.setItem(GH_CONFIG_KEY, JSON.stringify({ owner, repo, token }));
}

function b64encode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function b64decode(str) {
  return decodeURIComponent(escape(atob(str)));
}

function extractPosts(text) {
  const prefix = "window.ALL_POSTS = ";
  const t = String(text).trim();
  if (!t.startsWith(prefix)) throw new Error("无法解析 posts-data.js 的结构");
  return JSON.parse(t.slice(prefix.length).replace(/;\s*$/, ""));
}

function serializePosts(arr) {
  return "window.ALL_POSTS = " + JSON.stringify(arr, null, 2) + ";\n";
}

async function ghApi(path, options = {}) {
  const owner = ghOwnerInput.value.trim();
  const repo = ghRepoInput.value.trim();
  const token = ghTokenInput.value.trim();
  const url = "https://api.github.com/repos/" + owner + "/" + repo + "/contents/" + path;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error("GitHub 错误 " + res.status + ": " + errText.slice(0, 200));
  }
  return res.json();
}

async function publishToGitHub(post) {
  const owner = ghOwnerInput.value.trim();
  const repo = ghRepoInput.value.trim();
  const token = ghTokenInput.value.trim();
  if (!owner || !repo || !token) {
    throw new Error("请先填写 GitHub 设置里的 OWNER / REPO / TOKEN");
  }
  saveGhConfig(owner, repo, token);

  const file = await ghApi("posts-data.js");
  const current = b64decode(file.content.replace(/\s/g, ""));
  const arr = extractPosts(current);
  const idx = arr.findIndex((p) => p.slug === post.slug);
  if (idx >= 0) arr[idx] = post;
  else arr.push(post);

  const next = serializePosts(arr);
  await ghApi("posts-data.js", {
    method: "PUT",
    body: JSON.stringify({
      message: "Publish: " + post.title,
      content: b64encode(next),
      sha: file.sha,
    }),
  });
}

publishBtn.addEventListener("click", async () => {
  if (!titleInput.value.trim() || !contentInput.value.trim()) {
    setNote("⚠ TITLE AND CONTENT ARE REQUIRED", false);
    return;
  }
  const post = buildPost();
  publishBtn.disabled = true;
  setNote("⟳ PUBLISHING TO GITHUB…", true);
  try {
    await publishToGitHub(post);
    const url = "https://" + ghOwnerInput.value.trim() + ".github.io/" + ghRepoInput.value.trim() + "/";
    setNote("✓ PUBLISHED — LIVE AT " + url + " (≈1 min)", true);
  } catch (err) {
    setNote("✗ " + err.message, false);
  } finally {
    publishBtn.disabled = false;
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!titleInput.value.trim() || !contentInput.value.trim()) {
    setNote("⚠ TITLE AND CONTENT ARE REQUIRED", false);
    return;
  }
  const post = buildPost();
  saveLocalPost(post);
  setNote("✓ SAVED LOCALLY — IT NOW APPEARS ON THE SITE", true);
  renderLocalList();
  titleInput.value = "";
  excerptInput.value = "";
  contentInput.value = "";
  tagsInput.value = "";
  dateInput.value = new Date().toISOString().slice(0, 10);
});

previewBtn.addEventListener("click", () => {
  if (previewBox.hidden) {
    previewArticle.innerHTML = mdToHtml(contentInput.value || "*Nothing to preview yet.*");
    previewBox.hidden = false;
  } else {
    previewBox.hidden = true;
  }
});

localList.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-slug]");
  if (!btn) return;
  deleteLocalPost(btn.dataset.slug);
  renderLocalList();
});

loadGhConfig();
renderLocalList();
