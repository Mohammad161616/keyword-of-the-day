// Keyword of the Day
// Shows one coding keyword per day. The keyword is chosen by date, so
// everyone sees the same word on the same day, with no backend needed.

const START_DATE = Date.UTC(2026, 10, 16); // 16 Nov 2026 (months are 0-indexed)
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const LEARNED_KEY = 'kotd-learned';
const LANGUAGE_KEY = 'kotd-language';
const RECENT_DAYS = 5;

// ---------- Pure logic (also exported for testing) ----------

// Number of days since START_DATE, using the local calendar date.
// Building the value with Date.UTC avoids daylight-saving problems.
function dayNumber(date) {
  const today = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((today - START_DATE) / MS_PER_DAY);
}

// Wraps any day number (including negative ones) into a valid list index.
function pickIndex(day, length) {
  return ((day % length) + length) % length;
}

function keywordId(entry) {
  return entry.language + ':' + entry.keyword;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { dayNumber, pickIndex, keywordId, START_DATE };
}

// ---------- Browser code ----------

if (typeof document !== 'undefined') {
  const els = {
    badge: document.getElementById('badge'),
    language: document.getElementById('language'),
    keyword: document.getElementById('keyword'),
    definition: document.getElementById('definition'),
    example: document.getElementById('example'),
    error: document.getElementById('error'),
    filter: document.getElementById('language-filter'),
    learnedBtn: document.getElementById('learned-btn'),
    randomBtn: document.getElementById('random-btn'),
    todayBtn: document.getElementById('today-btn'),
    progress: document.getElementById('progress'),
    recentList: document.getElementById('recent-list')
  };

  let allKeywords = [];
  let current = null;
  let learned = new Set();

  // localStorage can be blocked (private mode, strict settings), so every
  // access is wrapped in try/catch and the app still works without it.
  function loadLearned() {
    try {
      const raw = localStorage.getItem(LEARNED_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      return new Set();
    }
  }

  function saveLearned() {
    try {
      localStorage.setItem(LEARNED_KEY, JSON.stringify([...learned]));
    } catch (e) {
      // Ignore: progress just won't persist.
    }
  }

  function loadLanguage() {
    try {
      return localStorage.getItem(LANGUAGE_KEY) || 'All';
    } catch (e) {
      return 'All';
    }
  }

  function saveLanguage(value) {
    try {
      localStorage.setItem(LANGUAGE_KEY, value);
    } catch (e) {
      // Ignore.
    }
  }

  function filteredList() {
    const lang = els.filter.value;
    return lang === 'All' ? allKeywords : allKeywords.filter(k => k.language === lang);
  }

  function todaysEntry(offsetDays = 0) {
    const list = filteredList();
    return list[pickIndex(dayNumber(new Date()) - offsetDays, list.length)];
  }

  // textContent (not innerHTML) is used everywhere, so data can never be
  // interpreted as HTML. This prevents cross-site scripting (XSS).
  function show(entry, badgeText) {
    current = entry;
    els.badge.textContent = badgeText;
    els.language.textContent = entry.language;
    els.keyword.textContent = entry.keyword;
    els.definition.textContent = entry.definition;
    els.example.textContent = entry.example;
    updateLearnedButton();
  }

  function updateLearnedButton() {
    const isLearned = current && learned.has(keywordId(current));
    els.learnedBtn.textContent = isLearned ? 'Learned ✓' : 'Mark as learned';
    els.learnedBtn.setAttribute('aria-pressed', String(Boolean(isLearned)));
  }

  function updateProgress() {
    const total = allKeywords.length;
    const count = allKeywords.filter(k => learned.has(keywordId(k))).length;
    els.progress.textContent = count + ' of ' + total + ' keywords learned';
  }

  function renderRecent() {
    els.recentList.textContent = '';
    for (let i = 1; i <= RECENT_DAYS; i++) {
      const entry = todaysEntry(i);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = entry.keyword;
      btn.title = entry.language;
      btn.addEventListener('click', () => show(entry, i === 1 ? 'Yesterday' : i + ' days ago'));
      els.recentList.appendChild(btn);
    }
  }

  function showToday() {
    show(todaysEntry(0), 'Today');
    renderRecent();
  }

  function showRandom() {
    const list = filteredList();
    show(list[Math.floor(Math.random() * list.length)], 'Random');
  }

  function buildFilter() {
    const languages = ['All', ...new Set(allKeywords.map(k => k.language))];
    for (const lang of languages) {
      const option = document.createElement('option');
      option.value = lang;
      option.textContent = lang;
      els.filter.appendChild(option);
    }
    const saved = loadLanguage();
    els.filter.value = languages.includes(saved) ? saved : 'All';
  }

  function showError(message) {
    els.keyword.textContent = 'Something went wrong';
    els.definition.textContent = '';
    els.example.textContent = '';
    els.error.textContent = message;
    els.error.hidden = false;
  }

  async function init() {
    try {
      const res = await fetch('keywords.json');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      allKeywords = await res.json();
      if (!Array.isArray(allKeywords) || allKeywords.length === 0) {
        throw new Error('The keyword list is empty.');
      }
    } catch (e) {
      showError(
        'Could not load keywords.json. If you opened index.html directly, ' +
        'run a local server instead (for example: python3 -m http.server).'
      );
      return;
    }

    learned = loadLearned();
    buildFilter();
    showToday();
    updateProgress();

    els.filter.addEventListener('change', () => {
      saveLanguage(els.filter.value);
      showToday();
    });

    els.learnedBtn.addEventListener('click', () => {
      const id = keywordId(current);
      if (learned.has(id)) {
        learned.delete(id);
      } else {
        learned.add(id);
      }
      saveLearned();
      updateLearnedButton();
      updateProgress();
    });

    els.randomBtn.addEventListener('click', showRandom);
    els.todayBtn.addEventListener('click', showToday);
  }

  init();
}
