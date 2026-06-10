const shell = document.querySelector(".archive-shell");
const screens = [...document.querySelectorAll(".screen")];
const soundStatus = document.querySelector("#sound-status");
const cursors = [...document.querySelectorAll(".cursor")];
const projectButtons = [...document.querySelectorAll(".project-selector button")];
const projectDots = document.querySelector(".project-dots");
const projectTitle = document.querySelector("#project-title");
const projectSummary = document.querySelector("#project-summary");
const imageTrack = document.querySelector("#image-track");
const imageCount = document.querySelector("#image-count");
const contactTitle = document.querySelector("#contact-title");

const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_/#@$%&";
let audioContext;
let soundOn = true;
let activeScreen = "home";
let activeProject = 0;
let activeImage = 0;
let typingTimer;

const projects = [
  {
    label: "Project One",
    title: "博瀚智能品牌设计升级改造",
    code: "BOHAN_BRAND_SYSTEM",
    summary: "围绕智能科技企业品牌识别、视觉语言和应用系统进行升级，让品牌在商务沟通、线上传播与展会场景中保持一致、清晰和可信。",
    path: "./assets/projects/bohan/",
    count: 13
  },
  {
    label: "Project Two",
    title: "Apulis AI Studio平台设计系统解决方案",
    code: "APULIS_AI_STUDIO",
    summary: "为 AI 平台梳理组件规范、界面结构、交互状态与产品体验，使复杂工具在高信息密度下仍然易读、高效、可扩展。",
    path: "./assets/projects/apulis/",
    count: 8
  },
  {
    label: "Project Three",
    title: "币小子WEB端设计",
    code: "BIXIAOZI_WEB",
    summary: "面向数字资产产品的 Web 端设计，聚焦信息层级、数据展示、用户操作路径和视觉可信度。",
    path: "./assets/projects/bixiaozi/",
    count: 4
  },
  {
    label: "Project Four",
    title: "运营设计",
    code: "OPERATION_DESIGN",
    summary: "覆盖活动视觉、传播物料、专题页面与品牌运营场景，通过视觉策略提升信息触达和传播效率。",
    path: "./assets/projects/operation/",
    count: 12
  }
];

function getAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

function tone(type = "click") {
  if (!soundOn) return;

  const ctx = getAudio();
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();

  const presets = {
    hover: [520, 720, 0.035, 0.025],
    click: [180, 540, 0.055, 0.045],
    open: [260, 920, 0.13, 0.06],
    close: [480, 120, 0.12, 0.055],
    switch: [340, 680, 0.08, 0.05],
    type: [620, 760, 0.025, 0.018]
  };

  const [from, to, duration, volume] = presets[type] || presets.click;

  osc.type = "square";
  osc2.type = "sawtooth";
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1400, now);
  filter.Q.setValueAtTime(9, now);

  osc.frequency.setValueAtTime(from, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), now + duration);
  osc2.frequency.setValueAtTime(from * 1.5, now);
  osc2.frequency.exponentialRampToValueAtTime(Math.max(40, to * 1.25), now + duration);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc2.start(now);
  osc.stop(now + duration + 0.02);
  osc2.stop(now + duration + 0.02);
}

function glitch(element = shell) {
  element.classList.remove("glitch");
  void element.offsetWidth;
  element.classList.add("glitch");
}

function scrambleText(element) {
  if (!element || element.dataset.scrambling === "true") return;

  const original = element.dataset.originalText || element.textContent;
  element.dataset.originalText = original;
  element.dataset.scrambling = "true";
  element.classList.add("scramble");

  let frame = 0;
  const maxFrame = 12;
  const timer = setInterval(() => {
    element.textContent = original
      .split("")
      .map((char, index) => {
        if (char === " ") return " ";
        return index / original.length < frame / maxFrame
          ? char
          : glyphs[Math.floor(Math.random() * glyphs.length)];
      })
      .join("");

    frame += 1;
    if (frame > maxFrame) {
      clearInterval(timer);
      element.textContent = original;
      element.classList.remove("scramble");
      element.dataset.scrambling = "false";
    }
  }, 26);
}

function switchScreen(id, theme = id) {
  if (activeScreen === id) return;

  const current = document.querySelector(".screen.is-active");
  const next = document.querySelector(`#${id}`);
  if (!next) return;

  tone(id === "directory" ? "close" : "open");
  glitch(shell);
  shell.dataset.theme = theme;

  if (current) {
    current.classList.add("is-leaving");
    setTimeout(() => {
      current.classList.remove("is-active", "is-leaving");
    }, 240);
  }

  setTimeout(() => {
    next.classList.add("is-active");
    activeScreen = id;
    updateTabs(id);
    if (id === "works") renderProject(activeProject, activeImage);
    if (id === "contact") playContactTyping();
  }, 150);
}

function updateTabs(id) {
  document.querySelectorAll(".tab-nav button").forEach((button) => {
    button.classList.toggle("is-current", button.dataset.target === id);
  });
}

function renderProject(projectIndex, imageIndex = 0) {
  activeProject = (projectIndex + projects.length) % projects.length;
  const project = projects[activeProject];
  activeImage = Math.min(Math.max(imageIndex, 0), project.count - 1);

  projectButtons.forEach((button, index) => {
    const isActive = index === activeProject;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  projectTitle.textContent = project.title;
  projectSummary.textContent = project.summary;
  imageTrack.innerHTML = Array.from({ length: project.count }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    const src = `${project.path}${number}.jpg`;
    return `
      <article class="project-image">
        <figure>
          <img src="${src}" alt="${project.title} ${number}" loading="${index === 0 ? "eager" : "lazy"}" />
          <figcaption>
            <span>${project.code}</span>
            <span>${number} / ${String(project.count).padStart(2, "0")}</span>
          </figcaption>
        </figure>
      </article>
    `;
  }).join("");

  updateProjectDots();
  updateImage();
}

function updateProjectDots() {
  projectDots.innerHTML = projects
    .map((_, index) => `<span class="${index === activeProject ? "is-active" : ""}"></span>`)
    .join("");
}

function updateImage() {
  const project = projects[activeProject];
  activeImage = (activeImage + project.count) % project.count;
  imageTrack.style.transform = `translateX(${-activeImage * 100}%)`;
  imageCount.textContent = `${String(activeImage + 1).padStart(2, "0")} / ${String(project.count).padStart(2, "0")}`;
}

function stepProject(direction) {
  tone("switch");
  activeImage = 0;
  renderProject(activeProject + direction, 0);
  glitch(document.querySelector(".project-stage"));
}

function stepImage(direction) {
  tone("switch");
  activeImage += direction;
  updateImage();
  glitch(document.querySelector(".image-viewport"));
}

function playContactTyping() {
  clearInterval(typingTimer);
  const text = contactTitle.dataset.typeText;
  contactTitle.textContent = "";

  let index = 0;
  typingTimer = setInterval(() => {
    contactTitle.textContent += text[index] || "";
    if (index % 2 === 0) tone("type");
    index += 1;
    if (index > text.length) clearInterval(typingTimer);
  }, 68);
}

function updateCursor(event) {
  document.body.classList.add("has-pointer");
  cursors.forEach((cursor) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  });
}

function setCursorMode(mode) {
  document.body.classList.remove("cursor-plus", "cursor-cross", "cursor-dot", "cursor-diamond");
  if (mode && mode !== "basic") document.body.classList.add(`cursor-${mode}`);
}

document.addEventListener("mousemove", updateCursor);

document.addEventListener("mouseover", (event) => {
  const target = event.target.closest("button, a, [data-cursor]");
  if (!target) return;

  setCursorMode(target.dataset.cursor || "plus");
  tone("hover");

  if (target.classList.contains("file-card")) {
    scrambleText(target.querySelector("strong"));
  } else if (target.matches(".terminal-button, .tab-nav button, .project-selector button")) {
    scrambleText(target.querySelector("span") || target);
  }
});

document.addEventListener("mouseout", (event) => {
  if (event.target.closest("button, a, [data-cursor]")) {
    setCursorMode("basic");
  }
});

document.addEventListener("click", (event) => {
  const control = event.target.closest("[data-action], .file-card, .tab-nav button, .project-selector button");
  if (!control) return;

  const action = control.dataset.action;
  const target = control.dataset.target;

  if (control.classList.contains("file-card")) {
    switchScreen(control.dataset.target, control.dataset.theme);
    return;
  }

  if (control.classList.contains("project-selector")) return;

  if (control.closest(".project-selector") && control.dataset.project) {
    tone("switch");
    renderProject(Number(control.dataset.project), 0);
    glitch(document.querySelector(".project-stage"));
    return;
  }

  if (control.closest(".tab-nav") && target) {
    switchScreen(target, control.dataset.theme || target);
    return;
  }

  if (action === "open-directory") {
    switchScreen("directory", "home");
    return;
  }

  if (action === "go-home") {
    switchScreen("home", "home");
    return;
  }

  if (action === "sound") {
    soundOn = !soundOn;
    soundStatus.textContent = soundOn ? "ON" : "OFF";
    if (soundOn) tone("open");
    return;
  }

  if (action === "lets-go") {
    switchScreen("about", "about");
    return;
  }

  if (action === "directory") {
    switchScreen("directory", "home");
    return;
  }

  if (action === "prev-project") stepProject(-1);
  if (action === "next-project") stepProject(1);
  if (action === "prev-image") stepImage(-1);
  if (action === "next-image") stepImage(1);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && activeScreen !== "directory" && activeScreen !== "home") {
    switchScreen("directory", "home");
  }

  if (activeScreen === "works") {
    if (event.key === "ArrowLeft") stepImage(-1);
    if (event.key === "ArrowRight") stepImage(1);
    if (event.key === "ArrowUp") stepProject(-1);
    if (event.key === "ArrowDown") stepProject(1);
  }
});

document.querySelector(".image-viewport").addEventListener("wheel", (event) => {
  if (activeScreen !== "works") return;
  event.preventDefault();
  stepImage(event.deltaY > 0 || event.deltaX > 0 ? 1 : -1);
}, { passive: false });

renderProject(0, 0);

setTimeout(() => {
  if (activeScreen === "home") {
    glitch(document.querySelector(".boot-copy"));
  }
}, 2800);
