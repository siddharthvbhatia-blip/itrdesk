const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

const form = document.getElementById('itrForm');
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const details = data.getAll('details');
    const message = [
      'Hello ITR Desk, I want to start an ITR enquiry.',
      '',
      `Name: ${data.get('name') || ''}`,
      `Mobile: ${data.get('phone') || ''}`,
      `Email: ${data.get('email') || ''}`,
      `City: ${data.get('city') || ''}`,
      `Main case: ${data.get('caseType') || ''}`,
      `Income details: ${details.length ? details.join(', ') : 'Not selected'}`,
      `Short note: ${data.get('note') || ''}`,
      '',
      'I understand that fees and filing confirmation will be shared after document review.'
    ].join('\n');

    const phone = '917879857126';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
}
