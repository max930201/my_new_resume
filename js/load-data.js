// 負責載入 JSON 設定檔與 Markdown 內文
async function loadJSON(path) {
  var res = await fetch(path);
  if (!res.ok) throw new Error("HTTP " + res.status + " - " + path);
  return res.json();
}

async function loadText(path) {
  var res = await fetch(path);
  if (!res.ok) throw new Error("HTTP " + res.status + " - " + path);
  return res.text();
}
