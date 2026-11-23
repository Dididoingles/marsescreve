/* ============================================================
   DOWNLOAD REPORT — print-to-PDF fallback (no libraries)
============================================================ */
(function () {

    const PALETTE = ['#7ad0a0','#4bc0c0','#f9d56e','#f9b16e','#ee6b9e','#b481dc'];
  
    function normalizeColor(c) {
      if (!c) return null;
      if (c.startsWith('#')) return c.toLowerCase();
      const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!m) return null;
      const hex = n => parseInt(n, 10).toString(16).padStart(2, '0');
      return ('#' + hex(m[1]) + hex(m[2]) + hex(m[3])).toLowerCase();
    }
  
    function collectNewWords() {
      const fields = document.querySelectorAll('.note-title, .note-body');
      const seen = new Set();
      const words = [];
      fields.forEach(field => {
        if (field.classList.contains('placeholder')) return;
        const walker = document.createTreeWalker(field, NodeFilter.SHOW_TEXT, null);
        let node;
        while ((node = walker.nextNode())) {
          const text = node.nodeValue.trim();
          if (!text) continue;
          let el = node.parentElement, color = null;
          while (el && el !== field) {
            const norm = normalizeColor(getComputedStyle(el).backgroundColor);
            if (norm && PALETTE.includes(norm)) { color = norm; break; }
            el = el.parentElement;
          }
          if (!color) continue;
          const key = text.toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          words.push({ text, color });
        }
      });
      return words;
    }
  
    function collectNote() {
      const t = document.querySelector('.note-title');
      const b = document.querySelector('.note-body');
      return {
        title: t && !t.classList.contains('placeholder') ? t.innerText.trim() : '',
        body:  b && !b.classList.contains('placeholder')  ? b.innerText.trim()  : ''
      };
    }
  
    window.downloadReport = function () {
      const note = collectNote();
      if (!note.title && !note.body) {
        window.__marsToast && window.__marsToast('Escreva algo antes de baixar o relatório.');
        return;
      }
      const newWords = collectNewWords();
  
      // Open a new window for the report
      const win = window.open('', '_blank');
      if (!win) {
        window.__marsToast && window.__marsToast('Permita pop-ups para gerar o relatório.');
        return;
      }
  
      const esc = s => s.replace(/[&<>"']/g, ch => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
      })[ch]);
  
      const wordsHtml = newWords.length
        ? newWords.map(w => `
            <li style="display:flex;align-items:center;gap:8px;font-size:14px;margin-bottom:6px;">
              <span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:${w.color};border:1px solid rgba(0,0,0,.08);"></span>
              ${esc(w.text)}
            </li>`).join('')
        : `<p style="font-style:italic;color:#9b9898;font-size:13px;">Nenhuma palavra nova destacada ainda.</p>`;
  
      // Write the HTML report into the new window
      win.document.write(`<!DOCTYPE html>
  <html><head><meta charset="utf-8"><title>Relatório do ajudante</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;700&family=Shantell+Sans:wght@700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Poppins', sans-serif; color:#352f2d; background:#fff8f8;
           padding: 24mm 18mm; margin:0; position: relative; }
    .logo { position: absolute; top: 20mm; left: 18mm; width: 70px; }
    h1 { font-family:'Shantell Sans', 'Poppins', sans-serif; font-size:26px;
         font-weight:700; text-align:center; margin:0 0 30px; padding-top: 10px; }
    h2 { font-size:22px; font-weight:700; letter-spacing:-1px; margin:0 0 10px; }
    .body { font-size:14px; font-weight:300; line-height:1.6;
            white-space:pre-wrap; margin-bottom:26px; }
    h3 { font-family:'Shantell Sans', 'Poppins', sans-serif; font-size:18px;
         font-weight:700; margin:0 0 12px; padding-top:14px;
         border-top:1px solid #e6dada; }
    ul { list-style:none; padding:0; margin:0; }
    @media print { 
      body { background:#fff; } 
    }
  </style></head><body>
    <!-- Pointing the image directly to the live site's asset -->
    <img class="logo" src="https://dididoingles.github.io/marsescreve/assets/sherlockmars.webp" alt="Sherlock">
    <h1>Relatório do ajudante</h1>
    ${note.title ? `<h2>${esc(note.title)}</h2>` : ''}
    ${note.body  ? `<div class="body">${esc(note.body)}</div>` : ''}
    <h3>Novo vocabulário</h3>
    <ul>${wordsHtml}</ul>
    <script>
      window.onload = function() { 
        // Small delay to let fonts and image render before print dialog pops up
        setTimeout(function() { window.print(); }, 300); 
      };
    <\/script>
  </body></html>`);
      win.document.close();
    };
  })();
