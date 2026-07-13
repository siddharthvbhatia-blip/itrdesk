const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('#site-nav');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));
}

const phone = '917879857126';
function waUrl(message){ return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`; }

document.querySelectorAll('[data-wa]').forEach(el => {
  el.addEventListener('click', () => {
    const msg = el.getAttribute('data-wa') || 'Hi, I need ITR filing guidance. Please share checklist.';
    window.open(waUrl(msg), '_blank');
  });
});

const form = document.querySelector('#itrForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const details = data.getAll('details').join(', ') || 'Not specified';
    const sourcePage = `${document.title}\n${window.location.href.split('#')[0]}`;
    const msg = `Hi, I want ITR filing guidance.\n\nName: ${data.get('name') || ''}\nMobile: ${data.get('phone') || ''}\nEmail: ${data.get('email') || ''}\nCity: ${data.get('city') || ''}\nCase: ${data.get('caseType') || ''}\nDetails: ${details}\nNote: ${data.get('note') || ''}\n\nSource page: ${sourcePage}\n\nPlease share the checklist and next steps.`;
    window.open(waUrl(msg), '_blank');
  });
}

const copyBtn = document.querySelector('[data-copy-link]');
if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href.split('#')[0]);
      copyBtn.textContent = 'Link copied';
      setTimeout(()=>copyBtn.textContent='Copy website link',1800);
    } catch(e) { alert('Copy failed. Please copy from address bar.'); }
  });
}

document.querySelectorAll('[data-share]').forEach(button => {
  button.addEventListener('click', async () => {
    const originalText = button.textContent;
    const url = window.location.href.split('#')[0];
    const text = button.getAttribute('data-share-text') || 'A practical income-tax resource from ITR Desk by CA Siddharth Bhatia.';
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      button.textContent = 'Link copied to share';
    } catch (error) {
      if (error && error.name === 'AbortError') return;
      button.textContent = 'Copy the address-bar link';
    }
    setTimeout(() => { button.textContent = originalText; }, 2200);
  });
});

/* Load the site-wide public-content protection layer. */
if (!document.querySelector('script[data-itrdesk-protection]')) {
  const protectionScript = document.createElement('script');
  protectionScript.src = 'assets/protection.js?v=20260714-clean';
  protectionScript.defer = true;
  protectionScript.dataset.itrdeskProtection = 'true';
  document.head.appendChild(protectionScript);
}
