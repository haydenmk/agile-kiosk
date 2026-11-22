/**
 * Kiosk content store
 *
 * Holds everything an admin can edit (events, flyers, news ticker, classes,
 * contacts, layout) on top of the defaults that live in app.js.
 *
 *  - Edits are saved to this browser's localStorage, so they survive page
 *    reloads and restarts on the SAME device/browser profile.
 *  - Anything missing or malformed in storage falls back to the defaults, so a
 *    bad save can never leave the kiosk blank.
 *  - Export / import produce a plain JSON file you can back up or move to
 *    another browser.
 */
(function () {
  const STORAGE_KEY = 'uhmc-kiosk-content-v1';
  const EXPORT_FORMAT = 'uhmc-kiosk-content';

  // Screens a menu tile can open (view-custom is handled separately).
  const VIEWS = [
    { id: 'view-programs', label: 'Business Programs' },
    { id: 'view-directory', label: 'Building Directory' },
    { id: 'view-jobs', label: 'Job Opportunities' },
    { id: 'view-events', label: 'Events & News' },
    { id: 'view-survey', label: 'Student Survey' },
    { id: 'view-website', label: 'UHMC Website' }
  ];

  // Photos that ship with the kiosk (admin photo pickers list these).
  // To offer a new photo, add its file to assets/images/ and add it here.
  const IMAGES = [
    { label: 'Welcome: UH Maui', path: 'assets/images/welcome_screen/UH Maui_Welcome.png' },
    { label: 'Welcome: Campus 1', path: 'assets/images/welcome_screen/UHMC_img_1.jpg' },
    { label: 'Welcome: UH Maui', path: 'assets/images/welcome_screen/UH Maui.jpg' },
    { label: 'Welcome: UH Maui (2)', path: 'assets/images/welcome_screen/UH Maui (2).jpg' },
    { label: 'Welcome: Campus life', path: 'assets/images/welcome_screen/55279649133_52bc572d25_k.jpg' },
    { label: 'Welcome: Student resources', path: 'assets/images/welcome_screen/55279910055_e8931d2884_k.jpg' },
    { label: 'Tile: Programs', path: 'assets/images/main_screen/Screenshot 2026-11-12 092038.png' },
    { label: 'Tile: Directory', path: 'assets/images/main_screen/Screenshot 2026-11-12 092032.png' },
    { label: 'Tile: Jobs', path: 'assets/images/main_screen/Screenshot 2026-11-12 092103.png' },
    { label: 'Tile: Events', path: 'assets/images/main_screen/Screenshot 2026-11-12 092057.png' },
    { label: 'Tile: Survey', path: 'assets/images/main_screen/Screenshot 2026-11-12 092052.png' },
    { label: 'Tile: Website', path: 'assets/images/main_screen/Screenshot 2026-11-12 092045.png' }
  ];

  // An image path is kept only if it points inside this site (assets/...) or at
  // an http(s) address, and has no characters that could break out of CSS url('...').
  function cleanImage(value) {
    const path = str(value).trim();
    if (!path) return '';
    if (/[\\'"<>\u0000-\u001f]/.test(path)) return '';
    if (/^assets\/[^:]+$/.test(path) && !path.includes('..')) return path;
    if (/^https?:\/\/[^\s]+$/i.test(path)) return path;
    return '';
  }

  // Background gradients for attract-screen flyers.
  const FLYER_THEMES = {
    ocean:  { label: 'Ocean blue', css: 'linear-gradient(145deg, #004f6e 0%, #002530 100%)' },
    navy:   { label: 'Deep navy',  css: 'linear-gradient(145deg, #093758 0%, #031c2e 100%)' },
    copper: { label: 'Copper',     css: 'linear-gradient(145deg, #5c2c16 0%, #2f1508 100%)' },
    slate:  { label: 'Slate',      css: 'linear-gradient(145deg, #2b3a42 0%, #151e23 100%)' },
    lagoon: { label: 'Lagoon',     css: 'linear-gradient(145deg, #004f6e 0%, #00313c 100%)' },
    forest: { label: 'Forest teal', css: 'linear-gradient(145deg, #245b59 0%, #123436 100%)' }
  };

  // Menu tile icons (24x24, stroke style to match the existing tiles).
  const ICONS = {
    book:      { label: 'Book',        paths: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10M6 14h6"/>' },
    layout:    { label: 'Map / grid',  paths: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/>' },
    briefcase: { label: 'Briefcase',   paths: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>' },
    calendar:  { label: 'Calendar',    paths: '<rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>' },
    clipboard: { label: 'Checklist',   paths: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/>' },
    globe:     { label: 'Globe',       paths: '<circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>' },
    info:      { label: 'Info',        paths: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/>' },
    star:      { label: 'Star',        paths: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' },
    users:     { label: 'People',      paths: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
    mail:      { label: 'Mail',        paths: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 7L2 7"/>' },
    phone:     { label: 'Phone',       paths: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>' },
    pin:       { label: 'Location pin', paths: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>' }
  };

  const ATTRACT_WIDGET_IDS = ['slideshow', 'today', 'job', 'ticker'];
  const EVENT_FILTERS = ['week', 'month', 'special'];
  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // ---------------------------------------------------------- date & events
  // Dates are plain "YYYY-MM-DD" strings in the kiosk's local time, and times
  // are "HH:MM" (24-hour), so they sort correctly as text and never shift with
  // time zones.
  const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
  const EVENT_TEMPLATE = {
    id: '', date: '', start: '', end: '', allDay: false,
    title: '', info: '', building: '', room: '', special: false
  };

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function isoDate(year, monthIndex, day) {
    return `${String(year).padStart(4, '0')}-${pad2(monthIndex + 1)}-${pad2(day)}`;
  }

  // Returns {y, m (0-11), d} for a real calendar date, otherwise null.
  function parseISO(text) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text || ''));
    if (!match) return null;
    const y = Number(match[1]);
    const m = Number(match[2]) - 1;
    const d = Number(match[3]);
    const check = new Date(y, m, d);
    if (check.getFullYear() !== y || check.getMonth() !== m || check.getDate() !== d) return null;
    return { y, m, d };
  }

  function todayISO() {
    const now = new Date();
    return isoDate(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function addDaysISO(iso, days) {
    const parts = parseISO(iso);
    const base = parts ? new Date(parts.y, parts.m, parts.d) : new Date();
    base.setDate(base.getDate() + days);
    return isoDate(base.getFullYear(), base.getMonth(), base.getDate());
  }

  function lastDayOfMonthISO(iso) {
    const parts = parseISO(iso) || parseISO(todayISO());
    return isoDate(parts.y, parts.m, new Date(parts.y, parts.m + 1, 0).getDate());
  }

  function longDate(iso) {
    const parts = parseISO(iso);
    if (!parts) return '';
    return new Date(parts.y, parts.m, parts.d)
      .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  // "14:30" -> "2:30 PM"
  function formatTime12(hhmm) {
    if (!TIME_RE.test(String(hhmm || ''))) return '';
    const hour = Number(hhmm.slice(0, 2));
    const minute = hhmm.slice(3);
    return `${hour % 12 || 12}:${minute} ${hour < 12 ? 'AM' : 'PM'}`;
  }

  function eventTimeText(ev) {
    if (ev.allDay) return 'All day';
    if (!ev.start) return '';
    return ev.end ? `${formatTime12(ev.start)} – ${formatTime12(ev.end)}` : formatTime12(ev.start);
  }

  // "Ka Lama" + "102" -> "Ka Lama Rm 102"
  function eventLocationText(ev) {
    return [str(ev.building).trim(), str(ev.room).trim() ? `Rm ${str(ev.room).trim()}` : '']
      .filter(Boolean)
      .join(' ');
  }

  function eventMonthDay(ev) {
    const parts = parseISO(ev.date);
    if (!parts) return { mon: '', day: '' };
    return { mon: MONTH_NAMES[parts.m].slice(0, 3).toUpperCase(), day: pad2(parts.d) };
  }

  // Oldest first; all-day events lead their day; ties keep their existing order.
  function compareEvents(a, b) {
    return (a.date + (a.allDay ? '' : a.start)).localeCompare(b.date + (b.allDay ? '' : b.start));
  }

  function sortEvents(events) {
    return events
      .map((ev, index) => ({ ev, index }))
      .sort((a, b) => compareEvents(a.ev, b.ev) || a.index - b.index)
      .map(item => item.ev);
  }

  /**
   * Which events the kiosk's Events page shows under a tab, based on real dates:
   *   week    today through the next 6 days
   *   month   today through the end of this calendar month
   *   special events marked "special occasion", from today on
   * Past events and events without a name are not shown.
   */
  function eventsFor(events, filter, today) {
    const from = today || todayISO();
    const weekEnd = addDaysISO(from, 6);
    const monthEnd = lastDayOfMonthISO(from);
    return sortEvents(events).filter(ev => {
      if (!ev.title.trim() || ev.date < from) return false;
      if (filter === 'special') return ev.special;
      if (filter === 'month') return ev.date <= monthEnd;
      return ev.date <= weekEnd;
    });
  }

  // Convert an event saved by the earlier admin panel (month text, day text,
  // free-text time/location, "show under" tab) into the new format.
  function convertLegacyEvent(raw, year) {
    const monthIndex = MONTH_NAMES.findIndex(name => name.slice(0, 3).toLowerCase() === str(raw.mon).trim().slice(0, 3).toLowerCase());
    const day = parseInt(raw.day, 10);
    if (monthIndex < 0 || !(day >= 1 && day <= 31)) return null;
    const date = isoDate(year, monthIndex, day);
    if (!parseISO(date)) return null;

    const timeText = str(raw.time);
    const stamps = [];
    const timeRe = /(\d{1,2}):(\d{2})\s*([AaPp])\.?[Mm]/g;
    let hit;
    while ((hit = timeRe.exec(timeText)) !== null && stamps.length < 2) {
      let hour = Number(hit[1]) % 12;
      if (hit[3].toLowerCase() === 'p') hour += 12;
      stamps.push(`${pad2(hour)}:${hit[2]}`);
    }
    let info = str(raw.desc);
    let allDay = /all[\s-]*day/i.test(timeText);
    if (!allDay && stamps.length === 0 && timeText.trim()) {
      // A time we can't read (for example "TBD"): keep the words, list as all day
      allDay = true;
      info = `${timeText.trim()}. ${info}`.trim();
    }

    // "Ka Lama Rm 201 Computer Lab" -> building "Ka Lama", room "201 Computer Lab"
    const location = str(raw.location).trim();
    const roomMatch = /^(.*?)\s*\b(?:rm|room)\.?\s+(.+)$/i.exec(location);

    return {
      id: '',
      date,
      start: allDay ? '' : (stamps[0] || ''),
      end: allDay ? '' : (stamps[1] || ''),
      allDay,
      title: str(raw.title),
      info,
      building: roomMatch ? roomMatch[1].trim() : location,
      room: roomMatch ? roomMatch[2].trim() : '',
      special: raw.filter === 'special'
    };
  }

  function cleanEvents(raw) {
    if (!Array.isArray(raw)) return null;
    const year = new Date().getFullYear();
    const seen = new Set();
    return raw.filter(isObject).map(item => {
      const source = item.date === undefined && (item.mon !== undefined || item.day !== undefined)
        ? convertLegacyEvent(item, year)
        : item;
      if (!source) return null;
      const ev = cleanObject(source, EVENT_TEMPLATE);
      if (!parseISO(ev.date)) return null;
      ev.start = TIME_RE.test(ev.start) ? ev.start : '';
      ev.end = TIME_RE.test(ev.end) && ev.start && ev.end > ev.start ? ev.end : '';
      if (ev.allDay) { ev.start = ''; ev.end = ''; }
      if (!ev.id || seen.has(ev.id)) ev.id = uniqueId('ev');
      seen.add(ev.id);
      return ev;
    }).filter(Boolean);
  }

  // ---------------------------------------------------------------- helpers
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function str(value, fallback) {
    if (typeof value === 'string') return value;
    if (value === undefined || value === null) return fallback === undefined ? '' : fallback;
    return String(value);
  }

  // Keep only the fields named in `template`, coerced to the template's types.
  function cleanObject(raw, template) {
    const src = isObject(raw) ? raw : {};
    const out = {};
    Object.keys(template).forEach(key => {
      if (typeof template[key] === 'boolean') {
        out[key] = src[key] === undefined ? template[key] : !!src[key];
      } else {
        out[key] = str(src[key], template[key]);
      }
    });
    return out;
  }

  function cleanList(raw, template) {
    if (!Array.isArray(raw)) return null;
    return raw.filter(isObject).map(item => cleanObject(item, template));
  }

  function cleanStringList(raw) {
    if (!Array.isArray(raw)) return null;
    return raw
      .map(item => str(item).trim())
      .filter(Boolean);
  }

  function uniqueId(prefix) {
    return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }

  // ------------------------------------------------------------ sanitizing
  /**
   * Turn untrusted data (localStorage, imported file) into a fully valid
   * content object. Any key that is missing or malformed falls back to the
   * matching value in `defaults`.
   */
  function sanitize(raw, defaults) {
    const src = isObject(raw) ? raw : {};
    const out = {};

    // Flyers
    const flyers = cleanList(src.flyers, { badge: '', title: '', lead: '', tag1: '', tag2: '', theme: 'ocean', image: '' });
    out.flyers = flyers
      ? flyers.map(f => Object.assign(f, { theme: FLYER_THEMES[f.theme] ? f.theme : 'ocean', image: cleanImage(f.image) }))
      : clone(defaults.flyers);

    // Today in Ka Lama schedule
    out.today = cleanList(src.today, { time: '', title: '', sub: '' }) || clone(defaults.today);

    // News ticker
    out.ticker = cleanStringList(src.ticker) || clone(defaults.ticker);

    // Menu banner and featured event
    out.banner = isObject(src.banner)
      ? cleanObject(src.banner, defaults.banner)
      : clone(defaults.banner);
    out.featuredEvent = isObject(src.featuredEvent)
      ? cleanObject(src.featuredEvent, defaults.featuredEvent)
      : clone(defaults.featuredEvent);
    out.menuBannerVisible = src.menuBannerVisible === undefined
      ? defaults.menuBannerVisible
      : !!src.menuBannerVisible;

    // Events (calendar entries; older saved events are converted automatically)
    out.events = cleanEvents(src.events) || cleanEvents(defaults.events) || [];

    // Programs (the four program tabs are fixed; their contents are editable)
    out.programs = {};
    Object.keys(defaults.programs).forEach(key => {
      const rawProg = isObject(src.programs) ? src.programs[key] : null;
      if (!isObject(rawProg)) {
        out.programs[key] = clone(defaults.programs[key]);
        return;
      }
      const base = defaults.programs[key];
      out.programs[key] = {
        title: str(rawProg.title, base.title),
        tagline: str(rawProg.tagline, base.tagline),
        desc: str(rawProg.desc, base.desc),
        degrees: cleanList(rawProg.degrees, { code: '', name: '' }) || clone(base.degrees),
        careers: cleanStringList(rawProg.careers) || clone(base.careers),
        advisor: str(rawProg.advisor, base.advisor),
        email: str(rawProg.email, base.email)
      };
    });

    // Directory contacts (faculty / staff per room)
    const contacts = cleanList(src.contacts, { room: '', name: '', email: '' });
    out.contacts = contacts
      ? contacts.filter(c => c.room.trim() && c.name.trim()).map(c => Object.assign(c, { email: c.email.trim() }))
      : clone(defaults.contacts);

    // Main-menu tiles
    const validViews = new Set(VIEWS.map(v => v.id));
    const tiles = cleanList(src.menuTiles, {
      id: '', type: 'view', view: 'view-programs', title: '', subtitle: '', icon: 'info', body: '', hidden: false, image: null
    });
    const defaultTileImage = {};
    (defaults.menuTiles || []).forEach(t => { defaultTileImage[t.id] = t.image || ''; });
    if (tiles) {
      const seen = new Set();
      out.menuTiles = tiles
        .map(t => {
          t.type = t.type === 'custom' ? 'custom' : 'view';
          t.icon = ICONS[t.icon] ? t.icon : 'info';
          // Tiles saved before photos existed get their default photo back
          t.image = t.image === null ? (defaultTileImage[t.id] || '') : cleanImage(t.image);
          t.view = t.type === 'custom' ? 'view-custom' : t.view;
          if (!t.id || seen.has(t.id)) t.id = uniqueId('tile');
          seen.add(t.id);
          return t;
        })
        .filter(t => t.type === 'custom' || validViews.has(t.view));
      // If every saved tile was unusable, the data is damaged: use the defaults
      if (tiles.length > 0 && out.menuTiles.length === 0) out.menuTiles = clone(defaults.menuTiles);
    } else {
      out.menuTiles = clone(defaults.menuTiles);
    }

    // Attract-screen widget order / visibility
    const widgets = cleanList(src.attractWidgets, { id: '', visible: true });
    if (widgets) {
      const seen = new Set();
      out.attractWidgets = widgets.filter(w => {
        if (!ATTRACT_WIDGET_IDS.includes(w.id) || seen.has(w.id)) return false;
        seen.add(w.id);
        return true;
      });
      ATTRACT_WIDGET_IDS.forEach(id => {
        if (!out.attractWidgets.some(w => w.id === id)) out.attractWidgets.push({ id, visible: true });
      });
    } else {
      out.attractWidgets = clone(defaults.attractWidgets);
    }

    // Who last edited, and when
    out.meta = cleanObject(src.meta, { updatedBy: '', updatedAt: '' });

    return out;
  }

  // ------------------------------------------------------------ persistence
  function load(defaults) {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) return sanitize(JSON.parse(saved), defaults);
    } catch (err) {
      console.warn('Kiosk content could not be loaded; using defaults.', err);
    }
    return sanitize({}, defaults);
  }

  function save(content) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
      return true;
    } catch (err) {
      console.warn('Kiosk content could not be saved.', err);
      return false;
    }
  }

  function reset() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('Kiosk content could not be reset.', err);
    }
  }

  function hasSavedEdits() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) !== null;
    } catch (err) {
      return false;
    }
  }

  // ---------------------------------------------------------- export/import
  function exportJSON(content) {
    return JSON.stringify({
      format: EXPORT_FORMAT,
      version: 1,
      exportedAt: new Date().toISOString(),
      content
    }, null, 2);
  }

  function importJSON(text, defaults) {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      throw new Error('That file is not valid JSON.');
    }
    const payload = isObject(parsed) && parsed.format === EXPORT_FORMAT ? parsed.content : parsed;
    if (!isObject(payload)) {
      throw new Error('That file does not look like a kiosk backup.');
    }
    return sanitize(payload, defaults);
  }

  window.KioskStore = {
    VIEWS,
    FLYER_THEMES,
    ICONS,
    ATTRACT_WIDGET_IDS,
    EVENT_FILTERS,
    MONTH_NAMES,
    IMAGES,
    clone,
    uniqueId,
    isoDate,
    parseISO,
    todayISO,
    addDaysISO,
    longDate,
    formatTime12,
    eventTimeText,
    eventLocationText,
    eventMonthDay,
    sortEvents,
    eventsFor,
    sanitize,
    load,
    save,
    reset,
    hasSavedEdits,
    exportJSON,
    importJSON,
    iconSvg(key, size) {
      const icon = ICONS[key] || ICONS.info;
      const px = size || 34;
      return `<svg width="${px}" height="${px}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${icon.paths}</svg>`;
    }
  };
})();
