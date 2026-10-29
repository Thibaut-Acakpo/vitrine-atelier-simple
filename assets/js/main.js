// =========================================================
// ATELIER MAINTENANCE — comportements (version simple)
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  initFaqAccordion();
  initContactForm();
  initRevealOnScroll();
  initCounters();
});

// --- Accordeon FAQ ---
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach((item) => {
    const button = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!button || !answer) return;

    button.addEventListener('click', () => {
      const isOpen = button.getAttribute('aria-expanded') === 'true';
      items.forEach((other) => {
        const otherButton = other.querySelector('.faq-question');
        const otherAnswer = other.querySelector('.faq-answer');
        if (otherButton && otherAnswer) {
          otherButton.setAttribute('aria-expanded', 'false');
          otherAnswer.style.maxHeight = null;
        }
      });
      if (!isOpen) {
        button.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

// --- Formulaire de contact : validation cote client ---
function initContactForm() {
  const form = document.querySelector('#contact-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    let hasError = false;
    form.querySelectorAll('[data-required]').forEach((field) => {
      const wrapper = field.closest('.form-field');
      const value = field.value.trim();
      let valid = value.length > 0;
      if (field.type === 'email' && value) valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (field.type === 'tel' && value) valid = value.replace(/[^0-9+]/g, '').length >= 8;
      wrapper.classList.toggle('has-error', !valid);
      if (!valid) hasError = true;
    });
    if (hasError) {
      event.preventDefault();
      const firstError = form.querySelector('.has-error input, .has-error textarea');
      if (firstError) firstError.focus();
    }
  });
}

// --- Apparition au defilement (contenu visible par defaut sans JS) ---
function initRevealOnScroll() {
  document.documentElement.classList.add('js');
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  items.forEach((el) => observer.observe(el));
}

// --- Compteurs animes (valeur reelle deja presente dans le HTML) ---
function initCounters() {
  const counters = document.querySelectorAll('[data-count-to]');
  if (!counters.length) return;

  function animate(el) {
    const target = parseFloat(el.getAttribute('data-count-to'));
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1100;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = (Number.isInteger(target) ? Math.round(value) : value.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 },
  );
  counters.forEach((el) => observer.observe(el));
}
