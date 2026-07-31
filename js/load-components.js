// 負責載入共用 HTML 元件（header / footer），避免同樣的區塊在多處重複撰寫
async function loadComponent(url, targetSelector) {
  var target = document.querySelector(targetSelector);
  if (!target) return;
  try {
    var res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    target.innerHTML = await res.text();
  } catch (err) {
    target.innerHTML =
      '<p class="load-error">元件載入失敗：請透過本機伺服器開啟本頁面（詳見 README.md）。</p>';
    console.error("元件載入失敗：" + url, err);
  }
}
