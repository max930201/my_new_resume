// 首頁與子頁面共用的渲染邏輯：導覽列、頁尾、返回首頁的連結
function getHomeAnchor(target) {
  var onSubpage = window.location.pathname.indexOf("/works/") !== -1;
  var prefix = onSubpage ? "/index.html" : "";
  return prefix + "#" + target;
}

function wireBrandHome() {
  var brand = document.querySelector(".brand");
  if (brand) brand.setAttribute("href", getHomeAnchor("hero"));
}

function renderNav(nav) {
  var list = document.getElementById("nav-list");
  if (!list) return;
  list.innerHTML = nav
    .map(function (item) {
      return '<li><a href="' + getHomeAnchor(item.target) + '">' + item.label + "</a></li>";
    })
    .join("");
}

function renderFooter(site, profile) {
  var versionEl = document.getElementById("footer-version");
  var yearEl = document.getElementById("footer-year");
  var nameEl = document.getElementById("footer-name");
  var brandNameEl = document.getElementById("brand-name");
  if (versionEl) versionEl.textContent = "v" + site.version;
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  if (nameEl) nameEl.textContent = profile.displayName;
  if (brandNameEl) brandNameEl.textContent = profile.displayName;
}
