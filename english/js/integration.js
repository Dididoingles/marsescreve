/* ============================================================
   AI INTEGRATION — Connect to Google Apps Script (Groq)
============================================================ */
(function () {

    const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwtiE36huDWRBkjF-MACVFQ7gbT_oqQXRUgSjkuB71fxJn3J6zXIs7JMwzA30sjqEe0yA/exec";
  
    function getUserId() {
      let userId = localStorage.getItem('mars_user_id');
      if (!userId) {
        userId = 'user_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('mars_user_id', userId);
      }
      return userId;
    }
  
    window.runAiTranslation = async function () {
      const titleEl = document.querySelector('.note-title');
      const bodyEl  = document.querySelector('.note-body');
  
      const title = titleEl && !titleEl.classList.contains('placeholder') ? titleEl.innerText.trim() : '';
      const body  = bodyEl  && !bodyEl.classList.contains('placeholder')  ? bodyEl.innerText.trim()  : '';
  
      // CHANGED: no more fullText — we send title and body separately.
      if (!title && !body) {
        window.__marsToast && window.__marsToast('Escreva algo antes de traduzir.');
        return;
      }
  
      if (window.openAssistantPanel) window.openAssistantPanel();
      const drawer = document.getElementById('drawerBody');
      const drawerMobile = document.getElementById('drawerBodyMobile');
  
      const loadingHtml = '<div class="grammar-loading"><div class="spinner"></div>O Mars está analisando...</div>';
      if (drawer) drawer.innerHTML = loadingHtml;
      if (drawerMobile) drawerMobile.innerHTML = loadingHtml;
  
      if (window.__marsToast) window.__marsToast('Analisando o texto...');
  
      try {
        const userId = getUserId();
  
        // 1. ASK FOR A SECURITY TOKEN
        const tokenRes = await fetch(`${GAS_WEB_APP_URL}?action=getToken&userId=${encodeURIComponent(userId)}`);
        const tokenData = await tokenRes.json();
  
        if (tokenData.error) throw new Error(tokenData.error);
        const token = tokenData.token;
  
        // 2. SEND TITLE + BODY + TOKEN (separate fields)
        const response = await fetch(GAS_WEB_APP_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            title: title,      // CHANGED: was fullText
            body: body,        // CHANGED: was fullText
            userId: userId,
            token: token
          })
        });
  
        const data = await response.json();
        if (data.error) throw new Error(data.error);
  
        // CHANGED: data.result is now guaranteed to be BODY ONLY.
        // data.title is the untouched title echoed back by the server.
        const bodyResult = data.result || '';
  
        // Parse the AI's HTML string into actual DOM nodes
        const parser = new DOMParser();
        const doc = parser.parseFromString(bodyResult, 'text/html');
        const spans = doc.querySelectorAll('.rescued-word');
  
        const newWords = [];
        spans.forEach(span => {
          const rawText = span.innerText.trim();
          const match = rawText.match(/^([^(]+)/);
          const word = match ? match[1].trim() : rawText;
          if (word && !newWords.includes(word)) {
            newWords.push(word);
          }
        });
  
        renderAiResults(drawer, drawerMobile, newWords, bodyResult, spans.length > 0);
  
      } catch (err) {
        console.error('[AI]', err);
        const errorHtml = `<div class="grammar-empty" style="color:#c20000;background:#fff0f0;border-left-color:#c20000;">Erro: ${err.message}</div>`;
        if (drawer) drawer.innerHTML = errorHtml;
        if (drawerMobile) drawerMobile.innerHTML = errorHtml;
        if (window.__marsToast) window.__marsToast('Erro na tradução.');
      }
    };
  
    function renderAiResults(drawer, drawerMobile, newWords, fullHtmlResult, hasRescuedWords) {
  
      // Helper function to create the HTML and attach the working listeners
      function buildContainer() {
        const container = document.createElement('div');
  
        if (!hasRescuedWords) {
          const empty = document.createElement('div');
          empty.className = 'grammar-empty';
          empty.textContent = 'Nenhuma palavra em português foi encontrada no seu texto.';
          container.appendChild(empty);
        } else {
          newWords.forEach(word => {
            const item = document.createElement('div');
            item.className = 'grammar-item';
  
            const gWord = document.createElement('div');
            gWord.className = 'g-word';
            gWord.textContent = word;
  
            const gMsg = document.createElement('div');
            gMsg.className = 'g-msg';
            gMsg.textContent = 'Palavra em português resgatada para inglês.';
  
            item.appendChild(gWord);
            item.appendChild(gMsg);
  
            const actions = document.createElement('div');
            actions.className = 'g-actions';
  
            const hearBtn = document.createElement('button');
            hearBtn.className = 'g-action';
            hearBtn.innerHTML = '<i class="fas fa-headphones"></i> Ouvir pronúncia';
            hearBtn.addEventListener('click', (e) => {
              e.preventDefault();
              if (window.__marsSpeak) window.__marsSpeak(word);
            });
            actions.appendChild(hearBtn);
  
            const fixBtn = document.createElement('button');
            fixBtn.className = 'g-action';
            fixBtn.innerHTML = '<i class="fas fa-pen"></i> Corrigir no texto';
            fixBtn.addEventListener('click', (e) => {
              e.preventDefault();
  
              const bodyEl = document.querySelector('.note-body');
              if (!bodyEl) return;
  
              bodyEl.classList.remove('placeholder');
              // CHANGED: fullHtmlResult is now body-only — no title duplication.
              bodyEl.innerHTML = fullHtmlResult;
  
              const rescued = bodyEl.querySelectorAll('.rescued-word');
              rescued.forEach(span => {
                span.style.color = '#c20000';
                span.style.fontWeight = 'bold';
              });
  
              if (window.__marsToast) window.__marsToast('Texto corrigido com sucesso!');
              if (window.closeAssistantPanel) window.closeAssistantPanel();
            });
            actions.appendChild(fixBtn);
  
            item.appendChild(actions);
            container.appendChild(item);
          });
        }
        return container;
      }
  
      // Render for Desktop
      if (drawer) {
        drawer.innerHTML = '';
        drawer.appendChild(buildContainer());
      }
  
      // Render for Mobile (Rebuilt from scratch so the buttons work!)
      if (drawerMobile) {
        drawerMobile.innerHTML = '';
        drawerMobile.appendChild(buildContainer());
      }
    }
  
  })();
