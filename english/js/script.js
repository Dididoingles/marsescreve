
    /* ============================================================
       APP LOGIC
    ============================================================ */
    (function() {
      const panel = document.getElementById('selectionPanel');
      const rightSidebar = document.getElementById('rightSidebar');
      const mobileModalOverlay = document.getElementById('mobileModalOverlay');
      let savedRange = null;

      const editableFields = document.querySelectorAll('.note-title, .note-body');

      editableFields.forEach(field => {
        const placeholder = field.dataset.placeholder;
        if (!field.classList.contains('placeholder')) {
          field.classList.add('placeholder');
          field.textContent = placeholder;
        }

        field.addEventListener('focus', () => {
          if (field.classList.contains('placeholder')) {
            field.textContent = '';
            field.classList.remove('placeholder');
          }
        });

        field.addEventListener('blur', () => {
          if (field.textContent.trim() === '') {
            field.classList.add('placeholder');
            field.textContent = placeholder;
          }
        });

        field.addEventListener('input', () => {
          if (field.textContent.trim() !== '' && field.classList.contains('placeholder')) {
            field.classList.remove('placeholder');
          }
        });

        field.addEventListener('paste', function(e) {
          e.preventDefault();
          const text = (e.clipboardData || window.clipboardData).getData('text/plain');
          document.execCommand('insertText', false, text);
        });
      });

      const WIDTH_DURATION = 300;
      const FADE_DURATION  = 200;
      let openTimer = null;
      let closeTimer = null;

      window.openAssistantPanel = function() {
        if (window.innerWidth <= 1024) {
          mobileModalOverlay.classList.add('visible');
          const modal = document.getElementById('mobileModal');
          modal.style.marginTop = '10vh';
        } else {
          clearTimeout(closeTimer);
          rightSidebar.classList.add('expanded');
          rightSidebar.classList.remove('content-visible');
          clearTimeout(openTimer);
          openTimer = setTimeout(() => {
            rightSidebar.classList.add('content-visible');
          }, WIDTH_DURATION);
        }
        hideFloatingPanel();
      };

      window.closeAssistantPanel = function() {
        if (window.innerWidth <= 1024) {
          mobileModalOverlay.classList.remove('visible');
        } else {
          clearTimeout(openTimer);
          rightSidebar.classList.remove('content-visible');
          clearTimeout(closeTimer);
          closeTimer = setTimeout(() => {
            rightSidebar.classList.remove('expanded');
          }, FADE_DURATION);
        }
      };

      mobileModalOverlay.addEventListener('click', function(e) {
        if (e.target === mobileModalOverlay) closeAssistantPanel();
      });

      function hideFloatingPanel() { panel.classList.remove('visible'); }

      function positionPanelBelowSelection(range) {
        const rect = range.getBoundingClientRect();
        const topPos = rect.bottom + 40;
        let leftPos = rect.left;
        const panelWidth = panel.offsetWidth || 340;
        const viewportWidth = window.innerWidth;
        if (leftPos + panelWidth > viewportWidth - 20) leftPos = viewportWidth - panelWidth - 20;
        if (leftPos < 20) leftPos = 20;
        panel.style.top = topPos + 'px';
        panel.style.left = leftPos + 'px';
        panel.classList.add('visible');
      }

      document.addEventListener('selectionchange', function() {
        const selection = window.getSelection();
        if (!selection.rangeCount || selection.isCollapsed) {
          hideFloatingPanel(); savedRange = null; return;
        }
        const range = selection.getRangeAt(0);
        const commonNode = range.commonAncestorContainer;
        const isInsideEditor = (commonNode.nodeType === Node.ELEMENT_NODE
          ? commonNode.closest('.note-title, .note-body')
          : commonNode.parentElement?.closest('.note-title, .note-body'));
        if (!isInsideEditor) { hideFloatingPanel(); savedRange = null; return; }
        const editorEl = commonNode.nodeType === Node.ELEMENT_NODE
          ? commonNode.closest('.note-title, .note-body')
          : commonNode.parentElement.closest('.note-title, .note-body');
        if (editorEl && editorEl.classList.contains('placeholder')) {
          hideFloatingPanel(); savedRange = null; return;
        }
        savedRange = range.cloneRange();
        if (window.innerWidth > 1024) positionPanelBelowSelection(range);
      });

      panel.addEventListener('mousedown', function(e) { e.preventDefault(); });

      function applyHighlight(color) {
        if (!savedRange) return;
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedRange);
        document.execCommand('hiliteColor', false, color === 'transparent' ? 'transparent' : color);
        selection.removeAllRanges();
        hideFloatingPanel();
        savedRange = null;
      }

      document.querySelectorAll('.color-dot').forEach(dot => {
        dot.addEventListener('click', function(e) {
          e.preventDefault();
          applyHighlight(this.dataset.color);
        });
      });

      document.addEventListener('mousedown', function(e) {
        if (!panel.contains(e.target) && !e.target.closest('.note-title, .note-body') && !e.target.closest('.sidebar')) {
          hideFloatingPanel(); savedRange = null;
        }
      });

      const marsIcon = document.getElementById('marsIcon');
      const sherlockImg = document.getElementById('sherlockImg');
      [marsIcon, sherlockImg].forEach(img => {
        if (!img) return;
        img.addEventListener('load', function() { this.classList.remove('hidden'); });
        img.addEventListener('error', function() { this.classList.add('hidden'); });
        if (img.complete && img.naturalWidth > 0) img.classList.remove('hidden');
      });
    })();

    document.addEventListener('DOMContentLoaded', () => {
      if (window.innerWidth <= 1024) return;

      const track = document.querySelector('.left-icons-track');
      const items = track ? track.querySelectorAll('.icon-btn') : [];
      if (!track || items.length === 0) return;

      const pill = document.createElement('div');
      pill.className = 'gooey-pill';
      track.insertBefore(pill, track.firstChild);

      let activeIndex = -1;
      let animationTimeout = null;
      const PILL_SIZE = 40;

      const updatePillPosition = (index, triggerAnimation = true) => {
        if (index < 0 || index >= items.length) return;
        const itemRect = items[index].getBoundingClientRect();
        const trackRect = track.getBoundingClientRect();
        const centerY = itemRect.top + itemRect.height / 2;
        const top = centerY - trackRect.top - PILL_SIZE / 2;
        pill.style.top = `${top}px`;
        if (!pill.classList.contains('active')) pill.classList.add('active');
        if (triggerAnimation) {
          pill.classList.remove('pill-animate');
          void pill.offsetWidth;
          pill.classList.add('pill-animate');
          if (animationTimeout) clearTimeout(animationTimeout);
          animationTimeout = setTimeout(() => pill.classList.remove('pill-animate'), 350);
        }
      };

      const hidePill = () => {
        pill.classList.remove('active');
        activeIndex = -1;
      };

      items.forEach((item, idx) => {
        item.addEventListener('mouseenter', () => {
          activeIndex = idx;
          updatePillPosition(idx, true);
        });
      });

      const sidebar = document.querySelector('.sidebar-left');
      if (sidebar) sidebar.addEventListener('mouseleave', hidePill);

      window.addEventListener('resize', () => {
        if (window.innerWidth <= 1024) { hidePill(); return; }
        if (activeIndex !== -1 && pill.classList.contains('active')) {
          setTimeout(() => updatePillPosition(activeIndex, false), 100);
        }
      });
    });

    /* ============================================================
       TEXT-TO-SPEECH
    ============================================================ */
    (function () {
      const synth = window.speechSynthesis;

      const desktopOverlay = document.getElementById('ttsDesktopOverlay');
      const mobileOverlay  = document.getElementById('ttsMobileOverlay');
      const toast          = document.getElementById('ttsToast');

      let utterance = null;
      let voices = [];
      let rate = 1.0;
      let paused = false;
      let speaking = false;
      let active = null;

      function loadVoices() { voices = synth.getVoices() || []; }
      loadVoices();
      if (synth) {
        synth.addEventListener('voiceschanged', loadVoices);
        setTimeout(loadVoices, 250);
        setTimeout(loadVoices, 1000);
      }

      function langPrefix(text) {
        const t = text.toLowerCase();
        const pt = (t.match(/\b(o|a|os|as|um|uma|de|do|da|que|e|é|para|com|não|em|isso|me|eu|você|está)\b/g) || []).length;
        const en = (t.match(/\b(the|a|an|is|are|was|were|to|of|and|in|for|with|not|this|that|i|you|it|my)\b/g) || []).length;
        return pt > en ? 'pt' : 'en';
      }

      function pickVoice(text) {
        if (!voices.length) loadVoices();
        if (!voices.length) return null;
        const lp = langPrefix(text);
        let best = null, bestScore = -1;
        for (const v of voices) {
          if (!v.lang || !v.lang.toLowerCase().startsWith(lp)) continue;
          const name = (v.name || '').toLowerCase();
          let s = 1;
          if (name.includes('neural'))    s += 50;
          if (name.includes('natural'))   s += 40;
          if (name.includes('premium'))   s += 30;
          if (name.includes('enhanced'))  s += 25;
          if (name.includes('google'))    s += 20;
          if (name.includes('microsoft')) s += 15;
          if (name.includes('siri'))      s += 15;
          if (v.localService)             s += 5;
          if (s > bestScore) { bestScore = s; best = v; }
        }
        return best || voices.find(v => v.default) || voices[0] || null;
      }

      function editorText() {
        const t = document.querySelector('.note-title');
        const b = document.querySelector('.note-body');
        const title = t && !t.classList.contains('placeholder') ? t.innerText.trim() : '';
        const body  = b && !b.classList.contains('placeholder') ? b.innerText.trim() : '';
        return [title, body].filter(Boolean).join('. ');
      }

      let toastTimer = null;
      window.__marsToast = function (message) {
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
      };

      function q(role) {
        return active ? active.querySelector('[data-tts-' + role + ']') : null;
      }

      function refreshPlayIcon() {
        const btn = q('play');
        if (!btn) return;
        const icon = btn.querySelector('i');
        if (paused)        icon.className = 'fas fa-play';
        else if (speaking) icon.className = 'fas fa-pause';
        else               icon.className = 'fas fa-play';
      }

      function setWaveActive(on) {
        const w = q('wave');
        if (w) w.classList.toggle('speaking', on);
      }

      function refreshSpeedUI() {
        const label  = q('speed');
        const slider = q('range');
        if (label)  label.textContent = rate.toFixed(1) + 'x';
        if (slider) slider.value = rate;
        if (utterance) utterance.rate = rate;
      }

      function speak(text) {
        if (!synth) {
          window.__marsToast('Text-to-speech is not available in this browser.');
          return;
        }
        if (!text || !text.trim()) return;

        synth.cancel();

        const u = new SpeechSynthesisUtterance(text);
        const v = pickVoice(text);
        if (v) u.voice = v;
        u.rate = rate;
        u.pitch = 1;
        u.volume = 1;

        u.onstart = () => {
          speaking = true;
          paused = false;
          setWaveActive(true); refreshPlayIcon();
        };
        u.onend = () => {
          speaking = false;
          paused = false;
          setWaveActive(false); refreshPlayIcon();
        };
        u.onerror = (e) => {
          console.warn('[TTS]', e.error);
          speaking = false;
          paused = false;
          setWaveActive(false); refreshPlayIcon();
        };

        utterance = u;
        synth.speak(u);
      }

      window.__marsSpeak = function (text) {
        window.openTTS(text);
      };

      window.openTTS = function (customText) {
        const text = customText || editorText();
        if (!text) {
          window.__marsToast('Você ainda não começou a escrever. Escreva algo para ouvir a pronúncia!');
          return;
        }

        const useMobile = window.innerWidth <= 1024;

        desktopOverlay.classList.remove('open');
        mobileOverlay.classList.remove('open');

        active = useMobile ? mobileOverlay : desktopOverlay;
        active.classList.add('open');

        rate = 1.0;
        refreshSpeedUI();
        speak(text);
      };

      window.closeTTS = function () {
        if (synth) synth.cancel();
        speaking = false;
        paused = false;
        setWaveActive(false);
        refreshPlayIcon();
        if (active) active.classList.remove('open');
        active = null;
      };

      window.toggleTTS = function () {
        if (!synth) return;

        if (!speaking && !paused) {
          const text = editorText();
          if (text) speak(text);
          return;
        }

        if (paused) {
          synth.resume();
          paused = false;
        } else {
          synth.pause();
          paused = true;
        }
        refreshPlayIcon();
      };

      window.changeSpeed = function (delta) {
        rate = Math.min(2.0, Math.max(0.5, +(rate + delta).toFixed(1)));
        refreshSpeedUI();
        if (speaking || paused) {
          synth.cancel();
          speaking = false;
          paused = false;
          setWaveActive(false); refreshPlayIcon();
        }
      };

      [desktopOverlay, mobileOverlay].forEach(overlay => {
        const closer = overlay.querySelector('[data-tts-close]');
        const slower = overlay.querySelector('[data-tts-slower]');
        const faster = overlay.querySelector('[data-tts-faster]');
        const play   = overlay.querySelector('[data-tts-play]');
        const slider = overlay.querySelector('[data-tts-range]');

        if (closer) closer.addEventListener('click', () => window.closeTTS());
        if (slower) slower.addEventListener('click', () => window.changeSpeed(-0.1));
        if (faster) faster.addEventListener('click', () => window.changeSpeed(0.1));
        if (play)   play.addEventListener('click', () => window.toggleTTS());

        if (slider) {
          slider.addEventListener('input', (e) => {
            rate = parseFloat(e.target.value);
            [desktopOverlay, mobileOverlay].forEach(o => {
              const s = o.querySelector('[data-tts-range]');
              const l = o.querySelector('[data-tts-speed]');
              if (s) s.value = rate;
              if (l) l.textContent = rate.toFixed(1) + 'x';
            });
            if (speaking || paused) {
              const text = editorText();
              if (text) speak(text);
            }
          });
        }
      });

      desktopOverlay.addEventListener('click', (e) => {
        if (e.target === desktopOverlay) window.closeTTS();
      });

      window.addEventListener('beforeunload', () => {
        if (synth) synth.cancel();
      });
    })();

    /* ============================================================
       GRAMMAR CHECK / CORRECTION MODULE
       FIXED: correct replacement when checking a selection
    ============================================================ */
    (function () {
      const LT_URL = 'https://api.languagetool.org/v2/check';
      const SOURCE_FIELDS = ['.note-title', '.note-body'];

      /* We store the absolute start offset of the checked selection
         in the field, so that the correction lands in the right place. */
      let selectionStartInField = null;

      function isPlaceholder(el) { return el.classList.contains('placeholder'); }

      /* Count text characters before a Range start within its field. */
      function getTextOffsetInField(field, range) {
        const preRange = document.createRange();
        preRange.selectNodeContents(field);
        try {
          preRange.setEnd(range.startContainer, range.startOffset);
        } catch (e) {
          return 0;
        }
        // We must use the same measure the browser uses for innerText.
        // Simplest: count characters in text nodes strictly before the start.
        let offset = 0;
        const walker = document.createTreeWalker(field, NodeFilter.SHOW_TEXT, null);
        let node;
        while ((node = walker.nextNode())) {
          if (node === range.startContainer) {
            return offset + range.startOffset;
          }
          // Is the start container an ancestor of this text node?
          if (range.startContainer.nodeType === Node.ELEMENT_NODE &&
              range.startContainer.contains(node)) {
            return offset;
          }
          offset += node.nodeValue.length;
        }
        return offset;
      }

      window.getSelectedText = function() {
        const sel = window.getSelection();
        if (!sel.rangeCount || sel.isCollapsed) return '';
        return sel.toString();
      };

      function buildCombinedText() {
        const parts = [];
        let combined = '';
        SOURCE_FIELDS.forEach(sel => {
          const el = document.querySelector(sel);
          if (!el || isPlaceholder(el)) return;
          const txt = el.innerText;
          if (!txt.trim()) return;
          if (combined.length > 0) combined += '\n';
          parts.push({ field: el, offsetInCombined: combined.length, text: txt });
          combined += txt;
        });
        return { combined, parts };
      }

      function locateMatch(parts, match) {
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i];
          if (match.offset >= p.offsetInCombined &&
              match.offset + match.length <= p.offsetInCombined + p.text.length) {
            return {
              field: p.field,
              localOffset: match.offset - p.offsetInCombined,
              length: match.length
            };
          }
        }
        return null;
      }

      function nodeAtOffset(root, targetOffset) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
        let consumed = 0;
        let node;
        while ((node = walker.nextNode())) {
          const len = node.nodeValue.length;
          if (consumed + len >= targetOffset) {
            return { node, offset: targetOffset - consumed };
          }
          consumed += len;
        }
        return { node, offset: node ? node.nodeValue.length : 0 };
      }

      function replaceInField(field, absoluteOffset, length, replacement) {
        field.focus();
        const startPos = nodeAtOffset(field, absoluteOffset);
        const endPos   = nodeAtOffset(field, absoluteOffset + length);
        if (!startPos.node || !endPos.node) return false;

        const range = document.createRange();
        try {
          range.setStart(startPos.node, startPos.offset);
          range.setEnd(endPos.node, endPos.offset);
        } catch (e) { return false; }

        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        try {
          const ok = document.execCommand('insertText', false, replacement);
          if (!ok) {
            range.deleteContents();
            range.insertNode(document.createTextNode(replacement));
          }
        } catch (e) {
          try {
            range.deleteContents();
            range.insertNode(document.createTextNode(replacement));
          } catch (e2) { return false; }
        }

        sel.removeAllRanges();
        field.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }

      async function checkWithLanguageTool(text) {
        const res = await fetch(LT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ text, language: 'en-US' })
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        return data.matches || [];
      }

      function scoreText(text) {
        const clean = text.trim();
        if (!clean) return { score: 0, note: 'Texto vazio.' };
        const words = clean.split(/\s+/).filter(Boolean);
        const unique = new Set(words.map(w => w.toLowerCase().replace(/[^a-zÀ-ÿ]/g, ''))).size;
        const variety = unique / Math.max(1, words.length);
        const sentences = clean.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
        let s = 0;
        if (words.length >= 60) s += 40;
        else if (words.length >= 30) s += 30;
        else if (words.length >= 15) s += 20;
        else if (words.length >= 5)  s += 10;
        if (variety >= 0.6) s += 30;
        else if (variety >= 0.45) s += 20;
        else if (variety >= 0.3) s += 10;
        if (sentences >= 3) s += 20;
        else if (sentences >= 1) s += 10;
        return {
          score: Math.min(100, s),
          note: `${words.length} palavra(s) · ${sentences} frase(s) · variedade ${(variety*100).toFixed(0)}%`
        };
      }

      function setDrawerHtml(html) {
        const bodyD = document.getElementById('drawerBody');
        if (bodyD) bodyD.innerHTML = html;
        const bodyM = document.getElementById('drawerBodyMobile');
        if (bodyM) bodyM.innerHTML = html;
      }

      function getPhraseAround(text, offset, length) {
        const left = text.lastIndexOf('.', offset - 1) + 1;
        const right = text.indexOf('.', offset + length);
        let start = left === 0 ? 0 : left;
        let end = right === -1 ? text.length : right + 1;
        if (offset - start > 60) start = offset - 60;
        if (end - (offset + length) > 60) end = offset + length + 60;
        return text.substring(start, end).trim();
      }

      function renderResultsDOM(matches, parts, heuristic) {
        const container = document.createElement('div');

        const scoreEl = document.createElement('div');
        scoreEl.className = 'grammar-score';
        scoreEl.textContent = `Nota: ${heuristic.score}/100 · ${heuristic.note}`;
        container.appendChild(scoreEl);

        if (matches.length === 0) {
          const empty = document.createElement('div');
          empty.className = 'grammar-empty';
          empty.textContent = 'Gramática impecável! Nenhum erro encontrado.';
          container.appendChild(empty);
          return container;
        }

        let rendered = 0;

        matches.forEach((m) => {
          const loc = locateMatch(parts, m);
          if (!loc) return;
          rendered++;

          const partText = parts.find(p => p.field === loc.field).text;
          const word = partText.slice(loc.localOffset, loc.localOffset + loc.length);
          const phrase = getPhraseAround(partText, loc.localOffset, loc.length);

          const item = document.createElement('div');
          item.className = 'grammar-item';

          const gWord = document.createElement('div');
          gWord.className = 'g-word';
          gWord.textContent = word;

          const gMsg = document.createElement('div');
          gMsg.className = 'g-msg';
          gMsg.textContent = m.message || m.shortMessage || 'Possível erro.';

          item.appendChild(gWord);
          item.appendChild(gMsg);

          const suggestions = (m.replacements || []).slice(0, 3).map(r => r.value);
          if (suggestions.length) {
            const sugg = document.createElement('div');
            sugg.className = 'g-sugg';
            sugg.innerHTML = 'Sugestões: ' + suggestions.map(s => `<strong>${s}</strong>`).join(', ');
            item.appendChild(sugg);
          }

          const actions = document.createElement('div');
          actions.className = 'g-actions';

          const hearBtn = document.createElement('button');
          hearBtn.className = 'g-action';
          hearBtn.innerHTML = '<i class="fas fa-headphones"></i> Ouvir pronúncia';
          hearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.__marsSpeak) window.__marsSpeak(phrase);
          });
          actions.appendChild(hearBtn);

          const fixBtn = document.createElement('button');
          fixBtn.className = 'g-action';
          fixBtn.innerHTML = '<i class="fas fa-pen"></i> Corrigir no texto';
          fixBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const replacement = suggestions[0];
            if (!replacement) {
              window.__marsToast && window.__marsToast('Nenhuma sugestão automática disponível para este erro.');
              return;
            }
            item.classList.add('fixing');

            // Compute absolute offset in the field.
            // If we checked a selection, the match offset is relative to the
            // selection, so we need to add where the selection starts.
            const absoluteOffset = (selectionStartInField !== null)
              ? selectionStartInField + loc.localOffset
              : loc.localOffset;

            const ok = replaceInField(loc.field, absoluteOffset, loc.length, replacement);
            if (!ok) {
              item.classList.remove('fixing');
              window.__marsToast && window.__marsToast('Não foi possível corrigir este trecho.');
              return;
            }

            // Re-run. If we were checking a selection, re-grab the current
            // selection so we continue to work on that same chunk of text.
            if (selectionStartInField !== null) {
              const sel = window.getSelection();
              const selText = sel && !sel.isCollapsed ? sel.toString() : null;
              await window.runGrammarCheck({ keepOpen: true, silentToast: true, textToCheck: selText });
            } else {
              await window.runGrammarCheck({ keepOpen: true, silentToast: true });
            }
          });
          actions.appendChild(fixBtn);

          item.appendChild(actions);
          container.appendChild(item);
        });

        if (rendered === 0) {
          const empty = document.createElement('div');
          empty.className = 'grammar-empty';
          empty.textContent = 'Gramática impecável! Nenhum erro encontrado.';
          container.appendChild(empty);
        }

        return container;
      }

      function setDrawerContent(matches, parts, heuristic) {
        const bodyD = document.getElementById('drawerBody');
        const bodyM = document.getElementById('drawerBodyMobile');
        if (bodyD) {
          bodyD.innerHTML = '';
          bodyD.appendChild(renderResultsDOM(matches, parts, heuristic));
        }
        if (bodyM) {
          bodyM.innerHTML = '';
          bodyM.appendChild(renderResultsDOM(matches, parts, heuristic));
        }
      }

      let inFlight = false;

      window.runGrammarCheck = async function (opts) {
        opts = opts || {};
        if (inFlight) return;
        inFlight = true;

        if (!opts.keepOpen && typeof window.openAssistantPanel === 'function') {
          window.openAssistantPanel();
        }

        setDrawerHtml(`<div class="grammar-loading"><div class="spinner"></div>Verificando…</div>`);

        let combined, parts;

        if (opts.textToCheck) {
          // ---- SELECTION MODE ----
          const sel = window.getSelection();
          if (!sel.rangeCount || sel.isCollapsed) {
            setDrawerHtml('<div class="grammar-empty">Nenhum texto selecionado.</div>');
            selectionStartInField = null;
            inFlight = false;
            return;
          }

          const range = sel.getRangeAt(0);
          const commonNode = range.commonAncestorContainer;
          const field = (commonNode.nodeType === Node.ELEMENT_NODE
            ? commonNode.closest('.note-title, .note-body')
            : commonNode.parentElement?.closest('.note-title, .note-body'));

          if (!field) {
            setDrawerHtml('<div class="grammar-empty">Não foi possível encontrar o campo de texto.</div>');
            selectionStartInField = null;
            inFlight = false;
            return;
          }

          // Save where the selection starts in the field's absolute text.
          selectionStartInField = getTextOffsetInField(field, range);

          combined = opts.textToCheck;
          parts = [{
            field: field,
            offsetInCombined: 0,
            text: opts.textToCheck
          }];
        } else {
          // ---- FULL DOCUMENT MODE ----
          selectionStartInField = null;
          const built = buildCombinedText();
          combined = built.combined;
          parts = built.parts;
        }

        if (!combined.trim()) {
          setDrawerHtml('<div class="grammar-empty">Escreva algo para verificar.</div>');
          inFlight = false;
          return;
        }

        const heuristic = scoreText(combined);
        let matches = [];

        try {
          matches = await checkWithLanguageTool(combined);
        } catch (err) {
          console.warn('[GrammarCheck] LanguageTool failed:', err);
          setDrawerHtml(`
            <div class="grammar-score">Nota heurística: ${heuristic.score}/100 · ${heuristic.note}</div>
            <div class="grammar-empty" style="color:#c20000;background:#fff0f0;border-left-color:#c20000;">
              Não foi possível falar com o LanguageTool agora (${err.message}).
              Verifique sua conexão e tente novamente.
            </div>
          `);
          if (!opts.silentToast) {
            window.__marsToast && window.__marsToast('Falha ao verificar gramática. Tente novamente.');
          }
          inFlight = false;
          return;
        }

        setDrawerContent(matches, parts, heuristic);

        if (!opts.silentToast && matches.length > 0) {
          window.__marsToast && window.__marsToast(`Encontramos ${matches.length} ponto(s) de atenção.`);
        }

        inFlight = false;
      };
    })();
