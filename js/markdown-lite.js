// 極簡 Markdown -> HTML 轉換器
// 支援：# ## ### 標題、- 清單、空行分段落、**粗體**
function renderMarkdownLite(markdown) {
  var escaped = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  var lines = escaped.split("\n");
  var htmlParts = [];
  var inList = false;

  function closeList() {
    if (inList) {
      htmlParts.push("</ul>");
      inList = false;
    }
  }

  function inline(text) {
    return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }

  lines.forEach(function (rawLine) {
    var line = rawLine.trim();

    if (line === "") {
      closeList();
      return;
    }

    var h3 = line.match(/^###\s+(.*)/);
    var h2 = line.match(/^##\s+(.*)/);
    var h1 = line.match(/^#\s+(.*)/);
    var li = line.match(/^-\s+(.*)/);

    if (h3) {
      closeList();
      htmlParts.push("<h3>" + inline(h3[1]) + "</h3>");
      return;
    }
    if (h2) {
      closeList();
      htmlParts.push("<h2>" + inline(h2[1]) + "</h2>");
      return;
    }
    if (h1) {
      closeList();
      htmlParts.push("<h1>" + inline(h1[1]) + "</h1>");
      return;
    }
    if (li) {
      if (!inList) {
        htmlParts.push("<ul>");
        inList = true;
      }
      htmlParts.push("<li>" + inline(li[1]) + "</li>");
      return;
    }

    closeList();
    htmlParts.push("<p>" + inline(line) + "</p>");
  });

  closeList();
  return htmlParts.join("\n");
}
