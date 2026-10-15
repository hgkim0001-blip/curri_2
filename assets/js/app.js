(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var pad = function (n) { return n < 10 ? "0" + n : "" + n; };

  var WEEKS = window.WEEKS, PHASES = window.PHASES, CAPS = window.CAPSTONES;
  var STEP_WEEKS = { 1: [2, 8, 12, 15], 2: [2, 3], 3: [3, 4], 4: [4, 12], 5: [3, 4, 9, 13], 6: [1, 8, 10, 11], 7: [5, 6, 7, 8, 9, 13, 14, 15, 16] };
  var filter = { type: "all", value: null };

  /* ---------- toast + copy ---------- */
  var toastEl = $("#toast"), toastT;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add("on");
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove("on"); }, 1600);
  }
  function copy(text) {
    var done = function () { toast("복사했어요"); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();
    function fallback() {
      var ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { toast("복사하지 못했어요. 직접 선택해 주세요."); }
      document.body.removeChild(ta);
    }
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-copy]");
    if (b) { copy(b.getAttribute("data-copy")); }
  });

  /* ---------- hero progress + marquee ---------- */
  $("#progress").innerHTML = WEEKS.map(function (w) {
    return '<a class="sq sq-' + PHASES[w.phase].color + '" href="#week-' + w.n + '" data-open="' + w.n + '" aria-label="' + w.n + '주차 ' + esc(w.title) + '"><span>' + pad(w.n) + '</span></a>';
  }).join("");

  var words = ["수집", "정제", "분석", "스크립트", "팩트체크", "영상화", "RAG", "MCP", "NotebookLM", "Flourish", "Premiere", "After Effects"];
  var mq = words.concat(words).map(function (w) { return "<span>" + esc(w) + "</span><i>✳</i>"; }).join("");
  $("#marquee").innerHTML = mq + mq;

  /* ---------- pipeline ---------- */
  $("#pipe").innerHTML = window.PIPELINE.map(function (p) {
    return '<li><button type="button" class="pipe-card" data-step="' + p.n + '"><span class="pipe-n">' + p.n + '</span><strong>' + esc(p.t) + '</strong><em>' + esc(p.d) + '</em><small>' + esc(p.tools) + '</small><span class="pipe-w">' + esc(p.weeks) + '</span></button></li>';
  }).join("");
  $("#pipe").addEventListener("click", function (e) {
    var b = e.target.closest("[data-step]"); if (!b) return;
    setFilter("step", +b.getAttribute("data-step"));
    $("#weeks").scrollIntoView({ behavior: reduce() ? "auto" : "smooth" });
  });
  function reduce() { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }

  /* ---------- blocks overview ---------- */
  $("#blocks").innerHTML = window.COURSE_BLOCKS.map(function (b) {
    return '<div class="blk"><b>' + esc(b.w) + '</b><span>' + esc(b.t) + '</span>' + (b.h ? '<i>' + esc(b.h) + '</i>' : "") + "</div>";
  }).join("");

  /* ---------- filters + week grid ---------- */
  var fEl = $("#filters");
  var pills = [{ k: "all", label: "전체 16주" }].concat(Object.keys(PHASES).map(function (k) { return { k: k, label: PHASES[k].label + " " + PHASES[k].range }; }));
  fEl.innerHTML = pills.map(function (p) { return '<button type="button" class="pill" data-phase="' + p.k + '" aria-pressed="false">' + esc(p.label) + "</button>"; }).join("");
  fEl.addEventListener("click", function (e) {
    var b = e.target.closest("[data-phase]"); if (!b) return;
    var k = b.getAttribute("data-phase");
    setFilter(k === "all" ? "all" : "phase", k === "all" ? null : k);
  });

  function setFilter(type, value) { filter = { type: type, value: value }; renderGrid(); }

  function match(w) {
    if (filter.type === "phase") return w.phase === filter.value;
    if (filter.type === "step") return STEP_WEEKS[filter.value].indexOf(w.n) > -1;
    return true;
  }

  function renderGrid() {
    var list = WEEKS.filter(match);
    $$("#filters .pill").forEach(function (p) {
      var k = p.getAttribute("data-phase");
      var on = (filter.type === "all" && k === "all") || (filter.type === "phase" && filter.value === k);
      p.classList.toggle("on", on); p.setAttribute("aria-pressed", on);
    });
    $$("#pipe .pipe-card").forEach(function (c) { c.classList.toggle("on", filter.type === "step" && +c.getAttribute("data-step") === filter.value); });
    var label = filter.type === "step" ? " · ‘" + window.PIPELINE[filter.value - 1].t + "’ 단계 (필터 해제: ‘전체’)" : "";
    $("#count").textContent = list.length + "개 주차" + label;
    $("#weekGrid").innerHTML = list.map(function (w) {
      var c = PHASES[w.phase].color;
      return '<article class="card card-' + c + '" id="card-' + w.n + '"><button type="button" class="card-btn" data-open="' + w.n + '" aria-haspopup="dialog">' +
        '<span class="card-n">' + pad(w.n) + '</span>' +
        '<span class="card-phase">' + esc(PHASES[w.phase].label) + '</span>' +
        '<h3>' + esc(w.title) + '</h3>' +
        '<p>' + esc(w.summary) + '</p>' +
        '<span class="tags">' + w.tags.slice(0, 4).map(function (t) { return "<i>" + esc(t) + "</i>"; }).join("") + '</span>' +
        '<span class="card-go">자세히 ↗</span></button></article>';
    }).join("");
  }

  /* ---------- dialog ---------- */
  var dlg = $("#weekDialog"), body = $("#dlgBody"), current = null, lastFocus = null;
  function list(items, cls) { return '<ul class="' + (cls || "") + '">' + items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>"; }
  function docList(list) {
    return list.map(function (d) {
      return '<li class="doc"><span class="doc-k">' + esc(d.kind) + '</span><a class="doc-n" href="' + esc(d.view) + '" target="_blank" rel="noopener">' + esc(d.name) + '</a>' +
        '<a class="doc-dl" href="' + esc(d.orig) + '" download="' + esc(d.dl) + '" title="원본 내려받기">원본 ↓</a></li>';
    }).join("");
  }
  function openWeek(n, push) {
    var w = WEEKS[n - 1]; if (!w) return;
    current = n; if (!dlg.open) lastFocus = document.activeElement;
    var c = PHASES[w.phase].color;
    var docs = docList(window.WEEK_DOCS && window.WEEK_DOCS[n] || []);
    body.innerHTML =
      '<div class="dlg-head dlg-' + c + '"><button type="button" class="dlg-x" data-close aria-label="닫기">✕</button>' +
      '<span class="dlg-n">' + pad(w.n) + '</span><div><p class="dlg-phase">' + esc(PHASES[w.phase].label) + " · " + esc(PHASES[w.phase].range) + '</p>' +
      '<h3 id="dlgTitle">' + esc(w.title) + '</h3></div></div>' +
      '<div class="dlg-body">' +
      '<p class="dlg-sum">' + esc(w.summary) + '</p>' +
      '<p class="dlg-hours">' + esc(w.hours) + '</p>' +
      '<div class="dlg-cols"><section><h4>학습 목표</h4>' + list(w.goals, "goals") + '</section>' +
      '<section><h4>핵심 내용</h4>' + list(w.topics, "topics") + '</section></div>' +
      '<section class="dlg-prac"><h4>실습</h4><p>' + esc(w.practice) + '</p></section>' +
      '<aside class="dlg-note"><b>기억할 것</b> ' + esc(w.note) + '</aside>' +
      '<section><h4>자료 보기 (' + (window.WEEK_DOCS && window.WEEK_DOCS[n] ? window.WEEK_DOCS[n].length : 0) + ')</h4><ul class="docs">' + docs + '</ul></section>' +
      '<p class="dlg-next">NEXT → ' + esc(w.next) + '</p>' +
      '<div class="dlg-nav"><button type="button" class="btn btn-line sm" data-go="' + (n - 1) + '"' + (n === 1 ? " disabled" : "") + '>← ' + (n > 1 ? pad(n - 1) + "주차" : "") + '</button>' +
      '<button type="button" class="btn btn-lime sm" data-go="' + (n + 1) + '"' + (n === 16 ? " disabled" : "") + '>' + (n < 16 ? pad(n + 1) + "주차" : "") + ' →</button></div></div>';
    if (!dlg.open) { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", ""); }
    dlg.scrollTop = 0; body.scrollTop = 0;
    if (push !== false && location.hash !== "#week-" + n) history.replaceState(null, "", "#week-" + n);
  }
  function closeDlg() {
    if (dlg.open) dlg.close();
  }
  dlg.addEventListener("close", function () {
    if (/^#week-/.test(location.hash)) history.replaceState(null, "", location.pathname + location.search + "#weeks");
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  });
  dlg.addEventListener("click", function (e) {
    if (e.target === dlg || e.target.closest("[data-close]")) return closeDlg();
    var g = e.target.closest("[data-go]");
    if (g && !g.disabled) openWeek(+g.getAttribute("data-go"));
  });
  document.addEventListener("click", function (e) {
    var o = e.target.closest("[data-open]");
    if (o) { e.preventDefault(); openWeek(+o.getAttribute("data-open")); }
  });
  function fromHash() {
    var m = /^#week-(\d+)$/.exec(location.hash);
    if (m) openWeek(+m[1], false);
  }
  window.addEventListener("hashchange", fromHash);

  /* ---------- capstone ---------- */
  function renderBlock(b) {
    switch (b.type) {
      case "kv":
        return '<dl class="kv">' + b.items.map(function (i) { return "<div><dt>" + esc(i[0]) + "</dt><dd>" + esc(i[1]) + "</dd></div>"; }).join("") + "</dl>";
      case "steps":
        return '<ol class="steps">' + b.items.map(function (i) { return "<li><b>" + esc(i[0]) + "</b><span>" + esc(i[1]) + "</span></li>"; }).join("") + "</ol>";
      case "check":
        return '<div class="chk">' + (b.title ? "<h5>" + esc(b.title) + "</h5>" : "") + "<ul>" + b.items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul></div>";
      case "table":
        return '<div class="tbl-wrap"><table class="tbl"><thead><tr>' + b.head.map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("") + "</tr></thead><tbody>" +
          b.rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
      case "bars":
        var max = Math.max.apply(null, b.items.map(function (i) { return i[1]; }));
        return '<div class="bars">' + (b.title ? "<h5>" + esc(b.title) + "</h5>" : "") + b.items.map(function (i) {
          var label = b.unit === "s" ? Math.floor(i[1] / 60) + ":" + pad(i[1] % 60) : i[1] + "점";
          return '<div class="bar"><span>' + esc(i[0]) + '</span><div class="bar-t"><div class="bar-f" style="width:' + Math.round(i[1] / max * 100) + '%"></div></div><b>' + label + "</b></div>";
        }).join("") + "</div>";
      case "timeline":
        return '<ol class="tl">' + b.items.map(function (i) { return "<li><b>" + esc(i[0]) + "</b><span>" + esc(i[1]) + "</span></li>"; }).join("") + "</ol>";
      case "chips":
        return '<ul class="chips">' + b.items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>";
      case "callout":
        return '<p class="call call-' + b.tone + '">' + esc(b.text) + "</p>";
    }
    return "";
  }
  var capIdx = 0, capTab = 0;
  function renderStairs() {
    $("#stairs").innerHTML = CAPS.map(function (c, i) {
      return '<button type="button" role="tab" class="stair s' + c.level + '" data-cap="' + i + '" aria-selected="' + (i === capIdx) + '">' +
        '<span class="stair-code">' + c.code + '</span><strong>' + esc(c.name) + '</strong><em>' + esc(c.weeks) + " · " + esc(c.length) + "</em></button>";
    }).join("");
  }
  function renderCap() {
    var c = CAPS[capIdx];
    $("#capPanel").innerHTML =
      '<div class="cap-head"><span class="cap-code">' + c.code + '</span><div><h3>' + esc(c.name) + '</h3><p>' + esc(c.tagline) + '</p></div></div>' +
      '<div class="cap-tabs" role="tablist" aria-label="' + esc(c.name) + ' 항목">' + c.tabs.map(function (t, i) {
        return '<button type="button" role="tab" class="ctab" data-ctab="' + i + '" aria-selected="' + (i === capTab) + '">' + esc(t.label) + "</button>";
      }).join("") + '</div><div class="cap-body" role="tabpanel">' + c.tabs[capTab].blocks.map(renderBlock).join("") + "</div>";
  }
  $("#stairs").addEventListener("click", function (e) {
    var b = e.target.closest("[data-cap]"); if (!b) return;
    capIdx = +b.getAttribute("data-cap"); capTab = 0; renderStairs(); renderCap();
  });
  $("#capPanel").addEventListener("click", function (e) {
    var b = e.target.closest("[data-ctab]"); if (!b) return;
    capTab = +b.getAttribute("data-ctab"); renderCap();
  });
  renderStairs(); renderCap();

  /* ---------- MCP ---------- */
  $("#mcpFlow").innerHTML = window.MCP_FLOW.map(function (f, i) { return '<span class="fl">' + esc(f) + "</span>" + (i < window.MCP_FLOW.length - 1 ? '<i class="fl-a">→</i>' : ""); }).join("");
  $("#mcpCommon").innerHTML = window.MCP_COMMON.map(function (c, i) {
    return "<li><span>" + pad(i + 1) + "</span><div><b>" + esc(c[0]) + "</b><p>" + esc(c[1]) + "</p></div></li>";
  }).join("");

  var toolIdx = 0;
  function codeBlock(label, code) {
    return '<div class="code"><div class="code-bar"><span>' + esc(label) + '</span><button type="button" class="copy" data-copy="' + esc(code) + '">복사</button></div><pre><code>' + esc(code) + "</code></pre></div>";
  }
  function renderTabs() {
    $("#toolTabs").innerHTML = window.MCP_TOOLS.map(function (t, i) {
      return '<button type="button" role="tab" class="ttab t-' + t.color + '" data-tool="' + i + '" aria-selected="' + (i === toolIdx) + '"><b>' + esc(t.short) + "</b><span>" + esc(t.name) + "</span></button>";
    }).join("");
  }
  function renderTool() {
    var t = window.MCP_TOOLS[toolIdx];
    $("#toolPanel").innerHTML =
      '<div class="tp-head"><h3>' + esc(t.name) + '</h3><p>' + esc(t.summary) + "</p></div>" +
      '<dl class="meta">' + t.meta.map(function (m) { return "<div><dt>" + esc(m[0]) + "</dt><dd>" + esc(m[1]) + "</dd></div>"; }).join("") + "</dl>" +
      (window.MCP_DOCS && window.MCP_DOCS[t.id] ? '<ul class="docs mcpdoc">' + docList([window.MCP_DOCS[t.id]]) + '</ul>' : "") +
      '<p class="struct"><b>구조</b> ' + esc(t.structure) + "</p>" +
      '<div class="tp-cols"><section><h4>설치 순서</h4><ol class="isteps">' + t.steps.map(function (s) { return "<li><b>" + esc(s[0]) + "</b><span>" + esc(s[1]) + "</span></li>"; }).join("") + "</ol></section>" +
      "<section><h4>설정 파일 · 명령어</h4>" + codeBlock("claude_desktop_config.json → mcpServers 안에 추가", t.config) +
      t.commands.map(function (c) { return codeBlock(c[0], c[1]); }).join("") + "</section></div>" +
      '<h4>연결 테스트 — Claude에게 이렇게 말해보세요</h4><ul class="tests">' + t.tests.map(function (x) {
        return '<li><span>' + esc(x) + '</span><button type="button" class="copy" data-copy="' + esc(x) + '" aria-label="프롬프트 복사">복사</button></li>';
      }).join("") + "</ul>" +
      '<h4>막혔을 때</h4><div class="tbl-wrap"><table class="tbl dark"><thead><tr><th>증상</th><th>원인 · 해결</th></tr></thead><tbody>' +
      t.trouble.map(function (r) { return "<tr><td>" + esc(r[0]) + "</td><td>" + esc(r[1]) + "</td></tr>"; }).join("") + "</tbody></table></div>" +
      list(t.notes, "tnotes");
  }
  $("#toolTabs").addEventListener("click", function (e) {
    var b = e.target.closest("[data-tool]"); if (!b) return;
    toolIdx = +b.getAttribute("data-tool"); renderTabs(); renderTool();
  });
  renderTabs(); renderTool();

  var wf = window.MCP_WORKFLOW;
  var maxCut = Math.max.apply(null, wf.cuts.map(function (c) { return c[1]; }));
  $("#workflowPanel").innerHTML =
    '<p class="wf-intro">' + esc(wf.intro) + "</p>" + (window.WORKFLOW_DOC ? '<ul class="docs mcpdoc">' + docList([window.WORKFLOW_DOC]) + '</ul>' : "") +
    '<div class="flow wf-flow">' + wf.flow.map(function (f, i) { return '<span class="fl">' + esc(f) + "</span>" + (i < wf.flow.length - 1 ? '<i class="fl-a">→</i>' : ""); }).join("") + "</div>" +
    '<div class="tbl-wrap"><table class="tbl dark roles"><thead><tr><th>단계</th><th>사람이 하는 일</th><th>Claude가 하는 일</th></tr></thead><tbody>' +
    wf.roles.map(function (r) { return "<tr><td><b>" + esc(r[0]) + "</b></td><td>" + esc(r[1]) + "</td><td>" + esc(r[2]) + "</td></tr>"; }).join("") + "</tbody></table></div>" +
    '<div class="tp-cols"><section><h4>장르별 1컷 평균 길이</h4><div class="bars dark">' + wf.cuts.map(function (c) {
      return '<div class="bar"><span>' + esc(c[0]) + '</span><div class="bar-t"><div class="bar-f" style="width:' + Math.round(c[1] / maxCut * 100) + '%"></div></div><b>' + (c[0] === "광고" ? "약 2초" : "3–5초") + "</b></div>";
    }).join("") + "</div><p class=\"small\">" + esc(wf.cutsNote) + "</p></section>" +
    "<section><h4>작업 규칙</h4>" + list(wf.rules, "rules") + "</section></div>" +
    '<p class="call call-coral"><b>사람이 직접 해야 하는 작업</b> ' + wf.manual.map(esc).join(" · ") + "</p>";

  /* ---------- init ---------- */
  renderGrid();
  fromHash();
})();
