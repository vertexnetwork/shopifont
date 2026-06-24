/**
 * Tiny local server that renders the generated Gumroad copy
 * (kits/dist/marketing/GUMROAD-LISTING.md and -CONTENT-PAGE.md) as
 * styled HTML with a one-click "Copy formatted" button — so you can
 * paste into Gumroad's rich-text Description / Content fields and keep
 * the headings, bold, lists, and code formatting.
 *
 * No dependencies, no build. Run:
 *   node scripts/serve-gumroad-copy.mjs      (or: npm run serve:gumroad)
 * then open the printed URLs. Files are re-read on every request, so a
 * re-run of build:kit-marketing shows up on refresh.
 *
 * This serves ONLY from the gitignored kits/dist/marketing/ staging
 * dir; it touches nothing on the live site.
 */

import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MARKETING = resolve(__dirname, "..", "kits", "dist", "marketing");
const START_PORT = 4317;

const FILES = {
  listing: {
    file: "GUMROAD-LISTING.md",
    label: "Listing (Description field)",
  },
  content: {
    file: "GUMROAD-CONTENT-PAGE.md",
    label: "Content page (post-purchase)",
  },
};

// --- minimal markdown -> HTML (covers exactly what the generator emits) ---

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Inline spans on already-escaped text: code, bold, italic. */
function inline(s) {
  return s
    .replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function mdToHtml(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");

  // Group into blank-line-separated blocks.
  const blocks = [];
  let cur = [];
  for (const line of lines) {
    if (line.trim() === "") {
      if (cur.length) blocks.push(cur), (cur = []);
    } else {
      cur.push(line);
    }
  }
  if (cur.length) blocks.push(cur);

  const out = [];
  for (const block of blocks) {
    const first = block[0];

    // Heading (always its own block in this content).
    const h = block.length === 1 && first.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      out.push(`<h${level}>${inline(escapeHtml(h[2]))}</h${level}>`);
      continue;
    }

    // Horizontal rule.
    if (block.length === 1 && /^---+$/.test(first.trim())) {
      out.push("<hr>");
      continue;
    }

    // Unordered list (with wrapped continuation lines).
    if (first.trimStart().startsWith("- ")) {
      const items = [];
      for (const ln of block) {
        if (ln.trimStart().startsWith("- ")) {
          items.push(ln.trimStart().slice(2).trim());
        } else if (items.length) {
          items[items.length - 1] += " " + ln.trim();
        }
      }
      out.push(
        "<ul>" +
          items.map((it) => `<li>${inline(escapeHtml(it))}</li>`).join("") +
          "</ul>",
      );
      continue;
    }

    // Paragraph. Special-case a line that is ENTIRELY a bold span
    // (the FAQ question pattern): keep it on its own line above the
    // answer instead of running them together.
    if (block.length > 1 && /^\*\*[^*]+\*\*$/.test(first.trim())) {
      const q = first.trim().replace(/^\*\*([^*]+)\*\*$/, "$1");
      const rest = block.slice(1).join(" ");
      out.push(
        `<p><strong>${inline(escapeHtml(q))}</strong><br>${inline(
          escapeHtml(rest),
        )}</p>`,
      );
      continue;
    }

    out.push(`<p>${inline(escapeHtml(block.join(" ")))}</p>`);
  }

  return out.join("\n");
}

// --- page shell ---

function pageHtml(activeKey) {
  const meta = FILES[activeKey];
  let body;
  try {
    body = mdToHtml(readFileSync(resolve(MARKETING, meta.file), "utf8"));
  } catch {
    body = `<p style="color:#b00">Could not read ${meta.file}. Run <code>npm run build:kit-marketing</code> first.</p>`;
  }
  const tab = (key) =>
    `<a href="/${key}" class="${key === activeKey ? "active" : ""}">${FILES[key].label}</a>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gumroad copy — ${meta.label}</title>
<style>
  :root{--ink:#1a1a1a;--muted:#5a5a5a;--electric:#0066ff;--line:#e6e8ee;--dim:#f4f6fb}
  *{box-sizing:border-box}
  body{margin:0;color:var(--ink);background:#fff;line-height:1.62;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}
  .bar{position:sticky;top:0;z-index:5;display:flex;gap:10px;align-items:center;flex-wrap:wrap;
    padding:12px 20px;background:#fff;border-bottom:1px solid var(--line)}
  .bar a{color:var(--muted);text-decoration:none;font-size:14px;padding:6px 10px;border-radius:6px}
  .bar a.active{color:var(--electric);background:var(--dim);font-weight:600}
  .bar button{margin-left:auto;background:var(--electric);color:#fff;border:0;border-radius:6px;
    padding:8px 14px;font-size:14px;font-weight:600;cursor:pointer}
  .bar button.copied{background:#0a7a3f}
  .hint{font-size:12px;color:var(--muted)}
  main{max-width:720px;margin:0 auto;padding:32px 20px 96px}
  h1{font-size:30px;line-height:1.2;margin:.3em 0 .5em}
  h2{font-size:21px;margin:1.6em 0 .4em;padding-top:.7em;border-top:1px solid var(--line)}
  h2:first-of-type{border-top:0;padding-top:0}
  p{margin:.7em 0}
  ul{padding-left:22px;margin:.6em 0} li{margin:.32em 0}
  code{background:var(--dim);border:1px solid var(--line);border-radius:4px;padding:1px 5px;
    font-size:.92em;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
  hr{border:0;border-top:1px solid var(--line);margin:2em 0}
  a{color:var(--electric)}
</style></head>
<body>
  <div class="bar">
    ${tab("listing")}
    ${tab("content")}
    <button id="copy" onclick="copyAll()">Copy formatted ⧉</button>
    <span class="hint">Click Copy, then paste into Gumroad.</span>
  </div>
  <main id="doc">${body}</main>
  <script>
    function copyAll(){
      const node=document.getElementById('doc');
      const range=document.createRange(); range.selectNodeContents(node);
      const sel=window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
      let ok=false; try{ok=document.execCommand('copy');}catch(e){}
      sel.removeAllRanges();
      const b=document.getElementById('copy');
      b.textContent= ok ? 'Copied ✓ — paste into Gumroad' : 'Select all + Ctrl+C';
      if(ok) b.classList.add('copied');
      setTimeout(()=>{b.textContent='Copy formatted ⧉';b.classList.remove('copied');},2200);
    }
  </script>
</body></html>`;
}

function handler(req, res) {
  const url = (req.url || "/").split("?")[0];
  const key = url === "/content" ? "content" : "listing";
  if (url === "/" || url === "/listing" || url === "/content") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(pageHtml(key));
    return;
  }
  res.writeHead(404, { "content-type": "text/plain" });
  res.end("Not found. Open /listing or /content.");
}

function start(port, attemptsLeft) {
  const server = createServer(handler);
  server.on("error", (e) => {
    if (e.code === "EADDRINUSE" && attemptsLeft > 0) {
      start(port + 1, attemptsLeft - 1);
    } else {
      console.error("[serve-gumroad-copy]", e.message);
      process.exit(1);
    }
  });
  server.listen(port, () => {
    console.log("[serve-gumroad-copy] ready:");
    console.log(`  Listing (Description):  http://localhost:${port}/listing`);
    console.log(`  Content (post-purchase): http://localhost:${port}/content`);
  });
}

start(START_PORT, 5);
