import { checkAnswer, emptyProgress, mergeProgress, scoreSession } from "./learning-engine.js";
import { courseRequirements, courseUnits } from "./course-data.js";
import {
  buildReviewSession,
  completeLesson,
  flattenLessons,
  getCourseMap,
  getNextLesson,
  updateReviewQueue,
  validateCourse,
} from "./course-engine.js";
import { createSubscriptionOffer, requestWechatCheckout } from "./subscription.js";

const STORAGE_KEY = "xingya-english-progress-v1";
const lessons = flattenLessons(courseUnits);
const offer = createSubscriptionOffer();
const TYPE_NAMES = Object.fromEntries(courseRequirements.map((item) => [item.id, item.name]));

const screens = [...document.querySelectorAll(".screen")];
const answerGrid = document.querySelector("#answer-grid");
const feedback = document.querySelector("#feedback");
const listenButton = document.querySelector("#listen-button");
const nextButton = document.querySelector("#next-button");
const parentHold = document.querySelector("#parent-hold");
const resetDialog = document.querySelector("#reset-dialog");
const subscriptionDialog = document.querySelector("#subscription-dialog");
const subscriptionCheckout = document.querySelector("#subscription-checkout");
const subscriptionDevelopment = document.querySelector("#subscription-development");
const toast = document.querySelector("#toast");
const audioPlayer = new Audio();
audioPlayer.preload = "auto";
audioPlayer.id = "course-audio";
audioPlayer.hidden = true;
audioPlayer.setAttribute("aria-hidden", "true");
document.body.append(audioPlayer);

let progress = loadProgress();
let session = [];
let sessionKind = "course";
let currentLesson = null;
let questionIndex = 0;
let results = [];
let answered = false;
let holdTimer = 0;
let holdFrame = 0;
let holdStartedAt = 0;
let activeUtterance = null;

validateCourse(courseUnits);

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...emptyProgress(), ...saved } : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    showToast("本次成绩暂时无法保存，但可以继续学习。");
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => { toast.hidden = true; }, 3200);
}

function stopAudio() {
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  window.speechSynthesis?.cancel();
}

function speakWithSystem(text) {
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    showToast("未能播放声音，请检查手机媒体音量后再试。");
    return;
  }
  window.speechSynthesis.cancel();
  activeUtterance = new SpeechSynthesisUtterance(text);
  activeUtterance.lang = "en-US";
  activeUtterance.rate = 0.76;
  activeUtterance.pitch = 1.05;
  const englishVoice = window.speechSynthesis.getVoices().find((voice) => voice.lang?.toLowerCase().startsWith("en-us"));
  if (englishVoice) activeUtterance.voice = englishVoice;
  window.speechSynthesis.resume();
  window.speechSynthesis.speak(activeUtterance);
}

function playActivityAudio(activity = session[questionIndex]) {
  if (!activity) return;
  stopAudio();
  let fallbackUsed = false;
  const fallback = () => {
    if (fallbackUsed) return;
    fallbackUsed = true;
    audioPlayer.onerror = null;
    speakWithSystem(activity.speech);
  };
  audioPlayer.onerror = fallback;
  audioPlayer.src = `./assets/audio/${activity.id}.wav`;
  const playback = audioPlayer.play();
  if (playback?.catch) playback.catch(fallback);
}

function setScreen(id) {
  for (const screen of screens) {
    const active = screen.id === id;
    screen.hidden = !active;
    screen.classList.toggle("is-active", active);
  }
  for (const button of document.querySelectorAll(".nav-button")) {
    button.classList.toggle("is-active", button.dataset.screen === id);
  }
  if (id === "home-screen") renderHome();
  if (id === "course-screen") renderCourseMap();
  if (id === "review-screen") renderReview();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function findUnit(lesson) {
  return courseUnits.find((unit) => unit.id === lesson?.unitId) ?? courseUnits[0];
}

function renderHome() {
  const nextLesson = getNextLesson(courseUnits, progress.completedLessonIds);
  const lesson = nextLesson ?? lessons.at(-1);
  const unit = findUnit(lesson);
  document.querySelector("#home-unit").innerHTML = `<span aria-hidden="true">${unit.icon}</span> Unit ${unit.number} · Lesson ${lesson.order}`;
  document.querySelector("#home-title").innerHTML = `${lesson.title}<br><span>${lesson.chineseTitle}</span>`;
  document.querySelector("#home-goal").textContent = lesson.goals.join("；");
  document.querySelector("#home-stars").textContent = progress.stars;
  document.querySelector("#home-lessons").textContent = progress.completedLessonIds.length;
  document.querySelector("#home-progress-fill").style.width = `${(progress.completedLessonIds.length / lessons.length) * 100}%`;
  document.querySelector("#growth-message").textContent = nextLesson
    ? `下一站：${unit.chineseTitle} · ${lesson.chineseTitle}`
    : "24 节课全部完成，随时回来复习喜欢的主题！";
  document.querySelector("#start-button span:first-child").textContent = nextLesson ? "开始这一课" : "再玩最后一课";
  document.querySelector("#start-button").onclick = () => startLesson(lesson, "course");

  const stickerGrid = document.querySelector("#sticker-grid");
  stickerGrid.innerHTML = "";
  for (const item of courseUnits) {
    const earned = item.lessons.every((courseLesson) => progress.completedLessonIds.includes(courseLesson.id));
    const sticker = document.createElement("article");
    sticker.className = `sticker ${earned ? "is-earned" : ""}`;
    sticker.innerHTML = `<span>${earned ? item.icon : "?"}</span><strong>${item.chineseTitle}</strong><small>${earned ? "已点亮" : "完成单元后点亮"}</small>`;
    stickerGrid.append(sticker);
  }
}

function renderCourseMap() {
  const map = getCourseMap(courseUnits, progress.completedLessonIds);
  document.querySelector("#map-completed").textContent = `${progress.completedLessonIds.length} / ${lessons.length}`;
  const container = document.querySelector("#course-map");
  container.innerHTML = "";
  for (const unit of map) {
    const completeCount = unit.lessons.filter((lesson) => lesson.status === "complete").length;
    const card = document.createElement("article");
    card.className = `unit-card unit-card--${unit.color}`;
    card.innerHTML = `<header><span class="unit-icon">${unit.icon}</span><div><p>UNIT ${unit.number}</p><h2>${unit.title}</h2><strong>${unit.chineseTitle}</strong></div><span class="unit-count">${completeCount} / 4</span></header><p class="unit-summary">${unit.summary}</p><div class="lesson-list"></div>`;
    const list = card.querySelector(".lesson-list");
    for (const lesson of unit.lessons) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `lesson-row is-${lesson.status}`;
      button.disabled = lesson.status === "locked";
      const stateIcon = lesson.status === "complete" ? "✓" : lesson.status === "current" ? "▶" : "⌁";
      const stateText = lesson.status === "complete" ? "再练一次" : lesson.status === "current" ? "现在学习" : "完成上一课后解锁";
      button.innerHTML = `<span class="lesson-state">${stateIcon}</span><span><strong>${lesson.order}. ${lesson.title}</strong><small>${lesson.chineseTitle} · ${lesson.duration} 分钟</small></span><em>${stateText}</em>`;
      if (!button.disabled) button.addEventListener("click", () => startLesson(lesson, "course"));
      list.append(button);
    }
    container.append(card);
  }
}

function accuracyFor(type) {
  const stats = progress.byType[type] ?? { attempts: 0, correct: 0 };
  return stats.attempts ? Math.round((stats.correct / stats.attempts) * 100) : 0;
}

function renderSkillRows(container, includeTargets = false) {
  container.innerHTML = "";
  for (const requirement of courseRequirements) {
    const value = accuracyFor(requirement.id);
    const row = document.createElement("div");
    row.className = includeTargets ? "requirement-row" : "skill-row";
    row.innerHTML = `<div><strong>${requirement.name}</strong><span>${includeTargets ? requirement.target : (progress.byType[requirement.id]?.attempts ? `${value}%` : "等待练习")}</span>${includeTargets ? `<em>${progress.byType[requirement.id]?.attempts ? `${value}%` : "未开始"}</em>` : ""}</div><div class="skill-track"><span style="width:${value}%"></span></div>`;
    container.append(row);
  }
}

function renderReview() {
  const count = progress.wrongActivityIds.length;
  document.querySelector("#review-count").textContent = count;
  document.querySelector("#review-copy").textContent = progress.completedLessonIds.length
    ? count ? `有 ${count} 个内容值得再练一次，练会后会自动离开复习清单。` : "目前没有错题，小星会从已学课程里安排一次综合巩固。"
    : "完成第一课后，小星会帮你收集需要再练习的内容。";
  const startReview = document.querySelector("#start-review");
  startReview.disabled = progress.completedLessonIds.length === 0;
  startReview.textContent = progress.completedLessonIds.length ? "开始复习" : "先完成第一课";
  renderSkillRows(document.querySelector("#review-skill-list"));
}

function startLesson(lesson, kind = "course") {
  sessionKind = kind;
  currentLesson = kind === "course" ? lesson : null;
  session = kind === "course" ? [...lesson.activities] : buildReviewSession(courseUnits, progress, 7);
  questionIndex = 0;
  results = [];
  answered = false;
  document.querySelector("#lesson-name").textContent = kind === "course" ? `Lesson ${lesson.order} · ${lesson.chineseTitle}` : "智能复习";
  document.querySelector("#question-total").textContent = session.length;
  document.querySelector(".progress-track").setAttribute("aria-valuemax", session.length);
  setScreen("lesson-screen");
  renderActivity();
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
    visual.className = activity.type === "phonics" ? "option-visual option-visual--letter" : "option-visual";
    visual.textContent = option.visual;
    const label = document.createElement("span");
    label.className = "option-label";
    label.textContent = option.label;
    button.append(visual, label);
    button.addEventListener("click", () => chooseAnswer(button, option.id));
    answerGrid.append(button);
  }
  playActivityAudio(activity);
}

function chooseAnswer(selectedButton, selectedId) {
  if (answered) return;
  answered = true;
  const activity = session[questionIndex];
  const correct = checkAnswer(activity, selectedId);
  results.push({ activityId: activity.id, type: activity.type, correct });
  for (const button of answerGrid.querySelectorAll("button")) {
    button.disabled = true;
    if (button.dataset.optionId === activity.correctOptionId) button.classList.add("is-correct");
  }
  if (!correct) {
    selectedButton.classList.add("is-wrong");
    playActivityAudio(activity);
  }
  document.querySelector("#feedback-title").textContent = correct ? "答对啦！" : "没关系，再听一次";
  document.querySelector("#feedback-copy").textContent = correct ? "小星送给你两颗闪亮星星。" : `正确答案是 ${activity.speechHint}。`;
  nextButton.innerHTML = questionIndex === session.length - 1 ? "看看我的星星 <span aria-hidden=\"true\">→</span>" : "下一题 <span aria-hidden=\"true\">→</span>";
  feedback.hidden = false;
  document.querySelector("#session-stars").textContent = results.filter((item) => item.correct).length * 2;
  nextButton.focus();
}

function finishLesson() {
  const summary = scoreSession(results);
  progress = mergeProgress(progress, summary, new Date().toISOString());
  progress = updateReviewQueue(progress, results);
  if (sessionKind === "course" && currentLesson) progress = completeLesson(progress, currentLesson.id);
  saveProgress();
  document.querySelector("#complete-kicker").textContent = sessionKind === "course" ? "LESSON COMPLETE" : "REVIEW COMPLETE";
  document.querySelector("#complete-title").textContent = sessionKind === "course" ? `${currentLesson.chineseTitle}完成啦！` : "复习完成啦！";
  document.querySelector("#complete-correct").textContent = `${summary.correct} / ${summary.attempts}`;
  document.querySelector("#complete-stars").textContent = summary.stars;
  document.querySelector("#complete-course").textContent = `${progress.completedLessonIds.length} / ${lessons.length}`;
  const nextLesson = getNextLesson(courseUnits, progress.completedLessonIds);
  const continueButton = document.querySelector("#continue-learning");
  continueButton.textContent = nextLesson ? "继续下一课" : "进入复习中心";
  continueButton.onclick = () => nextLesson ? startLesson(nextLesson, "course") : setScreen("review-screen");
  setScreen("complete-screen");
}

function nextActivity() {
  if (!answered) return;
  if (questionIndex >= session.length - 1) finishLesson();
  else { questionIndex += 1; renderActivity(); }
}

function renderParentReport() {
  const accuracy = progress.totalAttempts ? `${Math.round((progress.totalCorrect / progress.totalAttempts) * 100)}%` : "—";
  document.querySelector("#report-days").textContent = `${progress.learningDays} 天`;
  document.querySelector("#report-sessions").textContent = `${progress.sessions} 次练习`;
  document.querySelector("#report-lessons").textContent = `${progress.completedLessonIds.length} / ${lessons.length}`;
  document.querySelector("#report-accuracy").textContent = accuracy;
  document.querySelector("#report-attempts").textContent = progress.totalAttempts ? `共完成 ${progress.totalAttempts} 道题` : "还没有答题记录";
  document.querySelector("#report-stars").textContent = `${progress.stars} 颗星星`;
  renderSkillRows(document.querySelector("#requirement-list"), true);

  const unitReport = document.querySelector("#unit-report");
  unitReport.innerHTML = "";
  for (const unit of courseUnits) {
    const count = unit.lessons.filter((lesson) => progress.completedLessonIds.includes(lesson.id)).length;
    const item = document.createElement("article");
    item.innerHTML = `<span>${unit.icon}</span><div><strong>${unit.chineseTitle}</strong><small>${unit.summary}</small><div class="unit-mini-track"><span style="width:${(count / 4) * 100}%"></span></div></div><em>${count} / 4</em>`;
    unitReport.append(item);
  }
}

function openParentReport() {
  renderParentReport();
  setScreen("parent-screen");
  parentHold.style.setProperty("--hold-progress", "0deg");
}

function updateHoldProgress() {
  const ratio = Math.min((performance.now() - holdStartedAt) / 3000, 1);
  parentHold.style.setProperty("--hold-progress", `${ratio * 360}deg`);
  if (ratio < 1) holdFrame = requestAnimationFrame(updateHoldProgress);
}

function beginParentHold(event) {
  if (event.type === "keydown" && !["Enter", " "].includes(event.key)) return;
  if (holdTimer) return;
  holdStartedAt = performance.now();
  holdFrame = requestAnimationFrame(updateHoldProgress);
  holdTimer = window.setTimeout(() => { holdTimer = 0; cancelAnimationFrame(holdFrame); openParentReport(); }, 3000);
}

function cancelParentHold(event) {
  if (event.type === "keyup" && !["Enter", " "].includes(event.key)) return;
  if (holdTimer) window.clearTimeout(holdTimer);
  holdTimer = 0;
  cancelAnimationFrame(holdFrame);
  parentHold.style.setProperty("--hold-progress", "0deg");
}

function openSubscriptionDialog() {
  subscriptionCheckout.hidden = false;
  subscriptionDevelopment.hidden = true;
  document.querySelector("#subscription-dialog-title").textContent = offer.planName;
  subscriptionDialog.showModal();
}

function confirmWechatPayment() {
  const checkout = requestWechatCheckout(offer);
  subscriptionCheckout.hidden = true;
  subscriptionDevelopment.hidden = false;
  subscriptionDevelopment.querySelector("p").textContent = `${checkout.message} 支付通道尚未开放，当前不会创建订单或产生扣款。`;
}

function registerWebMcpTool() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  try {
    void Promise.resolve(context.registerTool({
      name: "start_next_english_lesson",
      title: "开始下一节英语课",
      description: "打开星芽英语课程地图中的下一节 7 题幼小衔接课程。",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute() {
        const lesson = getNextLesson(courseUnits, progress.completedLessonIds) ?? lessons.at(-1);
        startLesson(lesson, "course");
        return { status: "started", lesson: lesson.title, activities: 7 };
      },
    })).catch(() => {});
  } catch { /* Experimental browser integrations must not interrupt learning. */ }
}

document.querySelector("#brand-home").addEventListener("click", () => setScreen("home-screen"));
for (const button of document.querySelectorAll("[data-screen]")) button.addEventListener("click", () => setScreen(button.dataset.screen));
document.querySelector("#start-review").addEventListener("click", () => startLesson(null, "review"));
listenButton.addEventListener("click", () => playActivityAudio());
nextButton.addEventListener("click", nextActivity);
document.querySelector("#exit-lesson").addEventListener("click", () => { stopAudio(); setScreen(sessionKind === "course" ? "course-screen" : "review-screen"); });
document.querySelector("#complete-home").addEventListener("click", () => setScreen("home-screen"));
document.querySelector("#parent-close").addEventListener("click", () => setScreen("home-screen"));
document.querySelector("#reset-progress").addEventListener("click", () => resetDialog.showModal());
document.querySelector("#confirm-reset").addEventListener("click", () => { progress = emptyProgress(); saveProgress(); renderParentReport(); showToast("本机学习记录已清除。"); });
document.querySelector("#open-subscription").addEventListener("click", openSubscriptionDialog);
document.querySelector("#confirm-wechat-payment").addEventListener("click", confirmWechatPayment);
for (const eventName of ["pointerdown", "keydown"]) parentHold.addEventListener(eventName, beginParentHold);
for (const eventName of ["pointerup", "pointercancel", "pointerleave", "keyup", "blur"]) parentHold.addEventListener(eventName, cancelParentHold);

renderHome();
registerWebMcpTool();
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => showToast("离线功能暂未启动，联网时仍可正常学习。")));
