// 生日祝福網頁作品集子頁面：進入點
(async function init() {
  try {
    await Promise.all([
      loadComponent("../../components/header.html", "#site-header"),
      loadComponent("../../components/footer.html", "#site-footer")
    ]);

    var nav = await loadJSON("../../config/nav.json");
    var site = await loadJSON("../../config/site.json");
    var profile = await loadJSON("../../config/profile.json");
    var links = await loadJSON("../../config/birthday-links.json");

    renderNav(nav);
    wireBrandHome();
    renderFooter(site, profile);
    renderBirthdayList(links);
  } catch (err) {
    console.error("頁面初始化失敗", err);
  }
})();

function renderBirthdayList(links) {
  var groupsEl = document.getElementById("birthday-groups");
  var countEl = document.getElementById("birthday-count");
  if (countEl) countEl.textContent = String(links.length);

  var order = ["家人", "朋友", "治療師"];
  var byGroup = {};
  links.forEach(function (item) {
    var g = item.group || "其他";
    if (!byGroup[g]) byGroup[g] = [];
    byGroup[g].push(item);
  });

  var html = "";
  order.forEach(function (groupName) {
    var items = byGroup[groupName];
    if (!items || !items.length) return;
    html += '<div class="birthday-group">';
    html += '<h2 class="birthday-group-title">' + groupName + "</h2>";
    html += '<ul class="birthday-item-list">';
    items.forEach(function (item) {
      html +=
        '<li class="birthday-item">' +
        '<a class="birthday-item-name" href="' + item.url + '" target="_blank" rel="noopener">' + item.name + "</a>";
      if (item.note) {
        html += '<span class="birthday-item-note">' + item.note + "</span>";
      }
      html += "</li>";
    });
    html += "</ul></div>";
  });
  groupsEl.innerHTML = html;
}
