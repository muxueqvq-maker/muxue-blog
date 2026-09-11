// ============================================================
//  POSTS — 在这里写文章
//  ------------------------------------------------------------
//  每篇文章是一个对象，结构如下：
//  {
//    slug:    "唯一的英文短名，用于网址（不能重复）",
//    title:   "文章标题",
//    date:    "YYYY-MM-DD",
//    tags:    ["标签1", "标签2"],
//    excerpt: "显示在首页的摘要",
//    content: `正文，支持 Markdown 语法`
//  }
//
//  正文支持的语法：
//    ## 标题        （一个 # 到六个 # 都行）
//    **加粗**  *斜体*  `行内代码`
//    - 无序列表   1. 有序列表
//    [链接文字](https://...)     > 引用
//    三个反引号包裹代码块
//
//  注意：正文里的反引号 ` 需要写成 \`（前面加一个反斜杠）。
// ============================================================

const POSTS = [
  {
    slug: "cyberpunk-ui-effects",
    title: "Building a Cyberpunk UI: Glitch, Scanlines & Neon Glow",
    date: "2026-09-11",
    tags: ["CSS", "Animation", "Design"],
    excerpt: "The three effects behind this site's aesthetic, explained with code you can copy.",
    content: `The cyberpunk look isn't one big trick — it's a stack of small effects layered together. Here are the three I reach for most.

## 1. Neon glow

The glow is just a text-shadow with a matching color and a large blur radius:

\`\`\`css
.neon {
  color: #00fff7;
  text-shadow:
    0 0 8px rgba(0, 255, 247, 0.8),
    0 0 30px rgba(0, 255, 247, 0.5);
}
\`\`\`

Stack two shadows — one tight and bright, one wide and soft — and the text looks like it's emitting light.

## 2. Scanlines

A fixed overlay of repeating horizontal lines instantly reads as "screen":

\`\`\`css
.scanlines {
  background: repeating-linear-gradient(
    to bottom,
    transparent 0 2px,
    rgba(0, 0, 0, 0.15) 2px 4px
  );
}
\`\`\`

Keep the lines subtle and put them *above* the content with \`pointer-events: none\`.

## 3. Glitch

Glitch is two colored copies of the text, each shifted and clipped differently, blinking on and off:

\`\`\`css
.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
}
.glitch::before { color: #00fff7; animation: shift 2s infinite; }
.glitch::after  { color: #ff00e5; animation: shift 2.3s infinite; }
\`\`\`

The \`clip-path\` inset in the keyframes is what makes the "slices" appear.

## Keep it accessible

- Wrap everything in \`prefers-reduced-motion\`.
- Never put text in an image.
- Test contrast on the dim text — neon looks cool but can be hard to read.

For a deeper dive, check out [MDN's guide to CSS animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations).`
  },
  {
    slug: "react-render-cycle",
    title: "Understanding the React Render Cycle, Frame by Frame",
    date: "2026-08-28",
    tags: ["React", "Performance"],
    excerpt: "What actually happens between a state update and a painted pixel.",
    content: `A state update feels instant, but under the hood there's a whole pipeline running before you see a single changed pixel.

## Render vs. commit

React splits its work into two phases:

- **Render** — React calls your component functions and figures out what changed.
- **Commit** — React applies those changes to the actual DOM.

Understanding this split explains most "why is my app slow?" questions.

## A frame, step by step

1. An event fires and calls a state setter.
2. React marks the component tree as needing work.
3. React re-runs the affected components to produce a new tree.
4. It diffs the new tree against the old one.
5. Finally, it commits the minimal set of DOM mutations.

Inline code like \`requestAnimationFrame\` runs *after* the commit, which is why measuring the DOM before then gives you stale values.

\`\`\`
function App() {
  const [count, setCount] = React.useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
\`\`\`

The takeaway: [the React docs](https://react.dev) describe this pipeline in detail, and once you can picture it, performance work stops being guesswork.`
  },
  {
    slug: "css-custom-properties",
    title: "CSS Custom Properties Are More Powerful Than You Think",
    date: "2026-08-11",
    tags: ["CSS", "Design Systems"],
    excerpt: "Dynamic theming, runtime values, and the cascade as a design system.",
    content: `Custom properties (variables) look simple, but they unlock things regular preprocessor variables never could.

## They live in the cascade

A custom property is resolved where it's *used*, not where it's defined:

- Define a value on \`:root\` for the default.
- Override it on a \`.card\` class.
- Watch every descendant inherit the new value automatically.

## They can change at runtime

Unlike Sass variables, custom properties are real values in the browser:

\`\`\`
:root { --accent: #00fff7; }
.theme--magenta { --accent: #ff00e5; }
.card { box-shadow: 0 0 20px var(--accent); }
\`\`\`

Flip a class, and the entire interface re-themes — **no rebuild required**. That's the core trick behind most dark-mode and theming systems.`
  },
  {
    slug: "web-animations-api",
    title: "Web Animations API: The Modern Replacement for CSS Keyframes?",
    date: "2026-07-30",
    tags: ["Animation", "JavaScript"],
    excerpt: "A practical comparison, with code you can run right now.",
    content: `CSS keyframes are great until you need to pause, reverse, or sync an animation with JavaScript. That's where the Web Animations API (WAAPI) comes in.

## The same animation, two ways

Here's a CSS version:

\`\`\`
@keyframes fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
\`\`\`

And the WAAPI equivalent:

\`\`\`
element.animate(
  [{ opacity: 0 }, { opacity: 1 }],
  { duration: 300, fill: "forwards" }
);
\`\`\`

## When to reach for it

- You need to **pause**, **reverse**, or scrub an animation.
- You're building a custom component where motion depends on JS state.
- You want one animation object you can cancel cleanly.

For pure decorative loops, CSS is still simpler. But the moment animation becomes *interactive*, WAAPI wins.`
  }
];

// ============================================================
//  下面是渲染和 Markdown 解析代码，一般不需要改动
// ============================================================

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// 行内元素：`code`、**加粗**、*斜体*、[链接](url)
function inline(text) {
  const codes = [];
  text = text.replace(/`([^`]+)`/g, (_, c) => {
    const i = codes.length;
    codes.push("<code>" + escapeHtml(c) + "</code>");
    return "\u0001" + i + "\u0001";
  });

  text = escapeHtml(text);

  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>'
  );
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  text = text.replace(/\u0001(\d+)\u0001/g, (_, i) => codes[+i]);

  return text;
}

// 把 Markdown 字符串转成 HTML
function mdToHtml(md) {
  const fences = [];
  md = md.replace(/```[^\n]*\n?([\s\S]*?)```/g, (_, code) => {
    const i = fences.length;
    fences.push("<pre><code>" + escapeHtml(code.replace(/\n$/, "")) + "</code></pre>");
    return "\u0002" + i + "\u0002";
  });

  const lines = md.split("\n");
  const out = [];
  let para = [];
  let list = null;

  const flushPara = () => {
    if (para.length) {
      out.push("<p>" + inline(para.join(" ")) + "</p>");
      para = [];
    }
  };

  const flushList = () => {
    if (list) {
      const items = list.items.map((it) => "<li>" + inline(it) + "</li>").join("");
      out.push("<" + list.type + ">" + items + "</" + list.type + ">");
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.replace(/\r$/, "");

    if (line.startsWith("\u0002")) {
      flushPara();
      flushList();
      out.push(line);
      continue;
    }

    if (/^\s*$/.test(line)) {
      flushPara();
      flushList();
      continue;
    }

    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushPara();
      flushList();
      out.push("<h" + h[1].length + ">" + inline(h[2]) + "</h" + h[1].length + ">");
      continue;
    }

    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    if (ul) {
      flushPara();
      if (!list || list.type !== "ul") {
        flushList();
        list = { type: "ul", items: [] };
      }
      list.items.push(ul[1]);
      continue;
    }

    const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (ol) {
      flushPara();
      if (!list || list.type !== "ol") {
        flushList();
        list = { type: "ol", items: [] };
      }
      list.items.push(ol[1]);
      continue;
    }

    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flushPara();
      flushList();
      out.push("<blockquote><p>" + inline(quote[1]) + "</p></blockquote>");
      continue;
    }

    para.push(line.trim());
  }

  flushPara();
  flushList();

  let result = out.join("\n");
  result = result.replace(/\u0002(\d+)\u0002/g, (_, i) => fences[+i]);
  return result;
}

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d
    .toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    .toUpperCase();
}

// ============================================================
//  本地文章（在网页写作页里写的文章，存在浏览器里）
// ============================================================
const STORAGE_KEY = "nova_user_posts";

function readLocalPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function getAllPosts() {
  const published = Array.isArray(window.ALL_POSTS) ? window.ALL_POSTS : [];
  return [...POSTS, ...published, ...readLocalPosts()].sort((a, b) => b.date.localeCompare(a.date));
}

function saveLocalPost(post) {
  const list = readLocalPosts().filter((p) => p.slug !== post.slug);
  list.push(post);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function deleteLocalPost(slug) {
  const list = readLocalPosts().filter((p) => p.slug !== slug);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function renderPostList(container) {
  if (!container) return;
  container.innerHTML = getAllPosts()
    .map(
      (p) => `
      <a class="post" href="post.html?slug=${encodeURIComponent(p.slug)}">
        <time datetime="${p.date}">${formatDate(p.date)}</time>
        <div>
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.excerpt)}</p>
        </div>
        <span class="post__arrow">→</span>
      </a>`
    )
    .join("");
}

function renderPost(container, slug) {
  if (!container) return;
  const post = getAllPosts().find((p) => p.slug === slug);

  if (!post) {
    document.title = "404 // SIGNAL LOST — NOVA";
    container.innerHTML = `
      <div class="post-notfound">
        <h1>404 // SIGNAL LOST</h1>
        <p>This transmission does not exist (or has been deleted from the grid).</p>
        <a class="btn btn--ghost" href="index.html">← BACK HOME</a>
      </div>`;
    return;
  }

  document.title = post.title + " — NOVA";
  container.innerHTML = `
    <a class="back-link" href="index.html">← BACK TO INDEX</a>
    <div class="post-head">
      <div class="post-tags">${post.tags
        .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
        .join("")}</div>
      <h1>${escapeHtml(post.title)}</h1>
      <time datetime="${post.date}">${formatDate(post.date)}</time>
    </div>
    <article class="article">${mdToHtml(post.content)}</article>`;
}

// 暴露给其它页面使用
window.POSTS = POSTS;
window.escapeHtml = escapeHtml;
window.mdToHtml = mdToHtml;
window.formatDate = formatDate;
window.getAllPosts = getAllPosts;
window.readLocalPosts = readLocalPosts;
window.saveLocalPost = saveLocalPost;
window.deleteLocalPost = deleteLocalPost;
window.renderPostList = renderPostList;
window.renderPost = renderPost;
