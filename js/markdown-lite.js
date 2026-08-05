// 極簡 Markdown -> HTML 轉換器
// 支援：# ## ### 標題、- 清單、空行分段落、**粗體**、表格、分隔線
function renderMarkdownLite(markdown) {
  var escaped = markdown
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">");

  var lines = escaped.split("\n");
  var htmlParts = [];
  var inList = false;
  var inTable = false;
  var tableRows = [];

  function closeList() {
    if (inList) {
      htmlParts.push("</ul>");
      inList = false;
    }
  }

  function closeTable() {
    if (inTable) {
      var tableHtml = '<table class="md-table">';
      tableRows.forEach(function (row, index) {
        var tag = index === 0 ? "th" : "td";
        tableHtml += "<tr>";
        row.forEach(function (cell) {
          tableHtml += "<" + tag + ">" + inline(cell) + "</" + tag + ">";
        });
        tableHtml += "</tr>";
      });
      tableHtml += "</table>";
      htmlParts.push(tableHtml);
      inTable = false;
      tableRows = [];
    }
  }

  function inline(text) {
    return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }

  function isSeparatorRow(line) {
    return /^\|[\s\-:|]+\|$/.test(line);
  }

  function parseTableRow(line) {
    return line
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map(function (cell) {
        return cell.trim();
      });
  }

  lines.forEach(function (rawLine) {
    var line = rawLine.trim();

    if (line === "") {
      closeList();
      closeTable();
      return;
    }

    // 分隔線
    if (/^---+$/.test(line)) {
      closeList();
      closeTable();
      htmlParts.push("<hr />");
      return;
    }

    // 表格行
    if (/^\|.*\|$/.test(line)) {
      closeList();
      if (isSeparatorRow(line)) {
        return; // 跳過分隔行
      }
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(parseTableRow(line));
      return;
    }

    closeTable();

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
  closeTable();
  return htmlParts.join("\n");
}
