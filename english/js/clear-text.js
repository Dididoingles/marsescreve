/* ============================================================
   CLEAR TEXT — trash icon starts the note over
============================================================ */
(function () {
  
    // 1. The actual function that wipes the text (runs after confirmation)
    function wipeText() {
      const title = document.querySelector('.note-title');
      const body  = document.querySelector('.note-body');
  
      [title, body].forEach(el => {
        if (!el) return;
        const placeholder = el.dataset.placeholder || '';
        el.textContent = placeholder;
        el.classList.add('placeholder');
      });
  
      // Put the cursor in the title so the user can start typing right away
      if (title) {
        title.focus();
        const range = document.createRange();
        range.selectNodeContents(title);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
  
      // Close the helper panel and any selection UI
      if (typeof window.closeAssistantPanel === 'function') {
        window.closeAssistantPanel();
      }
      const panel = document.getElementById('selectionPanel');
      if (panel) panel.classList.remove('visible');
  
      if (window.__marsToast) {
        window.__marsToast('Texto limpo. Pode começar de novo!');
      }
    }
  
    // 2. The main function triggered by the trash icon
    window.clearEditorText = function () {
      const overlay = document.getElementById('clearModalOverlay');
      
      // Fallback: If modal isn't found in HTML for some reason, just wipe immediately
      if (!overlay) {
        if (confirm('Tem certeza que deseja apagar todo o texto?')) wipeText();
        return;
      }
  
      // Show the modal
      overlay.classList.add('visible');
  
      // Handle Cancel
      const btnCancel = document.getElementById('clearModalCancel');
      const closeModal = () => {
        overlay.classList.remove('visible');
        // Remove event listeners so they don't stack up
        btnCancel.removeEventListener('click', closeModal);
        btnConfirm.removeEventListener('click', confirmWipe);
        overlay.removeEventListener('click', overlayClick);
      };
  
      // Handle Confirm
      const btnConfirm = document.getElementById('clearModalConfirm');
      const confirmWipe = () => {
        closeModal();
        wipeText();
      };
  
      // Handle clicking outside the modal (the overlay itself)
      const overlayClick = (e) => {
        if (e.target === overlay) closeModal();
      };
  
      // Handle "Enter" key on keyboard
      const handleEnter = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          confirmWipe();
          document.removeEventListener('keydown', handleEnter);
        }
      };
  
      // Attach listeners
      btnCancel.addEventListener('click', closeModal);
      btnConfirm.addEventListener('click', confirmWipe);
      overlay.addEventListener('click', overlayClick);
      document.addEventListener('keydown', handleEnter);
    };
  })();
