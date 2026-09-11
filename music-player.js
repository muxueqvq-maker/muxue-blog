// ============================================================
//  MUSIC PLAYER — 在这里设置要播放的音乐
//  ------------------------------------------------------------
//  src 支持两种写法：
//  1) 本地文件：把 mp3 放到 outputs/music/ 文件夹，
//     然后写 "music/你的文件名.mp3"
//  2) 在线链接：写完整网址，如 "https://example.com/song.mp3"
//
//  可以放多首歌，播放器会自动支持上一首/下一首。
// ============================================================
const TRACKS = [
  {
    title: "你的歌曲名",
    artist: "歌手名",
    src: "music/track.mp3",
  },
];

(function () {
  const audio = new Audio();
  let index = 0;

  const playBtn = document.getElementById("mp-play");
  const prevBtn = document.getElementById("mp-prev");
  const nextBtn = document.getElementById("mp-next");
  const eq = document.getElementById("mp-eq");
  const titleEl = document.getElementById("mp-title");
  const artistEl = document.getElementById("mp-artist");
  const progress = document.getElementById("mp-progress");
  const fill = document.getElementById("mp-progress-fill");
  const curEl = document.getElementById("mp-cur");
  const durEl = document.getElementById("mp-dur");
  const volEl = document.getElementById("mp-vol");

  if (!playBtn) return;

  function fmt(s) {
    if (!isFinite(s)) return "0:00";
    s = Math.floor(s);
    const m = Math.floor(s / 60);
    const sec = String(s % 60).padStart(2, "0");
    return m + ":" + sec;
  }

  function load(i) {
    index = (i + TRACKS.length) % TRACKS.length;
    const t = TRACKS[index];
    audio.src = t.src;
    audio.volume = Number(volEl.value);
    titleEl.textContent = t.title;
    artistEl.textContent = t.artist;
    playBtn.textContent = "▶";
    eq.classList.remove("is-playing");
    fill.style.width = "0%";
    curEl.textContent = "0:00";
    durEl.textContent = "0:00";
  }

  function play() {
    audio.play()
      .then(() => {
        playBtn.textContent = "❚❚";
        eq.classList.add("is-playing");
      })
      .catch(() => {
        playBtn.textContent = "▶";
        eq.classList.remove("is-playing");
      });
  }

  function pause() {
    audio.pause();
    playBtn.textContent = "▶";
    eq.classList.remove("is-playing");
  }

  playBtn.addEventListener("click", () => {
    if (audio.paused) play();
    else pause();
  });

  prevBtn.addEventListener("click", () => {
    load(index - 1);
    play();
  });

  nextBtn.addEventListener("click", () => {
    load(index + 1);
    play();
  });

  audio.addEventListener("timeupdate", () => {
    if (audio.duration) {
      fill.style.width = (audio.currentTime / audio.duration) * 100 + "%";
      curEl.textContent = fmt(audio.currentTime);
    }
  });

  audio.addEventListener("loadedmetadata", () => {
    durEl.textContent = fmt(audio.duration);
  });

  audio.addEventListener("ended", () => {
    load(index + 1);
    play();
  });

  audio.addEventListener("error", () => {
    playBtn.textContent = "▶";
    eq.classList.remove("is-playing");
    titleEl.textContent = "NO AUDIO — ADD A FILE";
    artistEl.textContent = "see music-player.js";
  });

  progress.addEventListener("click", (e) => {
    if (!audio.duration) return;
    const rect = progress.getBoundingClientRect();
    const pct = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    audio.currentTime = pct * audio.duration;
  });

  volEl.addEventListener("input", () => {
    audio.volume = Number(volEl.value);
  });

  load(0);
})();
