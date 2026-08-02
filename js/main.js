// 首頁進入點：整合共用元件載入、資料載入、畫面渲染
(async function init() {
  try {
    await Promise.all([
      loadComponent("components/header.html", "#site-header"),
      loadComponent("components/footer.html", "#site-footer")
    ]);

    var nav = await loadJSON("config/nav.json");
    var site = await loadJSON("config/site.json");
    var profile = await loadJSON("config/profile.json");
    var contact = await loadJSON("config/contact.json");
    var skills = await loadJSON("config/skills.json");
    var projects = await loadJSON("config/projects.json");
    var milestones = await loadJSON("config/milestones.json");
    var certificates = await loadJSON("config/certificates.json");
    var aboutMd = await loadText(profile.aboutSource);

    renderNav(nav);
    wireBrandHome();
    renderHero(profile);
    renderSkills(skills);
    renderAbout(aboutMd);
    renderMilestones(milestones);
    renderMilestonesMap(milestones);
    renderProjects(projects);
    renderCertificates(certificates);
    renderContact(contact);
    renderFooter(site, profile);
    setupPhoto(profile);
  } catch (err) {
    console.error("網站初始化失敗", err);
  }
})();

function renderHero(profile) {
  document.getElementById("hero-role").textContent = profile.school;
  document.getElementById("hero-name").textContent = profile.displayName;
  document.getElementById("hero-tagline").textContent = profile.tagline;
}

function renderSkills(skills) {
  var grid = document.getElementById("skills-grid");
  if (!grid) return;
  grid.innerHTML = skills
    .map(function (s) {
      return (
        '<div class="skill-group corner-marks">' +
        '<p class="skill-category">' + s.category + "</p>" +
        '<p class="skill-items">' + s.items + "</p>" +
        "</div>"
      );
    })
    .join("");
}

function renderAbout(markdown) {
  var container = document.getElementById("about-content");
  container.innerHTML = renderMarkdownLite(markdown);
}

function renderMilestones(milestones) {
  var list = document.getElementById("milestones-list");
  list.innerHTML = milestones
    .map(function (m, index) {
      var isCurrent = index === milestones.length - 1;
      var currentClass = isCurrent ? " is-current" : "";
      var currentTag = isCurrent ? '<span class="milestone-current-tag">現在</span>' : "";
      return (
        '<li class="milestone-item' + currentClass + '">' +
        '<span class="milestone-marker" aria-hidden="true"></span>' +
        '<div class="milestone-content">' +
        '<div class="milestone-meta">' +
        '<span class="milestone-year">' + m.year + "</span>" +
        currentTag +
        "</div>" +
        '<p class="milestone-label">' + m.label + "</p>" +
        "</div>" +
        "</li>"
      );
    })
    .join("");
}

function renderMilestonesMap(milestones) {
  var map = document.getElementById("milestones-map");
  if (!map) return;

  var count = milestones.length;
  var width = 300;
  var nodeSpacing = 80;
  var padding = 40;
  var height = (count - 1) * nodeSpacing + padding * 2;
  var centerX = width / 2;

  // 計算每個節點位置（左右擺動產生彎曲路徑感）
  var nodes = milestones.map(function (m, i) {
    var y = padding + i * nodeSpacing;
    var offset = (i % 2 === 0 ? -1 : 1) * 25;
    return { x: centerX + offset, y: y, year: m.year, label: m.label, isCurrent: i === count - 1 };
  });

  // 用 cubic bezier 串接平滑路徑
  var pathD = "M " + nodes[0].x + " " + nodes[0].y;
  for (var i = 1; i < nodes.length; i++) {
    var prev = nodes[i - 1];
    var curr = nodes[i];
    var midY = (prev.y + curr.y) / 2;
    pathD += " C " + prev.x + " " + midY + ", " + curr.x + " " + midY + ", " + curr.x + " " + curr.y;
  }

  // 截斷過長的標籤
  function truncate(s, n) {
    return s.length > n ? s.substring(0, n) + "…" : s;
  }

  // 組裝 SVG
  var svg =
    '<svg class="milestones-map-svg" viewBox="0 0 ' + width + " " + height + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="學習歷程路徑圖">' +
    '<path class="milestones-map-path" d="' + pathD + '" />';

  nodes.forEach(function (n) {
    var nodeClass = n.isCurrent ? "milestones-map-node is-current" : "milestones-map-node";
    svg +=
      '<text class="milestones-map-node-label" x="' + n.x + '" y="' + (n.y - 14) + '">' + n.year + "</text>" +
      '<circle class="' + nodeClass + '" cx="' + n.x + '" cy="' + n.y + '" r="6" />' +
      '<text class="milestones-map-node-title" x="' + n.x + '" y="' + (n.y + 20) + '">' + truncate(n.label, 8) + "</text>";
  });

  svg += "</svg>";

  map.innerHTML = '<p class="milestones-map-title">JOURNEY MAP</p>' + svg;
}

function buildProjectLink(url, label) {
  if (!url) {
    return '<span class="project-link is-pending">連結尚未提供</span>';
  }
  var isExternal = url.indexOf("http") === 0;
  var attrs = isExternal ? ' target="_blank" rel="noopener"' : "";
  return '<a class="project-link" href="' + url + '"' + attrs + ">" + (label || "前往專案 →") + "</a>";
}

function renderProjects(projects) {
  var list = document.getElementById("projects-list");
  list.innerHTML = projects
    .map(function (p) {
      var links = buildProjectLink(p.link, p.linkLabel) + (p.link2 ? buildProjectLink(p.link2, p.link2Label) : "");
      return (
        '<article class="project-spec corner-marks">' +
        '<div class="project-meta"><span>' + p.category + "</span><span>" + p.status + "</span></div>" +
        '<h3 class="project-title">' + p.title + "</h3>" +
        '<p class="project-tech">' + p.techStack + "</p>" +
        '<p class="project-desc">' + p.description + "</p>" +
        '<div class="project-links">' + links + "</div>" +
        "</article>"
      );
    })
    .join("");
}

function renderCertificates(certificates) {
  var list = document.getElementById("certificates-list");
  if (!list) return;
  list.innerHTML = "";

  certificates.forEach(function (cert) {
    var item = document.createElement("article");
    item.className = "cert-item corner-marks corner-marks--accent";

    var thumb = document.createElement("div");
    thumb.className = "cert-thumb";

    var img = document.createElement("img");
    img.alt = cert.name;
    img.addEventListener("error", function () {
      img.style.display = "none";
      thumb.classList.add("is-empty");
      var note = document.createElement("p");
      note.className = "cert-thumb-placeholder";
      note.textContent = "尚未上傳證書圖片";
      thumb.appendChild(note);
    });
    img.src = cert.image;
    thumb.appendChild(img);

    var name = document.createElement("h3");
    name.className = "cert-name";
    name.textContent = cert.name;

    var meta = document.createElement("p");
    meta.className = "cert-meta";
    meta.textContent = cert.issuer + "｜" + cert.date;

    item.appendChild(thumb);
    item.appendChild(name);
    item.appendChild(meta);
    list.appendChild(item);
  });
}

function renderContact(contact) {
  var list = document.getElementById("contact-list");
  var entries = [
    { key: "EMAIL", value: contact.email },
    { key: "PHONE", value: contact.phone },
    { key: "GITHUB", value: contact.github },
    { key: "LINKEDIN", value: contact.linkedin }
  ];
  list.innerHTML = entries
    .filter(function (e) {
      return !!e.value;
    })
    .map(function (e) {
      return (
        '<li class="contact-item">' +
        '<span class="contact-key">' + e.key + "</span>" +
        '<span class="contact-value">' + e.value + "</span>" +
        "</li>"
      );
    })
    .join("");
}

function setupPhoto(profile) {
  var img = document.getElementById("profile-photo");
  var frame = document.getElementById("photo-frame");
  img.alt = profile.photoAlt || "個人照片";
  img.addEventListener("error", function () {
    img.style.display = "none";
    frame.classList.add("is-empty");
    var note = document.createElement("p");
    note.className = "photo-placeholder-text";
    note.textContent = "請將照片放入 assets/images/ 資料夾\n並更新 config/profile.json 的 photoPath";
    frame.appendChild(note);
  });
  img.src = profile.photoPath;
}
