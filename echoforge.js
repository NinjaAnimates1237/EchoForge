// echoforge.js — minimal interactive behavior + loads config.json
(async () => {
  const el = id => document.getElementById(id);
  const log = (t) => { const l = el('log'); l.textContent = `[${new Date().toLocaleTimeString()}] ${t}\n` + l.textContent; };

  // load config.json
  let config = { title: "EchoForge", tagline: "Forge echoes of ideas.", hero: "Start building." };
  try {
    const resp = await fetch('./config.json');
    if (resp.ok) config = await resp.json();
    else log('config.json not found — using defaults.');
  } catch (e) {
    log('Could not load config.json (CORS/file://). If opening locally, run a local server.');
  }

  // apply config
  el('siteTitle').textContent = config.title || 'EchoForge';
  el('siteTagline').textContent = config.tagline || '';
  el('heroText').textContent = config.hero || '';

  // basic actions
  el('sampleAction').addEventListener('click', () => {
    const message = `Echo created at ${new Date().toLocaleTimeString()}`;
    log(message);
    // simple visual pulse
    el('siteTitle').classList.add('pulse');
    setTimeout(()=>el('siteTitle').classList.remove('pulse'), 450);
  });

  // theme toggle
  el('themeToggle').addEventListener('click', () => {
    document.documentElement.classList.toggle('light-theme');
    log('Toggled theme');
  });

  log('EchoForge ready.');
})();
