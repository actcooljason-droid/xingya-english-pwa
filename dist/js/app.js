import {
  checkAnswer,
  createSession,
  emptyProgress,
  mergeProgress,
  scoreSession,
} from "./learning-engine.js";
import { rainbowPicnicActivities } from "./curriculum.js";
import {
  activateDemoSubscription,
  createDemoSubscription,
} from "./subscription.js";

const STORAGE_KEY = "xingya-english-progress-v1";
const SUBSCRIPTION_STORAGE_KEY = "xingya-english-demo-subscription-v1";
const TYPE_NAMES = {
  letter: "字母认知",
  listen: "听音选图",
  word: "词义匹配",
  sentence: "日常表达",
};

const screens = [...document.querySelectorAll(".screen")];
const startButton = document.querySelector("#start-button");
const answerGrid = document.querySelector("#answer-grid");
const nextButton = document.querySelector("#next-button");
const feedback = document.querySelector("#feedback");
const listenButton = document.querySelector("#listen-button");
const parentHold = document.querySelector("#parent-hold");
const resetDialog = document.querySelector("#reset-dialog");
const subscriptionDialog = document.querySelector("#subscription-dialog");
const subscriptionCheckout = document.querySelector("#subscription-checkout");
const subscriptionSuccess = document.querySelector("#subscription-success");
const toast = document.querySelector("#toast");

let session = [];
let questionIndex = 0;
let results = [];
let answered = false;
let progress = loadProgress();
let subscription = loadSubscription();
let holdTimer = 0;
let holdFrame = 0;
let holdStartedAt = 0;

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...emptyProgress(), ...JSON.parse(raw) } : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    showToast("本次成绩暂时无法保存，但可以继续学习。");
    return false;
  }
}

function loadSubscription() {
  try {
    const saved = JSON.parse(localStorage.getItem(SUBSCRIPTION_STORAGE_KEY));
    if (saved?.status !== "active" || saved?.simulation !== true) return createDemoSubscription();
    return activateDemoSubscription(createDemoSubscription(), saved.activatedAt || null);
  } catch {
    return createDemoSubscription();
  }
}

function saveSubscription() {
  try {
    localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subscription));
    return true;
  } catch {
    showToast("模拟订阅状态暂时无法保存。");
    return false;
  }
}

function setScreen(id) {
  for (const screen of screens) {
    const active = screen.id === id;
    screen.hidden = !active;
    screen.classList.toggle("is-active", active);
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.hidden = true;
  }, 3200);
}

function speakEnglish(text) {
  if (!("speechSynthesis" in window)) {
    showToast("这台设备暂不支持语音朗读，可以看着英文继续练习。");
    return false;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.78;
  utterance.pitch = 1.08;
  window.speechSynthesis.speak(utterance);
  return true;
}

function renderHome() {
  document.querySelector("#home-stars").textContent = progress.stars;
  document.querySelector("#home-days").textContent = progress.learningDays;
  document.querySelector("#growth-message").textContent = progress.sessions
    ? `已经完成 ${progress.sessions} 次冒险，继续给好奇心浇水吧！`
    : "完成第一次冒险，小种子就会发芽！";
}

function startLesson() {
  session = createSession(rainbowPicnicActivities, 5);
  questionIndex = 0;
  results = [];
  answered = false;
  setScreen("lesson-screen");
  renderActivity();
  return { status: "started", activities: session.length, theme: "彩虹野餐" };
}

function renderActivity() {
  const activity = session[questionIndex];
  answered = false;
  feedback.hidden = true;
  answerGrid.innerHTML = "";
  document.querySelector("#question-number").textContent = questionIndex + 1;
  document.querySelector("#session-stars").textContent = results.filter((item) => item.correct).length * 2;
  document.querySelector("#activity-label").textContent = activity.label;
  document.querySelector("#activity-prompt").textContent = activity.prompt;
  document.querySelector(".progress-track").setAttribute("aria-valuenow", questionIndex + 1);
  document.querySelector("#progress-fill").style.width = `${((questionIndex + 1) / session.length) * 100}%`;
  listenButton.setAttribute("aria-label", `播放 ${activity.speechHint} 的英文发音`);

  for (const option of activity.options) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-option";
    button.dataset.optionId = option.id;
    button.setAttribute("aria-label", option.label);

    const visual = document.createElement("span");
    visual.className = activity.type === "letter" ? "option-visual option-visual--letter" : "option-visual";
    visual.textContent = option.visual;
    const label = document.createElement("span");
    label.className = "option-label";
    label.textContent = option.label;
    button.append(visual, label);
    button.addEventListener("click", () => chooseAnswer(button, option.id));
    answerGrid.append(button);
  }

  window.setTimeout(() => speakEnglish(activity.speech), 280);
}

function chooseAnswer(selectedButton, selectedId) {
  if (answered) return;
  answered = true;
  const activity = session[questionIndex];
  const correct = checkAnswer(activity, selectedId);
  results.push({ type: activity.type, correct });

  for (const button of answerGrid.querySelectorAll("button")) {
    button.disabled = true;
    if (button.dataset.optionId === activity.correctOptionId) button.classList.add("is-correct");
  }

  if (!correct) selectedButton.classList.add("is-wrong");
  document.querySelector("#feedback-title").textContent = correct ? "答对啦！" : "没关系，再认识一次";
  document.querySelector("#feedback-copy").textContent = correct
    ? "小星送给你两颗闪亮星星。"
    : `正确答案是 ${activity.speechHint}。`;
  nextButton.innerHTML = questionIndex === session.length - 1
    ? "看看我的星星 <span aria-hidden=\"true\">→</span>"
    : "下一题 <span aria-hidden=\"true\">→</span>";
  feedback.hidden = false;
  document.querySelector("#session-stars").textContent = results.filter((item) => item.correct).length * 2;
  speakEnglish(correct ? "Great job!" : activity.speech);
  nextButton.focus();
}

function finishLesson() {
  const summary = scoreSession(results);
  progress = mergeProgress(progress, summary, new Date().toISOString());
  saveProgress();
  document.querySelector("#complete-correct").textContent = `${summary.correct} / ${summary.attempts}`;
  document.querySelector("#complete-stars").textContent = summary.stars;
  document.querySelector("#complete-message").textContent = summary.correct === summary.attempts
    ? "全都答对啦，你的英语耳朵闪闪发光！"
    : "你认真听、勇敢选，每一次尝试都在长大！";
  setScreen("complete-screen");
  speakEnglish("Amazing! See you next time!");
}

function nextActivity() {
  if (!answered) return;
  if (questionIndex >= session.length - 1) {
    finishLesson();
    return;
  }
  questionIndex += 1;
  renderActivity();
}

function renderParentReport() {
  const accuracy = progress.totalAttempts
    ? `${Math.round((progress.totalCorrect / progress.totalAttempts) * 100)}%`
    : "—";
  document.querySelector("#report-days").textContent = `${progress.learningDays} 天`;
  document.querySelector("#report-sessions").textContent = `${progress.sessions} 次练习`;
  document.querySelector("#report-stars").textContent = `${progress.stars} 颗`;
  document.querySelector("#report-accuracy").textContent = accuracy;
  document.querySelector("#report-attempts").textContent = progress.totalAttempts
    ? `共完成 ${progress.totalAttempts} 道题`
    : "还没有答题记录";

  const list = document.querySelector("#skill-list");
  list.innerHTML = "";
  for (const [type, name] of Object.entries(TYPE_NAMES)) {
    const stats = progress.byType[type] ?? { attempts: 0, correct: 0 };
    const value = stats.attempts ? Math.round((stats.correct / stats.attempts) * 100) : 0;
    const row = document.createElement("div");
    row.className = "skill-row";
    row.innerHTML = `<div><strong>${name}</strong><span>${stats.attempts ? `${value}%` : "等待第一次练习"}</span></div><div class="skill-track"><span style="width:${value}%"></span></div>`;
    list.append(row);
  }
  renderSubscription();
}

function renderSubscription() {
  const active = subscription.status === "active";
  const status = document.querySelector("#subscription-status");
  const button = document.querySelector("#open-subscription");
  status.textContent = active ? "已开启模拟订阅 · 本机演示" : "尚未订阅";
  status.classList.toggle("is-active", active);
  button.textContent = active ? "查看模拟订阅" : "微信扫码订阅";
}

function openSubscriptionDialog() {
  const active = subscription.status === "active";
  subscriptionCheckout.hidden = active;
  subscriptionSuccess.hidden = !active;
  subscriptionDialog.showModal();
}

function completeDemoSubscription() {
  subscription = activateDemoSubscription(subscription);
  saveSubscription();
  renderSubscription();
  subscriptionCheckout.hidden = true;
  subscriptionSuccess.hidden = false;
  showToast("模拟订阅已开启，不会产生真实扣款。");
}

function openParentReport() {
  renderParentReport();
  setScreen("parent-screen");
  parentHold.style.setProperty("--hold-progress", "0deg");
}

function updateHoldProgress() {
  const elapsed = performance.now() - holdStartedAt;
  const ratio = Math.min(elapsed / 3000, 1);
  parentHold.style.setProperty("--hold-progress", `${ratio * 360}deg`);
  if (ratio < 1) holdFrame = requestAnimationFrame(updateHoldProgress);
}

function beginParentHold(event) {
  if (event.type === "keydown" && !["Enter", " "].includes(event.key)) return;
  if (holdTimer) return;
  holdStartedAt = performance.now();
  holdFrame = requestAnimationFrame(updateHoldProgress);
  holdTimer = window.setTimeout(() => {
    holdTimer = 0;
    cancelAnimationFrame(holdFrame);
    openParentReport();
  }, 3000);
}

function cancelParentHold(event) {
  if (event.type === "keyup" && !["Enter", " "].includes(event.key)) return;
  if (holdTimer) window.clearTimeout(holdTimer);
  holdTimer = 0;
  cancelAnimationFrame(holdFrame);
  parentHold.style.setProperty("--hold-progress", "0deg");
}

function registerWebMcpTool() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  try {
    void Promise.resolve(context.registerTool({
      name: "start_daily_lesson",
      title: "开始今日英语练习",
      description: "打开星芽英语的五题彩虹野餐学习流程。",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute() {
        return startLesson();
      },
    })).catch(() => {});
  } catch {
    // Unsupported experimental implementations must not interrupt the child flow.
  }
}

startButton.addEventListener("click", startLesson);
listenButton.addEventListener("click", () => speakEnglish(session[questionIndex]?.speech ?? ""));
nextButton.addEventListener("click", nextActivity);
document.querySelector("#exit-lesson").addEventListener("click", () => {
  window.speechSynthesis?.cancel();
  renderHome();
  setScreen("home-screen");
});
document.querySelector("#brand-home").addEventListener("click", () => {
  renderHome();
  setScreen("home-screen");
});
document.querySelector("#complete-home").addEventListener("click", () => {
  renderHome();
  setScreen("home-screen");
});
document.querySelector("#practice-again").addEventListener("click", startLesson);
document.querySelector("#parent-close").addEventListener("click", () => {
  renderHome();
  setScreen("home-screen");
});
document.querySelector("#reset-progress").addEventListener("click", () => resetDialog.showModal());
document.querySelector("#open-subscription").addEventListener("click", openSubscriptionDialog);
document.querySelector("#complete-demo-payment").addEventListener("click", completeDemoSubscription);
document.querySelector("#confirm-reset").addEventListener("click", () => {
  progress = emptyProgress();
  saveProgress();
  renderParentReport();
  showToast("本机学习记录已清除。");
});

for (const eventName of ["pointerdown", "keydown"]) parentHold.addEventListener(eventName, beginParentHold);
for (const eventName of ["pointerup", "pointercancel", "pointerleave", "keyup", "blur"]) {
  parentHold.addEventListener(eventName, cancelParentHold);
}

renderHome();
registerWebMcpTool();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      showToast("离线功能暂未启动，联网时仍可正常学习。");
    });
  });
}
