"use strict";

const menuButton = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector("#mobile-nav");

if (menuButton && mobileMenu) {
  const setMenuOpen = (isOpen) => {
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Закрити меню" : "Відкрити меню");
    mobileMenu.classList.toggle("is-open", isOpen);
    mobileMenu.inert = !isOpen;
    document.body.classList.toggle("menu-open", isOpen);
  };

  menuButton.addEventListener("click", () => {
    setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
  });

  mobileMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });

  window.matchMedia("(min-width: 901px)").addEventListener("change", (event) => {
    if (event.matches) setMenuOpen(false);
  });
}

const revealElements = document.querySelectorAll(".reveal");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px 30px 0px" });

  revealElements.forEach((element) => observer.observe(element));
}


// Education: centered gallery with one prominent certificate; swipe and side-card navigation.
(() => {
  const root = document.querySelector('.education');
  if (!root) return;
  const viewport = root.querySelector('.education__viewport');
  const track = root.querySelector('.education__track');
  const desktopSlides = [...root.querySelectorAll('.education__slide')];
  // On phones the academic diploma leads; on desktop it occupies the middle of the first five.
  const mobileSlides = [desktopSlides[2], ...desktopSlides.filter((_, i) => i !== 2)];
  let slides = desktopSlides;
  const media = window.matchMedia('(min-width: 701px)');
  const arrange = () => {
    slides = media.matches ? desktopSlides : mobileSlides;
    slides.forEach((slide, i) => {
      track.append(slide);
      slide.querySelector('[data-certificate]').dataset.certificate = String(i);
      slide.setAttribute('aria-label', `Сертифікат ${i + 1} із ${slides.length}`);
    });
    activeIndex = media.matches ? 2 : 0;
    update();
    syncArrows();
  };
  const current = root.querySelector('[data-education-current]');
  const progress = root.querySelector('[data-education-progress]');
  let activeIndex = 0;
  const update = () => {
    slides.forEach((slide,i) => {
      const desktop = window.matchMedia('(min-width: 701px)').matches;
      const windowCenter = desktop ? Math.max(2, Math.min(slides.length - 3, activeIndex)) : activeIndex;
      const delta = i - windowCenter;
      const distance = desktop ? Math.min(Math.abs(delta), 3) : Math.min(Math.abs(i - activeIndex), 3);
      slide.dataset.active = String(i === activeIndex);
      slide.style.setProperty('--offset',String(Math.max(-3,Math.min(3,delta))));
      slide.dataset.distance = String(distance);
      slide.setAttribute('aria-hidden',distance > 2 ? 'true' : 'false');
      slide.querySelector('button').tabIndex = i === activeIndex ? 0 : -1;
    });
    current.textContent = String(activeIndex + 1).padStart(2,'0');
    progress.style.width = `${((activeIndex + 1)/slides.length)*100}%`;
  };
  const move = direction => {activeIndex=Math.max(0,Math.min(slides.length-1,activeIndex+direction));update();};
  let startX = null;
  viewport.addEventListener('pointerdown',e=>{startX=e.clientX;});
  viewport.addEventListener('pointerup',e=>{
    if(startX===null)return;
    const delta=e.clientX-startX;startX=null;
    if(Math.abs(delta)>35){move(delta<0?1:-1);viewport.dataset.swiped='true';setTimeout(()=>delete viewport.dataset.swiped,80);}
  });
  viewport.addEventListener('pointercancel',()=>{startX=null;});
  viewport.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}
  });
  const prevButton = root.querySelector('[data-education-prev]');
  const nextButton = root.querySelector('[data-education-next]');
  prevButton.addEventListener('click', () => move(-1));
  nextButton.addEventListener('click', () => move(1));
  const syncArrows = () => {
    prevButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === slides.length - 1;
  };
  // Keep arrow availability synchronized with swipe, click and keyboard navigation.
  const arrowObserver = new MutationObserver(syncArrows);
  arrowObserver.observe(current, {childList:true,characterData:true,subtree:true});
  media.addEventListener('change', arrange);
  arrange();
  const education = document.querySelector('#education-modal');
  const certificate = document.querySelector('#certificate-modal');
   const experience = document.querySelector('#experience-modal');
  const syncLock = () => document.body.classList.toggle('education-dialog-open', education.open || certificate.open || experience.open);
  const show = dialog => { dialog.showModal(); syncLock(); };
  document.querySelector('[data-open-education]').addEventListener('click', () => show(education));
   document.querySelector('[data-open-experience]').addEventListener('click', () => show(experience));
   experience.querySelector('[data-close-experience]').addEventListener('click', () => experience.close());
  education.querySelector('[data-close-education]').addEventListener('click', () => education.close());
  certificate.querySelector('[data-close-certificate]').addEventListener('click', () => certificate.close());
  [education,certificate,experience].forEach(dialog => {
    dialog.addEventListener('close', syncLock);
    dialog.addEventListener('click', e => {if (e.target === dialog) dialog.close();});
  });
  root.querySelectorAll('[data-certificate]').forEach(button => button.addEventListener('click', () => {
    if (viewport.dataset.swiped) return;
    const idx = Number(button.dataset.certificate);
    if (idx !== activeIndex) { activeIndex = idx; update(); return; }
    const img = button.querySelector('img');
    certificate.querySelector('[data-certificate-full]').src = img.src;
    certificate.querySelector('[data-certificate-full]').alt = img.alt;
    certificate.querySelector('[data-certificate-caption]').textContent = img.alt;
    show(certificate);
  }));
})();

// WayForPay hosted payment links. Insert the four links issued in the merchant dashboard.
// Do not place merchant secret keys or payment-signature generation in frontend code.
const wayForPayLinks = {
  individual: "",
  family: "",
  "individual-pack": "",
  "family-pack": ""
};
const pricingNote = document.querySelector("#pricing-payment-note");
document.querySelectorAll(".pricing__buy[data-payment]").forEach(button => {
  button.addEventListener("click", () => {
    const url = wayForPayLinks[button.dataset.payment];
    if (url && /^https:\/\//i.test(url)) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else if (pricingNote) {
      pricingNote.hidden = false;
      pricingNote.textContent = "Оплата цієї послуги скоро буде доступна. Поки що для запису скористайтеся кнопкою «Записатися» у верхньому меню.";
      pricingNote.scrollIntoView({behavior: "smooth", block: "nearest"});
    }
  });
});

// Unified requests: keep one category open while preserving native <details> accessibility.
const requestDetails = document.querySelectorAll('.requests__accordion .requests__item');
requestDetails.forEach(item => item.addEventListener('toggle', () => {
  if (!item.open) return;
  requestDetails.forEach(other => { if (other !== item && other.open) other.open = false; });
}));


// Photo request cards: accessible, scrollable detail dialogs.
(() => {
  const dialogs = [...document.querySelectorAll('.requests-dialog')];
  if (!dialogs.length) return;
  const syncLock = () => document.body.classList.toggle('requests-dialog-open', dialogs.some(dialog => dialog.open));
  document.querySelectorAll('[data-request-open]').forEach(button => {
    button.addEventListener('click', () => {
      const dialog = document.getElementById(`requests-dialog-${Number(button.dataset.requestOpen) + 1}`);
      if (!dialog) return;
      dialog.showModal();
      syncLock();
    });
  });
  dialogs.forEach(dialog => {
    dialog.querySelector('[data-request-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', syncLock);
  });
})();

// Slightly wider Google Maps view on mobile; preserve the desktop zoom.
(() => {
  const map = document.querySelector('.contact-footer__map-background iframe');
  if (!map) return;
  const desktopSrc = map.getAttribute('src');
  const mobileSrc = desktopSrc.replace(/([?&])z=\d+/, '$1').replace(/&output=embed/, '&z=13&output=embed');
  const media = window.matchMedia('(max-width: 900px)');
  const syncMapZoom = () => {
    const next = media.matches ? mobileSrc : desktopSrc;
    if (map.getAttribute('src') !== next) map.setAttribute('src', next);
  };
  media.addEventListener('change', syncMapZoom);
  syncMapZoom();
})();

// Blog: reuse the native dialog interaction pattern used elsewhere on the site.
(() => {
  const dialogs = [...document.querySelectorAll('.blog-dialog')];
  if (!dialogs.length) return;
  const syncLock = () => document.body.classList.toggle('blog-dialog-open', dialogs.some(dialog => dialog.open));
  document.querySelectorAll('[data-blog-open]').forEach(button => {
    button.addEventListener('click', () => {
      const dialog = document.getElementById(`blog-dialog-${button.dataset.blogOpen}`);
      if (!dialog) return;
      dialog.showModal();
      dialog.querySelector('.blog-dialog__content')?.scrollTo(0, 0);
      syncLock();
    });
  });
  dialogs.forEach(dialog => {
    dialog.querySelector('[data-blog-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', syncLock);
  });
})();

// Lead forms: client-side validation and verified Apps Script response via hidden iframe.
(() => {
  const dialog = document.querySelector('#lead-dialog');
  const successDialog = document.querySelector('#lead-success');
  const syncLock = () => document.body.classList.toggle('education-dialog-open',
    Boolean(dialog?.open || successDialog?.open));
  if (dialog) {
    document.querySelectorAll('[data-lead-open]').forEach(button => button.addEventListener('click', () => {
      dialog.showModal(); syncLock();
    }));
    dialog.querySelector('[data-lead-close]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', syncLock);
  }
  if (successDialog) {
    successDialog.querySelectorAll('[data-success-close]').forEach(button =>
      button.addEventListener('click', () => successDialog.close()));
    successDialog.addEventListener('click', event => { if (event.target === successDialog) successDialog.close(); });
    successDialog.addEventListener('close', syncLock);
  }

  // Paste your deployed Google Apps Script Web App /exec URL here.
  const endpoint = 'https://script.google.com/macros/s/AKfycbyNqMFeBxNjetNcwBsPIsjfmaO83rlB3c45RN2ABCCuC1eDbYNqQI8ec6RGn9FFOkB4FQ/exec';
  // International format (+country code), plus Ukrainian domestic numbers.
  const phoneValid = value => {
    const raw = value.trim();
    if (!/^[+\d\s()\-]+$/.test(raw) || (raw.match(/\+/g) || []).length > 1) return false;
    const digits = raw.replace(/\D/g, '');
    return raw.startsWith('+')
      ? /^\+[1-9]/.test(raw) && digits.length >= 8 && digits.length <= 15
      : /^0\d{9}$/.test(digits);
  };
  const errors = {
    name: 'Введіть ім’я (щонайменше 2 символи).',
    phone: 'Введіть номер з кодом країни (+...), або український 0XXXXXXXXX.',
    consent: 'Потрібна згода на обробку контактних даних.'
  };
  const validateField = field => {
    let valid = true;
    if (field.name === 'name') valid = field.value.trim().length >= 2;
    if (field.name === 'phone') valid = phoneValid(field.value);
    if (field.name === 'consent') valid = field.checked;
    field.setAttribute('aria-invalid', String(!valid));
    const label = field.closest('label');
    if (label && field.name !== 'consent') {
      let error = label.querySelector('.lead-form__error');
      if (!valid && !error) {
        error = document.createElement('span'); error.className = 'lead-form__error';
        label.append(error);
      }
      if (error) { error.textContent = valid ? '' : errors[field.name]; error.hidden = valid; }
    }
    return valid;
  };
  document.querySelectorAll('[data-lead-form]').forEach(form => {
    const status = form.querySelector('.lead-form__status');
    const fields = [...form.querySelectorAll('[name="name"], [name="phone"], [name="consent"]')];
    fields.forEach(field => {
      field.addEventListener(field.type === 'checkbox' ? 'change' : 'input', () => {
        if (field.name === 'phone') {
          // Block letters in both phone fields, including pasted text.
          const cleaned = field.value.replace(/[^+\d\s()\-]/g, '').replace(/(?!^)\+/g, '');
          if (cleaned !== field.value) field.value = cleaned;
          validateField(field);
        } else if (field.hasAttribute('aria-invalid')) validateField(field);
      });
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const valid = fields.map(validateField).every(Boolean);
      if (!valid) {
        status.dataset.state = 'error'; status.textContent = 'Перевірте, будь ласка, позначені поля.';
        fields.find(field => field.getAttribute('aria-invalid') === 'true')?.focus();
        return;
      }
      if (!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(endpoint)) {
        status.dataset.state = 'error';
        status.textContent = 'Форму ще не підключено. Напишіть, будь ласка, у Telegram.';
        return;
      }
      const button = form.querySelector('[type="submit"]');
      button.disabled = true;
      status.dataset.state = ''; status.textContent = 'Надсилаємо заявку…';
      const requestId = (globalThis.crypto?.randomUUID?.() || String(Date.now()) + Math.random());
      const frame = document.createElement('iframe');
      frame.name = 'lead-submit-' + requestId.replace(/[^a-zA-Z0-9-]/g, '');
      frame.hidden = true;
      frame.setAttribute('title', 'Надсилання заявки');
      document.body.append(frame);
      const post = document.createElement('form');
      post.method = 'POST'; post.action = endpoint; post.target = frame.name; post.hidden = true;
      const values = Object.fromEntries(new FormData(form).entries());
      values.requestId = requestId;
      values.consent = 'yes';
      Object.entries(values).forEach(([name, value]) => {
        const input = document.createElement('input'); input.type = 'hidden';
        input.name = name; input.value = value; post.append(input);
      });
      document.body.append(post);
      let timer;
      const cleanup = () => {
        clearTimeout(timer); window.removeEventListener('message', onMessage);
        post.remove(); frame.remove(); button.disabled = false;
      };
      const onMessage = event => {
        if (!/^(https:\/\/([a-z0-9-]+\.)*(googleusercontent\.com|google\.com)|null)$/i.test(event.origin)) return;
        let data = event.data;
        if (typeof data === 'string') { try { data = JSON.parse(data); } catch { return; } }
        if (!data || data.type !== 'lead-form-result' || data.requestId !== requestId) return;
        cleanup();
        if (data.ok === true) {
          form.reset(); fields.forEach(field => { field.removeAttribute('aria-invalid');
            field.closest('label')?.querySelector('.lead-form__error')?.remove(); });
          status.textContent = '';
          if (dialog?.open) dialog.close();
          successDialog?.showModal(); syncLock();
        } else {
          status.dataset.state = 'error';
          status.textContent = 'Не вдалося надіслати заявку. Спробуйте ще раз або напишіть у Telegram.';
        }
      };
      window.addEventListener('message', onMessage);
      timer = setTimeout(() => {
        cleanup(); status.dataset.state = 'error';
        status.textContent = 'Google не підтвердив результат. Перевірте Telegram і не надсилайте повторно, якщо заявка вже прийшла.';
      }, 10000);
      post.submit();
    });
  });
})();
