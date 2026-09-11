// 从网址里读取要展示的文章 slug，例如 post.html?slug=react-render-cycle
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

renderPost(document.getElementById("post-root"), slug);
