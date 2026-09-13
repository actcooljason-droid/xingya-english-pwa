const UNIT_DEFINITIONS = [
  {
    id: "u1",
    number: 1,
    title: "Hello, Me!",
    chineseTitle: "你好，这就是我",
    icon: "👋",
    color: "sun",
    summary: "会问好、介绍自己，也能说出年龄和喜欢的颜色。",
    lessons: [
      ["u1-l1", "Hello!", "见面问好", ["A", "B", "C", "D"], [["hello", "👋"], ["bye", "🙌"], ["name", "🏷️"], ["boy", "👦"], ["girl", "👧"]], "Hello! I'm Mia.", 0],
      ["u1-l2", "How are you?", "说说心情", ["E", "F", "G", "H"], [["happy", "😊"], ["sad", "😢"], ["fine", "👍"], ["friend", "🤝"], ["smile", "😁"]], "How are you? I'm happy.", 0],
      ["u1-l3", "I am five", "年龄与数字", ["I", "J", "K", "L"], [["one", "1️⃣"], ["two", "2️⃣"], ["three", "3️⃣"], ["four", "4️⃣"], ["five", "5️⃣"]], "I am five.", 4],
      ["u1-l4", "My favorite color", "我喜欢的颜色", ["M", "N", "O", "P"], [["red", "🔴"], ["blue", "🔵"], ["yellow", "🟡"], ["green", "🟢"], ["pink", "🩷"]], "My favorite color is blue.", 1],
    ],
  },
  {
    id: "u2",
    number: 2,
    title: "My Family",
    chineseTitle: "我的家人",
    icon: "🏡",
    color: "coral",
    summary: "认识家庭成员，介绍家人，并说出家里的常见空间。",
    lessons: [
      ["u2-l1", "This is my mom", "家庭成员", ["Q", "R", "S", "T"], [["mom", "👩"], ["dad", "👨"], ["sister", "👧"], ["brother", "👦"], ["baby", "👶"]], "This is my mom.", 0],
      ["u2-l2", "I love my family", "爱与陪伴", ["U", "V", "W", "X"], [["grandma", "👵"], ["grandpa", "👴"], ["family", "👨‍👩‍👧"], ["home", "🏠"], ["love", "❤️"]], "I love my family.", 2],
      ["u2-l3", "Big or small", "描述家人", ["Y", "Z", "A", "B"], [["big", "🐘"], ["small", "🐭"], ["young", "🧒"], ["old", "👴"], ["kind", "🥰"]], "My dad is kind.", 4],
      ["u2-l4", "Welcome home", "家里的房间", ["C", "D", "E", "F"], [["kitchen", "🍳"], ["bedroom", "🛏️"], ["bathroom", "🛁"], ["garden", "🌻"], ["door", "🚪"]], "This is the door.", 4],
    ],
  },
  {
    id: "u3",
    number: 3,
    title: "Ready for School",
    chineseTitle: "准备去上学",
    icon: "🎒",
    color: "sky",
    summary: "认识校园物品，听懂课堂指令，练习礼貌表达。",
    lessons: [
      ["u3-l1", "My school", "认识新校园", ["G", "H", "I", "J"], [["school", "🏫"], ["teacher", "🧑‍🏫"], ["friend", "🤝"], ["classroom", "🪑"], ["playground", "🛝"]], "I go to school."],
      ["u3-l2", "In my schoolbag", "学习用品", ["K", "L", "M", "N"], [["book", "📘"], ["bag", "🎒"], ["pencil", "✏️"], ["ruler", "📏"], ["eraser", "▰"]], "This is my pencil."],
      ["u3-l3", "Listen and do", "课堂小指令", ["O", "P", "Q", "R"], [["sit", "🪑"], ["stand", "🧍"], ["listen", "👂"], ["look", "👀"], ["open", "📖"]], "Sit down, please."],
      ["u3-l4", "Kind words", "礼貌与合作", ["S", "T", "U", "V"], [["please", "🙏"], ["thanks", "💛"], ["sorry", "🤲"], ["help", "🙋"], ["share", "🫶"]], "Can I help you?"],
    ],
  },
  {
    id: "u4",
    number: 4,
    title: "Colors & Numbers",
    chineseTitle: "颜色、形状与数字",
    icon: "🌈",
    color: "mint",
    summary: "听辨颜色、形状和 1～10，并用简单词语比较大小。",
    lessons: [
      ["u4-l1", "A rainbow", "彩虹颜色", ["W", "X", "Y", "Z"], [["red", "🔴"], ["orange", "🟠"], ["yellow", "🟡"], ["green", "🟢"], ["blue", "🔵"]], "It is blue."],
      ["u4-l2", "Shapes around us", "身边的形状", ["A", "B", "C", "D"], [["circle", "●"], ["square", "■"], ["triangle", "▲"], ["star", "★"], ["heart", "♥"]], "It is a circle."],
      ["u4-l3", "Six to ten", "继续数一数", ["E", "F", "G", "H"], [["six", "6️⃣"], ["seven", "7️⃣"], ["eight", "8️⃣"], ["nine", "9️⃣"], ["ten", "🔟"]], "I can count to ten."],
      ["u4-l4", "Look and compare", "大小与长短", ["I", "J", "K", "L"], [["big", "🐳"], ["small", "🐜"], ["long", "📏"], ["short", "✂️"], ["same", "🟰"]], "It is a big circle."],
    ],
  },
  {
    id: "u5",
    number: 5,
    title: "Animals & Food",
    chineseTitle: "动物与食物",
    icon: "🐾",
    color: "grape",
    summary: "认识常见动物和食物，表达喜欢、想要与简单选择。",
    lessons: [
      ["u5-l1", "Little pets", "可爱小动物", ["M", "N", "O", "P"], [["cat", "🐱"], ["dog", "🐶"], ["bird", "🐦"], ["fish", "🐟"], ["rabbit", "🐰"]], "I like cats."],
      ["u5-l2", "At the zoo", "动物园朋友", ["Q", "R", "S", "T"], [["lion", "🦁"], ["tiger", "🐯"], ["elephant", "🐘"], ["monkey", "🐵"], ["panda", "🐼"]], "I see a panda."],
      ["u5-l3", "Breakfast time", "早餐吃什么", ["U", "V", "W", "X"], [["apple", "🍎"], ["banana", "🍌"], ["milk", "🥛"], ["bread", "🍞"], ["egg", "🥚"]], "I want some milk."],
      ["u5-l4", "Yummy lunch", "午餐与点心", ["Y", "Z", "A", "B"], [["rice", "🍚"], ["noodles", "🍜"], ["water", "💧"], ["juice", "🧃"], ["cake", "🍰"]], "I like noodles."],
    ],
  },
  {
    id: "u6",
    number: 6,
    title: "My Day & Weather",
    chineseTitle: "我的一天与天气",
    icon: "☀️",
    color: "ocean",
    summary: "说出日常动作、时间和天气，完成一段小学生活预演。",
    lessons: [
      ["u6-l1", "Good morning", "早晨小任务", ["C", "D", "E", "F"], [["wake", "⏰"], ["wash", "🫧"], ["dress", "👕"], ["eat", "🥣"], ["go", "🚶"]], "I wake up."],
      ["u6-l2", "From day to night", "一天的时间", ["G", "H", "I", "J"], [["morning", "🌅"], ["afternoon", "🌤️"], ["evening", "🌆"], ["night", "🌙"], ["today", "📅"]], "Good night!"],
      ["u6-l3", "How is the weather?", "天气小播报", ["K", "L", "M", "N"], [["sunny", "☀️"], ["rainy", "🌧️"], ["windy", "💨"], ["cloudy", "☁️"], ["snowy", "🌨️"]], "It is sunny today."],
      ["u6-l4", "I am ready!", "入学英语挑战", ["O", "P", "Q", "R", "S", "T"], [["run", "🏃"], ["jump", "🤸"], ["read", "📖"], ["sing", "🎵"], ["sleep", "😴"]], "I can read and sing."],
    ],
  },
];

function rotate(items, amount) {
  const offset = amount % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

function option(id, visual, label) {
  return { id, visual, label };
}

function wordOptions(words, targetIndex, seed) {
  const target = words[targetIndex];
  const distractors = words.filter((_, index) => index !== targetIndex).slice(0, 2);
  return rotate([target, ...distractors], seed).map(([word, visual]) => option(word, visual, word));
}

function makeActivities(unitId, lessonId, order, letters, words, sentence, preferredReadingIndex) {
  const targetLetter = letters[0];
  const inferredReadingIndex = words.findIndex(([word]) => sentence.toLowerCase().includes(word));
  const readingIndex = Number.isInteger(preferredReadingIndex) ? preferredReadingIndex : Math.max(inferredReadingIndex, 0);
  const letterOptions = rotate(letters.slice(0, 3), order).map((letter) => option(letter.toLowerCase(), letter, letter));
  const sentenceOptions = rotate([
    option("target", "💬", sentence),
    option("decoy-one", "🌙", "Good night!"),
    option("decoy-two", "🍎", "I like apples."),
  ], order);
  const base = { unitId, lessonId };

  return [
    { ...base, id: `${lessonId}-warmup`, type: "vocabulary", label: "热身认词", prompt: `先热热身：找到 ${words[0][0]}`, speech: words[0][0], speechHint: words[0][0], correctOptionId: words[0][0], options: wordOptions(words, 0, order) },
    { ...base, id: `${lessonId}-listen`, type: "listening", label: "听音选图", prompt: "听一听，选出正确的图片", speech: words[1][0], speechHint: words[1][0], correctOptionId: words[1][0], options: wordOptions(words, 1, order + 1) },
    { ...base, id: `${lessonId}-phonics`, type: "phonics", label: "字母与首音", prompt: `听声音，找到字母 ${targetLetter}`, speech: targetLetter, speechHint: `字母 ${targetLetter}`, correctOptionId: targetLetter.toLowerCase(), options: letterOptions },
    { ...base, id: `${lessonId}-match`, type: "vocabulary", label: "看词选图", prompt: `哪一张图片是 ${words[2][0]}？`, speech: words[2][0], speechHint: words[2][0], correctOptionId: words[2][0], options: wordOptions(words, 2, order + 2) },
    { ...base, id: `${lessonId}-speak`, type: "speaking", label: "开口表达", prompt: "听一听，选出今天要学的表达", speech: sentence, speechHint: sentence, correctOptionId: "target", options: sentenceOptions },
    { ...base, id: `${lessonId}-read`, type: "reading", label: "看图理解", prompt: `读一读“${sentence}”，哪张图片最合适？`, speech: sentence, speechHint: sentence, correctOptionId: words[readingIndex][0], options: wordOptions(words, readingIndex, order + 1) },
    { ...base, id: `${lessonId}-review`, type: "listening", label: "星星挑战", prompt: "最后听一次，找到正确答案", speech: words[4][0], speechHint: words[4][0], correctOptionId: words[4][0], options: wordOptions(words, 4, order + 2) },
  ];
}

export const courseUnits = UNIT_DEFINITIONS.map((unit) => ({
  ...unit,
  lessons: unit.lessons.map(([id, title, chineseTitle, letters, words, sentence, readingIndex], index) => {
    const order = (unit.number - 1) * 4 + index + 1;
    return {
      id,
      unitId: unit.id,
      order,
      title,
      chineseTitle,
      duration: 9,
      letters,
      words: words.map(([word]) => word),
      sentence,
      goals: [`认识 ${words.slice(0, 3).map(([word]) => word).join("、")}`, `听懂并尝试表达“${sentence}”`],
      activities: makeActivities(unit.id, id, order, letters, words, sentence, readingIndex),
    };
  }),
}));

export const courseRequirements = [
  { id: "phonics", name: "字母与自然拼读", target: "辨认 A–Z 大小写，感知常见首音" },
  { id: "listening", name: "听力理解", target: "听辨约 120 个核心词汇和常见指令" },
  { id: "speaking", name: "口语表达", target: "模仿并使用 24 个生活化高频句型" },
  { id: "vocabulary", name: "词汇认读", target: "建立图片、声音与英文词形的联系" },
  { id: "reading", name: "看图阅读", target: "借助图片理解短句与简单情境" },
];
