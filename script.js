const corpora = {
  pta: `
皆さん、おはようございます。本日はご多忙の中、集まっていただきありがとうございます。
私たちPTAは、子どもたちの健やかな成長を支えるために、日々活動しております。
先日、地域の清掃活動に参加し、多くの児童が積極的に取り組んでいる姿に感動しました。
やはり、家庭と地域、学校が連携していくことが大切だと改めて感じました。
また、スマートフォンやインターネットの利用についても、保護者の皆様と一緒に考えていく必要があります。
命の大切さを伝える機会を、これからも設けていけたらと思います。
今後とも、皆さまの温かいご支援とご協力を賜りますよう、お願い申し上げます。
  `,
  principal: `
皆さん、おはようございます。本日は新学期の始まりにあたり、お話をさせていただきます。
学校は知識を学ぶ場であると同時に、心を育てる場所でもあります。
生徒一人一人が安心して過ごせる環境づくりを、教職員一同心がけてまいります。
保護者の皆様とも密に連携を取り、子どもたちの成長を共に見守っていきたいと思います。
挑戦する心を忘れず、共に歩んでいきましょう。
皆さんのご理解とご協力をお願い申し上げます。
  `
};

let markov = {};
let autoReadTimer = null;

// マルコフ連鎖作成
function buildMarkovChain(text, n = 2) {
  const words = text.replace(/。/g, "。 ").split(/\s+/);
  let chain = {};
  for (let i = 0; i < words.length - n; i++) {
    const key = words.slice(i, i + n).join(" ");
    const next = words[i + n];
    if (!chain[key]) chain[key] = [];
    chain[key].push(next);
  }
  return chain;
}

// マルコフで文章生成
function generateSentence(chain, length = 50, n = 2) {
  const keys = Object.keys(chain);
  let key = keys[Math.floor(Math.random() * keys.length)];
  let result = key.split(" ");
  for (let i = 0; i < length; i++) {
    const nextWords = chain[key];
    if (!nextWords) break;
    const next = nextWords[Math.floor(Math.random() * nextWords.length)];
    result.push(next);
    key = result.slice(result.length - n, result.length).join(" ");
  }
  return result.join("").replace(/\s/g, "");
}

// テキスト読み上げ
function speakText(text) {
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ja-JP";
  speechSynthesis.speak(utter);
}

function generateSpeech() {
  const theme = document.getElementById("themeSelect").value;
  markov = buildMarkovChain(corpora[theme]);
  const speech = generateSentence(markov, 100);
  document.getElementById("speechArea").textContent = speech;
  document.getElementById("editArea").value = speech;
  speakText(speech);
}

function copyText() {
  const text = document.getElementById("editArea").value;
  if (!text) {
    alert("コピーするテキストがありません。");
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    alert("テキストをコピーしました！");
  });
}

function printText() {
  const content = document.getElementById("editArea").value;
  if (!content) {
    alert("印刷するテキストがありません。");
    return;
  }
  const w = window.open();
  w.document.write('<pre style="font-size:16px; font-family: monospace; white-space: pre-wrap;">' + content + '</pre>');
  w.document.close();
  w.focus();
  w.print();
  w.close();
}

function saveImage() {
  const target = document.getElementById("speechArea");
  if (!target.textContent.trim()) {
    alert("画像化するテキストがありません。");
    return;
  }
  html2canvas(target).then(canvas => {
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "speech.png";
    a.click();
  });
}

function toggleAutoRead() {
  if (autoReadTimer) {
    clearInterval(autoReadTimer);
    autoReadTimer = null;
    alert("連続読み上げを停止しました。");
  } else {
    generateSpeech(); // すぐに一度生成＆読み上げ
    autoReadTimer = setInterval(() => {
      generateSpeech();
    }, 15000); // 15秒ごとに生成＆読み上げ
    alert("連続読み上げを開始しました。");
  }
}

function tweetEdited() {
  let text = document.getElementById("editArea").value;
  if (!text) {
    alert("投稿するテキストがありません。");
    return;
  }
  text = text.replace(/\n/g, " ");
  if (text.length > 280) text = text.slice(0, 277) + "...";
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

function stopSpeech() {
  speechSynthesis.cancel();
}
