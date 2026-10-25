(function () {
  'use strict';

  var root = document.documentElement;
  var BAR = { dark: '#161b22', light: '#f6f8fa' };
  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  /* ---------- theme ---------- */

  function effectiveTheme() {
    return root.dataset.theme || (darkQuery.matches ? 'dark' : 'light');
  }

  function syncThemeColor() {
    // Android Chrome tints the status bar with theme-color; keep it matched to the title bar.
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i++) {
      var forced = root.dataset.theme;
      metas[i].setAttribute('content', forced ? BAR[forced] : (metas[i].media.indexOf('dark') > -1 ? BAR.dark : BAR.light));
    }
  }

  function setTheme(t) {
    if (t === 'light' || t === 'dark') root.dataset.theme = t;
    else delete root.dataset.theme;
    try {
      if (root.dataset.theme) localStorage.setItem('theme', root.dataset.theme);
      else localStorage.removeItem('theme');
    } catch (e) {}
    syncThemeColor();
  }

  document.getElementById('theme-btn').addEventListener('click', function () {
    setTheme(effectiveTheme() === 'dark' ? 'light' : 'dark');
  });
  syncThemeColor();

  /* ---------- small details ---------- */

  document.getElementById('year').textContent = new Date().getFullYear();
  document.getElementById('last-login').textContent = new Date().toDateString();

  /* ---------- highlight the tab of the section in view ---------- */

  var tabs = document.querySelectorAll('.tabs a');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        tabs.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    tabs.forEach(function (a) {
      var s = document.querySelector(a.getAttribute('href'));
      if (s) io.observe(s);
    });
  }

  /* ---------- interactive shell ---------- */

  var shell = document.getElementById('shell');
  var out = document.getElementById('out');
  var form = document.getElementById('cli');
  var input = document.getElementById('cmd');
  var chips = document.getElementById('chips');
  shell.hidden = false;

  var LINKS = {
    github: 'https://github.com/devdatta-mahesh-joshi',
    linkedin: 'https://www.linkedin.com/in/devdatta-joshi-007/',
    email: 'mailto:devdattaj007@gmail.com'
  };
  var SECTIONS = ['about', 'experience', 'education', 'skills', 'projects', 'contact'];

  function line(text, cls) {
    var p = document.createElement('p');
    if (cls) p.className = cls;
    p.textContent = text;
    out.appendChild(p);
    return p;
  }

  function goTo(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView();
    el.classList.remove('flash');
    void el.offsetWidth; // restart the animation
    el.classList.add('flash');
    history.replaceState(null, '', '#' + id);
  }

  function open(url) { window.open(url, url.indexOf('mailto:') === 0 ? '_self' : '_blank', 'noopener'); }

  var COMMANDS = {
    help: { desc: 'list commands', run: function () {
      Object.keys(COMMANDS).forEach(function (k) {
        if (!COMMANDS[k].hidden) line('  ' + (k + '            ').slice(0, 12) + COMMANDS[k].desc);
      });
    } },
    whoami: { desc: 'who is this?', run: function () {
      line('Devdatta Mahesh Joshi — Software Engineer @ Interactive Brokers');
      goTo('whoami');
    } },
    ls: { desc: 'list sections', run: function () {
      line(SECTIONS.map(function (s) { return s + '/'; }).join('  '));
    } },
    cd: { desc: 'go to a section, e.g. cd skills', run: function (a) {
      var s = (a[0] || '').replace(/^~?\/?|\/$/g, '');
      if (!s || s === '~') return goTo('whoami');
      if (SECTIONS.indexOf(s) > -1) return goTo(s);
      line('cd: no such file or directory: ' + a[0], 'err');
    } },
    github: { desc: 'open GitHub profile', run: function () { line('opening github…'); open(LINKS.github); } },
    linkedin: { desc: 'open LinkedIn profile', run: function () { line('opening linkedin…'); open(LINKS.linkedin); } },
    email: { desc: 'send an email', run: function () { line('opening mail client…'); open(LINKS.email); } },
    theme: { desc: 'theme [light|dark|auto]', run: function (a) {
      var t = a[0];
      if (!t) t = effectiveTheme() === 'dark' ? 'light' : 'dark';
      if (['light', 'dark', 'auto'].indexOf(t) < 0) return line('usage: theme [light|dark|auto]', 'err');
      setTheme(t);
      line('theme set to ' + t);
    } },
    clear: { desc: 'clear the terminal', run: function () { out.textContent = ''; } },
    history: { desc: 'show command history', run: function () {
      hist.forEach(function (h, i) { line('  ' + (i + 1) + '  ' + h); });
    } },
    echo: { hidden: true, run: function (a) { line(a.join(' ')); } },
    pwd: { hidden: true, run: function () { line('/home/devdatta'); } },
    date: { hidden: true, run: function () { line(new Date().toString()); } },
    sudo: { hidden: true, run: function () { line('devdatta is not in the sudoers file. This incident will be reported.', 'err'); } },
    exit: { hidden: true, run: function () { line('logout… just kidding. Thanks for visiting!'); } }
  };
  SECTIONS.forEach(function (s) {
    COMMANDS[s] = { desc: 'jump to ' + s, run: function () { goTo(s); } };
  });

  var hist = [];
  var hpos = 0;

  function run(raw) {
    var text = raw.trim();
    var echo = line('', 'echo');
    echo.innerHTML = '<span class="ps1">' + form.querySelector('label').innerHTML + '</span> ';
    echo.appendChild(document.createTextNode(text));
    if (!text) return;
    hist.push(text);
    hpos = hist.length;
    var parts = text.split(/\s+/);
    var name = parts[0].toLowerCase();
    if (name === 'cat' && parts[1]) name = parts[1].replace(/\..*$/, '').toLowerCase();
    var c = COMMANDS[name];
    if (c) c.run(parts.slice(1));
    else line(parts[0] + ': command not found. Try "help".', 'err');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    run(input.value);
    input.value = '';
    input.scrollIntoView({ block: 'nearest' });
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowUp' && hpos > 0) {
      e.preventDefault(); input.value = hist[--hpos];
    } else if (e.key === 'ArrowDown') {
      e.preventDefault(); hpos = Math.min(hpos + 1, hist.length); input.value = hist[hpos] || '';
    } else if (e.key === 'Tab' && input.value) {
      var m = Object.keys(COMMANDS).filter(function (k) { return k.indexOf(input.value) === 0; });
      if (m.length) { e.preventDefault(); if (m.length === 1) input.value = m[0]; else line(m.join('  '), 'dim'); }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault(); out.textContent = '';
    }
  });

  ['help', 'ls', 'experience', 'skills', 'github', 'theme', 'clear'].forEach(function (c) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = c;
    b.addEventListener('click', function () { run(c); });
    chips.appendChild(b);
  });

  /* ---------- offline support / installable on Android ---------- */

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }
})();
