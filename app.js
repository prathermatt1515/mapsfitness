/* =====================================================
   MAPsFitness — Piece 2
   Screen routing, theme toggle, login preview shim.
   No Firebase yet (Pieces 4 + 5).
   ===================================================== */

(function () {
  'use strict';

  // ---------------------------------------------------
  // THEME TOGGLE
  // Saves choice to localStorage, restores on load.
  // ---------------------------------------------------

  const THEME_KEY = 'mapsfitness:theme';
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    // Update the iOS status bar color to match
    const themeColor = theme === 'light' ? '#F5F7FA' : '#0A1628';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', themeColor);
  }

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      // localStorage unavailable, fall back to in-session only
    }
  }

  // Restore theme on load
  const savedTheme = getStoredTheme();
  if (savedTheme === 'light' || savedTheme === 'dark') {
    applyTheme(savedTheme);
  }
  // Otherwise leave default ("dark" set in HTML)

  // Wire the toggle button
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const current = root.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      storeTheme(next);
    });
  }

  // ---------------------------------------------------
  // SCREEN ROUTER
  // Bottom nav swaps which screen section is visible.
  // ---------------------------------------------------

  const tabs = document.querySelectorAll('.nav-tab');
  const screens = document.querySelectorAll('.screen');
  const screenTitle = document.getElementById('screen-title');

  const TITLE_MAP = {
    today: 'Today',
    workouts: 'Workouts',
    nutrition: 'Nutrition',
    progress: 'Progress'
  };

  function setActiveTab(tabName) {
    tabs.forEach(function (tab) {
      const isActive = tab.dataset.tab === tabName;
      tab.classList.toggle('is-active', isActive);
    });
    screens.forEach(function (screen) {
      const isActive = screen.dataset.screen === tabName;
      screen.classList.toggle('is-active', isActive);
    });
    if (screenTitle && TITLE_MAP[tabName]) {
      screenTitle.textContent = TITLE_MAP[tabName];
    }
    // Scroll content area to top on tab switch
    const main = document.querySelector('.app-main');
    if (main) main.scrollTop = 0;
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      const tabName = tab.dataset.tab;
      if (tabName) setActiveTab(tabName);
    });
  });

  // ---------------------------------------------------
  // LOGIN PREVIEW SHIM
  // Auth lands in Piece 5. For now, any login button
  // just hides the login screen and shows the app.
  // ---------------------------------------------------

  const loginScreen = document.getElementById('screen-login');
  const app = document.getElementById('app');

  function showApp() {
    if (loginScreen) loginScreen.hidden = true;
    if (app) app.hidden = false;
  }

  document.querySelectorAll('[data-action="login"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      showApp();
    });
  });

})();
