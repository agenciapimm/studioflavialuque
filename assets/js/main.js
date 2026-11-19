(function () {
  'use strict';

  /* ---------- URLs limpas no servidor, .html no disco ----------
     No HTML os links são "pagina.html" (funcionam abrindo do disco, file://).
     No servidor (http/https), tira o .html dos links e da barra de endereço.
     A 404 tem uma cópia inline deste trecho (com base na raiz do site). */
  if (/^https?:$/.test(location.protocol) && !document.documentElement.hasAttribute('data-404')) {
    var limpar = function (path) {
      return path.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '');
    };
    document.querySelectorAll('a[href]').forEach(function (a) {
      var raw = a.getAttribute('href');
      if (/^(?:[a-z]+:|#|\/\/)/i.test(raw)) return;
      var u = new URL(raw, location.href);
      if (u.origin !== location.origin || !/\.html$/.test(u.pathname)) return;
      a.setAttribute('href', limpar(u.pathname) + u.search + u.hash);
    });
    if (/\.html$/.test(location.pathname)) {
      history.replaceState(null, '', limpar(location.pathname) + location.search + location.hash);
    }
  }

  /* ---------- FAQ (acordeão) ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (o) {
        if (o !== item) {
          o.classList.remove('open');
          o.querySelector('.faq-a').style.maxHeight = null;
          o.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        }
      });
      if (isOpen) {
        item.classList.remove('open');
        a.style.maxHeight = null;
      } else {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
      q.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ---------- Ano automático no rodapé ---------- */
  document.querySelectorAll('[data-ano-atual]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Aviso de cookies (informativo) ----------
     O Pixel da Meta fica sempre ativo (decisão do cliente). O aviso informa
     e aponta para a Política de Privacidade; "Entendi" só esconde o aviso. */
  var CONSENT_KEY = 'studioflavialuque-cookie-aviso';
  var memory = null;

  function getSeen() {
    try { return localStorage.getItem(CONSENT_KEY) || memory; } catch (e) { return memory; }
  }
  function setSeen() {
    memory = 'ok';
    try { localStorage.setItem(CONSENT_KEY, 'ok'); } catch (e) {}
    document.dispatchEvent(new CustomEvent('cookieconsent', { detail: { status: 'informed' } }));
  }

  var policy = document.querySelector('a[href*="politica-de-privacidade"]');
  var href = policy ? policy.getAttribute('href') : '/politica-de-privacidade';
  var banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Aviso de cookies');
  banner.hidden = true;
  banner.innerHTML =
    '<p class="cookie-banner__text">Esse site usa cookies para melhorar a sua experiência. ' +
    'Saiba mais na nossa <a href="' + href + '">Política de Privacidade</a>.</p>' +
    '<button type="button" class="btn btn-primary" data-cookie-ok>Entendi</button>';
  document.body.appendChild(banner);

  banner.querySelector('[data-cookie-ok]').addEventListener('click', function () {
    setSeen();
    banner.hidden = true;
  });

  document.querySelectorAll('[data-cookie-preferences]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      banner.hidden = false;
      banner.querySelector('[data-cookie-ok]').focus();
    });
  });

  if (!getSeen()) banner.hidden = false;
})();
