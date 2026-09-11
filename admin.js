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

renderLocalList();
