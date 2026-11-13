(function () {
  const cfg = window.APP_CONFIG || {};
  const configured = Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase);
  window.sb = configured ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
  window.isDemoMode = !window.sb || cfg.DEMO_MODE === true;
  if (window.sb && cfg.DEMO_MODE === true) window.isDemoMode = false;
})();