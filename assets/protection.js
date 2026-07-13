(() => {
  'use strict';

  const editableSelector = 'input, textarea, select, [contenteditable="true"]';
  const isEditable = target => target instanceof Element && Boolean(target.closest(editableSelector));

  const style = document.createElement('style');
  style.dataset.itrdeskProtection = 'true';
  style.textContent = `
    body{-webkit-user-select:none;user-select:none}
    input,textarea,select,[contenteditable="true"]{-webkit-user-select:text;user-select:text}
    .capture-shield{position:fixed;inset:0;z-index:2147483646;display:grid;place-items:center;padding:24px;background:#0d1d19;color:#fff;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .08s linear,visibility 0s linear .08s;text-align:center}
    .capture-shield.active{opacity:1;visibility:visible;pointer-events:auto;transition-delay:0s}
    .capture-shield div{max-width:520px;padding:32px;border:1px solid rgba(255,255,255,.18);border-radius:24px;background:rgba(255,255,255,.06)}
    .capture-shield strong,.capture-shield span{display:block}.capture-shield strong{font-size:2rem}.capture-shield span{margin-top:8px;color:#c9ddd7}
    .capture-concealed{overflow:hidden}
    .capture-notice{position:fixed;left:50%;bottom:24px;z-index:2147483647;max-width:min(560px,calc(100% - 28px));padding:11px 16px;border-radius:999px;background:#10231f;color:#fff;box-shadow:0 12px 36px rgba(0,0,0,.28);font:800 .88rem/1.4 Inter,Arial,sans-serif;text-align:center;opacity:0;visibility:hidden;transform:translate(-50%,12px);transition:.18s ease;pointer-events:none}
    .capture-notice.visible{opacity:1;visibility:visible;transform:translate(-50%,0)}
    @media(max-width:640px){.capture-notice{bottom:82px;border-radius:16px}}
    @media print{body>*{display:none!important}body::before{content:"Printing is disabled. © ITR Desk by CA Siddharth Bhatia.";display:block!important;padding:48px;font:700 18px/1.5 Arial,sans-serif;color:#111}}
  `;
  document.head.appendChild(style);

  const shield = document.createElement('div');
  shield.className = 'capture-shield';
  shield.setAttribute('aria-hidden', 'true');
  shield.innerHTML = '<div><strong>ITR Desk</strong><span>Protected content is hidden while this page is inactive.</span></div>';

  const notice = document.createElement('div');
  notice.className = 'capture-notice';
  notice.setAttribute('role', 'status');
  notice.setAttribute('aria-live', 'polite');

  document.body.append(shield, notice);

  let noticeTimer;
  let revealTimer;
  const notify = message => {
    notice.textContent = message;
    notice.classList.add('visible');
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => notice.classList.remove('visible'), 2200);
  };
  const conceal = () => {
    clearTimeout(revealTimer);
    shield.classList.add('active');
    document.documentElement.classList.add('capture-concealed');
  };
  const reveal = () => {
    clearTimeout(revealTimer);
    revealTimer = setTimeout(() => {
      if (!document.hidden && document.hasFocus()) {
        shield.classList.remove('active');
        document.documentElement.classList.remove('capture-concealed');
      }
    }, 180);
  };

  document.addEventListener('contextmenu', event => {
    if (!isEditable(event.target)) {
      event.preventDefault();
      notify('Right-click copying is disabled on this page.');
    }
  });
  document.addEventListener('selectstart', event => {
    if (!isEditable(event.target)) event.preventDefault();
  });
  ['copy', 'cut'].forEach(type => {
    document.addEventListener(type, event => {
      if (!isEditable(event.target)) {
        event.preventDefault();
        notify('Copying protected page content is disabled.');
      }
    });
  });
  document.addEventListener('dragstart', event => {
    if (!isEditable(event.target)) event.preventDefault();
  });

  document.addEventListener('keydown', event => {
    const key = String(event.key || '').toLowerCase();
    const command = event.ctrlKey || event.metaKey;
    const developerShortcut = event.key === 'F12' || (command && event.shiftKey && ['i', 'j', 'c'].includes(key));
    const blockedCommand = command && ['p', 's', 'u'].includes(key);

    if (event.key === 'PrintScreen') {
      conceal();
      notify('Screenshot capture is discouraged on this protected page.');
      setTimeout(reveal, 1800);
      return;
    }
    if (developerShortcut || blockedCommand) {
      event.preventDefault();
      event.stopPropagation();
      notify(key === 'p' ? 'Printing this webpage is disabled.' : 'This browser shortcut is disabled on protected pages.');
    }
  }, true);
  document.addEventListener('keyup', event => {
    if (event.key === 'PrintScreen') {
      conceal();
      setTimeout(reveal, 1800);
    }
  }, true);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) conceal();
    else reveal();
  });
  window.addEventListener('blur', conceal);
  window.addEventListener('focus', reveal);
  window.addEventListener('beforeprint', conceal);
  window.addEventListener('afterprint', reveal);
})();
