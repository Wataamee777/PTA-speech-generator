const sampleCorpus = `
皆さん、おはようございます。本日はご多忙の中、集まっていただきありがとうございます。
私たちPTAは、子どもたちの健やかな成長を支えるために、日々活動しております。
先日、地域の清掃活動に参加し、多くの児童が積極的に取り組んでいる姿に感動しました。
やはり、家庭と地域、学校が連携していくことが大切だと改めて感じました。
また、スマートフォンやインターネットの利用についても、保護者の皆様と一緒に考えていく必要があります。
命の大切さを伝える機会を、これからも設けていけたらと思います。
今後とも、皆さまの温かいご支援とご協力を賜りますよう、お願い申し上げます。
`;

let markov = {};

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

markov = buildMarkovChain(sampleCorpus);

function generateSpeech() {
  document.getElementById("speechArea").textContent = generateSentence(markov, 100);
}

function appendSpeech() {
  document.getElementById("speechArea").textContent += "\n\n" + generateSentence(markov, 100);
}
