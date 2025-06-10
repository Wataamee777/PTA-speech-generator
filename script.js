const corpora = {
  pta: `皆さん、おはようございます。本日はご多忙の中、集まっていただきありがとうございます。
私たちPTAは、子どもたちの健やかな成長を支えるために、日々活動しております。
地域清掃、スマホの使い方、命の教育など、様々な取り組みを続けてまいります。
今後とも温かいご支援をよろしくお願いいたします。`,
  principal: `皆さん、おはようございます。本日は始業式にあたり、お話をさせていただきます。
学校は心を育てる場所であり、挑戦する場でもあります。
教職員一同、子どもたちの成長を見守り、支えてまいります。
保護者の皆様と連携し、よりよい教育環境を築いてまいります。`
};

let markov = {};
let autoReading = false;
let typingTimer = null;
let typingIndex = 0;
let currentText = "";

function buildMarkovChain(text, n = 2) {
  const words = text.replace(/。/g, "。 ").split(/\s+/);
  const chain = {};
  for (let i = 0; i < words.length - n; i++) {
    const key = words.slice(i, i + n).join(" ");
    const next = words[i + n];
    if (!chain[key]) chain[key] = [];
    chain[key].push(next);
  }
  return chain;
}

function generateSentence(chain, maxLength = 60, n = 2) {
  const keys = Object.keys(chain);
  let key = keys[Math.floor(Math.random() * keys.length)];
  let result = key.split(" ");
  for (let i = 0; i < maxLength; i++) {
    const nextWords = chain[key];
    if (!nextWords) break;
    const next = nextWords[Math.floor(Math.random() * nextWords.length)];
    result.push(next);
    key = result.slice(result.length - n, result.length).join(" ");
  }
  return result.join("").replace(/\s/g, "").slice(0, 300);
}

function typeWriterEffect(text, element, speed = 80, callback) {
  element.textContent = "";
  typingIndex = 0;
  currentText = text;

  if (typingTimer) clearInterval(typingTimer);

  typingTimer = setInterval(() => {
    element.textContent += currentText.charAt(typingIndex);
    typingIndex++;
    if (typingIndex >= currentText.length) {
      clearInterval(typingTimer);
      typingTimer = null;
      if (callback) callback();
    }
  }, speed);
}

function speakText(text, callback) {
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ja-JP";
  utter.rate = 1;
  utter.onend = () => {
    if (callback) callback();
  };
  speechSynthesis.speak(utter);
}

function loopGenerateSpeech() {
  if (!autoReading) return;

  const theme = document.getElementById("themeSelect").value;
  markov = buildMarkovChain(corpora[theme]);
  const speech = generateSentence(markov, 60);

  const speechArea = document.getElementById("speechArea");
  const editArea = document.getElementById("editArea");

  typeWriterEffect(speech, speechArea, 80, () => {
    editArea.value = speech;
    speakText(speech, () => {
      setTimeout(loopGenerateSpeech, 1000);
    });
  });
}

function toggleAutoRead() {
  if (autoReading) {
    autoReading = false;
    speechSynthesis.cancel();
    alert("連続読み上げを停止しました。");
  } else {
    autoReading = true;
    loopGenerateSpeech();
    alert("連続読み上げを開始しました。");
  }
}

window.onload = () => {
  toggleAutoRead();
};

// その他機能

function copyText() {
  const text = document.getElementById("editArea").value;
  if (!text) return alert("コピーするテキストがありません。");
  navigator.clipboard.writeText(text).then(() => {
    alert("コピーしました！");
  });
}

function printText() {
  const text = document.getElementById("editArea").value;
  if (!text) return alert("印刷するテキストがありません。");
  const w = window.open();
  w.document.write(`<pre style="font-size:16px;">${text}</pre>`);
  w.document.close();
  w.print();
}

function saveImage() {
  const target = document.getElementById("speechArea");
  if (!target.textContent.trim()) return alert("画像化するテキストがありません。");
  html2canvas(target).then(canvas => {
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "speech.png";
    a.click();
  });
}

function tweetEdited() {
  let text = document.getElementById("editArea").value;
  if (!text) return alert("投稿するテキストがありません。");
  text = text.replace(/\n/g, " ");
  if (text.length > 280) text = text.slice(0, 277) + "...";
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

function stopSpeech() {
  speechSynthesis.cancel();
}
