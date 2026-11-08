/**
 * UHMC Ka Lama Kiosk — Admin panel
 *
 * How to open it (on the kiosk itself): press and hold the "UHMC" badge in the
 * top-left corner for about 1.5 seconds. (On a desktop you can also press
 * Ctrl + Shift + A.)
 *
 * Sign-in: staff type their email address. Only addresses listed in
 * approved-emails.js (edited through GitHub) are let in. This check runs in the
 * browser, so it keeps casual users out but is NOT strong security.
 *
 * Edits are applied to the kiosk immediately and saved in this browser's
 * localStorage (see content-store.js). The panel only talks to the kiosk through
 * window.KioskApp (defined at the bottom of app.js).
 */
(function () {
  'use strict';

  const LONG_PRESS_MS = 1500;
  const SESSION_MS = 5 * 60 * 1000;     // sign out after 5 minutes without a touch
  const MAX_FAILED_LOGINS = 5;
  const LOCKOUT_MS = 60 * 1000;
  const SAVE_DELAY_MS = 350;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const TABS = [
    { id: 'events', label: 'Events' },
    { id: 'flyers', label: 'Flyers' },
    { id: 'ticker', label: 'News bar' },
    { id: 'classes', label: 'Classes' },
    { id: 'people', label: 'People' },
    { id: 'layout', label: 'Layout' },
    { id: 'backup', label: 'Backup' }
  ];

  const ATTRACT_WIDGET_LABELS = {
    slideshow: 'Flyer slideshow',
    today: 'Today in Ka Lama (class schedule)',
    job: 'Featured job card',
    ticker: 'News bar (scrolling text)'
  };

  const KEYBOARD_ROWS = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '⌫'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '@'],
    ['⇧', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'],
    ['-', '_', '/', ':', 'SPACE', '.com', '.edu', '↵']
  ];

  // ------------------------------------------------------------------ state
  let overlay, loginBox, panelBox, panelHeader, tabBar, bodyEl, statusEl, kbdDock, kbdToggleBtn;
  let emailInput, loginErrorEl;
  let session = null;          // { email } while someone is signed in
  let draft = null;            // working copy of the content being edited
  let activeTab = 'events';
  let activeProgram = 'business';
  let contactQuery = '';
  let lastField = null;        // text field the on-screen keyboard types into
  let shiftOn = false;
  let kbdVisible = false;
  let failedLogins = 0;
  let lockedUntil = 0;
  let saveTimer = null;
  let sessionTimer = null;
  let pressTimer = null;

  // ---------------------------------------------------------------- helpers
  function h(tag, props) {
    const el = document.createElement(tag);
    Object.entries(props || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === false) return;
      if (key === 'class') el.className = value;
      else if (key === 'text') el.textContent = value;
      else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2), value);
      else el.setAttribute(key, value === true ? '' : value);
    });
    for (let i = 2; i < arguments.length; i++) {
      [arguments[i]].flat(Infinity).forEach(child => {
        if (child === undefined || child === null || child === false) return;
        el.append(child.nodeType ? child : document.createTextNode(String(child)));
      });
    }
    return el;
  }

  function truncate(text, max) {
    const value = String(text || '').replace(/\s+/g, ' ').trim();
    return value.length > max ? `${value.slice(0, max - 1)}…` : value;
  }

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  // ----------------------------------------------------------- field widgets
  function textField(label, obj, key, opts) {
    const o = opts || {};
    const input = o.multiline
      ? h('textarea', { class: 'adm-input', rows: o.rows || 3 })
      : h('input', { class: 'adm-input', type: 'text' });
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('spellcheck', 'false');
    if (o.placeholder) input.setAttribute('placeholder', o.placeholder);
    input.value = obj[key] === undefined || obj[key] === null ? '' : obj[key];
    input.addEventListener('input', () => {
      obj[key] = input.value;
      if (o.onInput) o.onInput(input.value);
      scheduleSave();
    });
    return h('label', { class: `adm-field${o.grow ? ' grow' : ''}` },
      h('span', { class: 'adm-label', text: label }), input);
  }

  function selectField(label, options, get, set, opts) {
    const o = opts || {};
    const select = h('select', { class: 'adm-input' });
    const current = get();
    const known = options.some(opt => opt.value === current);
    (known ? options : options.concat([{ value: current, label: current || '(none)' }])).forEach(opt => {
      select.append(h('option', { value: opt.value, text: opt.label }));
    });
    select.value = current;
    select.addEventListener('change', () => {
      set(select.value);
      if (o.onChange) o.onChange(select.value);
      scheduleSave();
    });
    return h('label', { class: `adm-field${o.grow ? ' grow' : ''}` },
      h('span', { class: 'adm-label', text: label }), select);
  }

  function checkField(label, obj, key, opts) {
    const o = opts || {};
    const box = h('input', { type: 'checkbox', class: 'adm-check-box' });
    box.checked = o.invert ? !obj[key] : !!obj[key];
    box.addEventListener('change', () => {
      obj[key] = o.invert ? !box.checked : box.checked;
      scheduleSave();
    });
    return h('label', { class: 'adm-check' }, box, h('span', { text: label }));
  }

  function button(label, onClick, cls) {
    return h('button', { type: 'button', class: `adm-btn ${cls || ''}`, text: label, onclick: onClick });
  }

  // A button that needs two taps (so a stray touch can't delete things).
  function confirmButton(label, confirmLabel, action, cls) {
    let timer = null;
    const btn = h('button', { type: 'button', class: `adm-btn ${cls || ''}`, text: label });
    btn.addEventListener('click', () => {
      if (btn.classList.contains('armed')) {
        clearTimeout(timer);
        action();
        return;
      }
      btn.classList.add('armed');
      btn.textContent = confirmLabel;
      timer = setTimeout(() => {
        btn.classList.remove('armed');
        btn.textContent = label;
      }, 3500);
    });
    return btn;
  }

  function row() {
    return h('div', { class: 'adm-row' }, [].slice.call(arguments));
  }

  function section(title, hint) {
    const kids = [].slice.call(arguments, 2);
    return h('section', { class: 'adm-section' },
      h('h3', { class: 'adm-h3', text: title }),
      hint ? h('p', { class: 'adm-hint', text: hint }) : null,
      kids);
  }

  /**
   * Editable list with add / delete / move up / move down.
   * cfg: titleOf(item, i), renderItem(item, i, refreshTitle, redraw), adds: [{label, make}],
   *      movable (default true), removable (default true), max, filter(item, i)
   */
  function listEditor(arr, cfg) {
    const wrap = h('div', { class: 'adm-list' });
    const movable = cfg.movable !== false;
    const removable = cfg.removable !== false;

    function move(i, delta) {
      const j = i + delta;
      if (j < 0 || j >= arr.length) return;
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
      commitNow();
      redraw();
    }

    function redraw() {
      wrap.replaceChildren();
      let shown = 0;
      arr.forEach((item, i) => {
        if (cfg.filter && !cfg.filter(item, i)) return;
        shown++;
        const titleEl = h('span', { class: 'adm-card-title' });
        const refreshTitle = () => {
          titleEl.textContent = `${i + 1}. ${cfg.titleOf(arr[i], i) || '(untitled)'}`;
        };
        refreshTitle();
        const actions = h('div', { class: 'adm-card-actions' },
          movable ? h('button', { type: 'button', class: 'adm-icon-btn', 'aria-label': 'Move up', text: '▲', disabled: i === 0, onclick: () => move(i, -1) }) : null,
          movable ? h('button', { type: 'button', class: 'adm-icon-btn', 'aria-label': 'Move down', text: '▼', disabled: i === arr.length - 1, onclick: () => move(i, 1) }) : null,
          removable ? confirmButton('✕', 'Delete?', () => {
            arr.splice(i, 1);
            commitNow();
            redraw();
          }, 'adm-icon-btn danger') : null);
        wrap.append(h('div', { class: 'adm-card' },
          h('div', { class: 'adm-card-head' }, titleEl, actions),
          h('div', { class: 'adm-card-body' }, cfg.renderItem(item, i, refreshTitle, redraw))));
      });
      if (shown === 0) {
        wrap.append(h('p', { class: 'adm-empty', text: cfg.filter && arr.length ? 'Nothing matches your search.' : 'Nothing here yet.' }));
      }
      const adds = (cfg.adds || []).filter(() => !cfg.max || arr.length < cfg.max);
      if (adds.length) {
        wrap.append(h('div', { class: 'adm-add-row' }, adds.map(add => button(add.label, () => {
          arr.push(add.make());
          commitNow();
          redraw();
          const cards = wrap.querySelectorAll('.adm-card');
          const last = cards[cards.length - 1];
          if (last) last.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }, 'add'))));
      } else if (cfg.max && arr.length >= cfg.max) {
        wrap.append(h('p', { class: 'adm-hint', text: `Limit reached (${cfg.max}).` }));
      }
      applyInputMode();
    }

    wrap.redraw = redraw;
    redraw();
    return wrap;
  }

  // ----------------------------------------------------------------- saving
  function setStatus(kind, text) {
    if (!statusEl) return;
    statusEl.className = `adm-status ${kind}`;
    statusEl.textContent = text;
  }

  function scheduleSave() {
    if (!session) return;
    setStatus('pending', 'Saving…');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(commitNow, SAVE_DELAY_MS);
  }

  function commitNow() {
    clearTimeout(saveTimer);
    saveTimer = null;
    if (!session || !draft) return;
    draft.meta = { updatedBy: session.email, updatedAt: new Date().toISOString() };
    const saved = window.KioskApp.applyContent(draft);
    if (saved) setStatus('ok', `Saved ${formatTime(new Date())}`);
    else setStatus('error', 'Shown on kiosk, but this browser would not save it');
  }

  // ------------------------------------------------------------------ tabs
  function eventsTab() {
    const todayMonth = new Date().toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const todayDay = String(new Date().getDate()).padStart(2, '0');
    const filterOptions = [
      { value: 'week', label: 'This Week' },
      { value: 'month', label: 'This Month' },
      { value: 'special', label: 'Special Occasions' }
    ];

    return h('div', null,
      section('Featured announcement', 'The gold banner at the top of the Main Menu.',
        checkField('Show this banner on the Main Menu', draft, 'menuBannerVisible'),
        textField('Badge', draft.banner, 'badge'),
        textField('Headline', draft.banner, 'title'),
        textField('Details', draft.banner, 'body', { multiline: true })),

      section('Featured event', 'The large event card at the top of the Events & News page.',
        textField('Flyer badge', draft.featuredEvent, 'artBadge'),
        textField('Flyer title', draft.featuredEvent, 'artTitle'),
        textField('Flyer text', draft.featuredEvent, 'artText', { multiline: true, rows: 2 }),
        textField('Category tag', draft.featuredEvent, 'tag'),
        textField('Event name', draft.featuredEvent, 'title'),
        row(
          textField('Date', draft.featuredEvent, 'date', { grow: true }),
          textField('Time', draft.featuredEvent, 'time', { grow: true })),
        textField('Location', draft.featuredEvent, 'location'),
        textField('Summary', draft.featuredEvent, 'summary', { multiline: true })),

      section('Event list', 'Shown on the Events & News page, under This Week / This Month / Special Occasions.',
        listEditor(draft.events, {
          titleOf: ev => `${ev.mon} ${ev.day} · ${ev.title}`,
          renderItem: (ev, i, refresh) => [
            selectField('Show under', filterOptions, () => ev.filter, v => { ev.filter = v; }),
            row(
              textField('Month (e.g. NOV)', ev, 'mon', { onInput: refresh, grow: true }),
              textField('Day', ev, 'day', { onInput: refresh, grow: true })),
            textField('Event name', ev, 'title', { onInput: refresh }),
            textField('Time', ev, 'time'),
            textField('Location', ev, 'location')
          ],
          adds: [{
            label: '+ Add event',
            make: () => ({ filter: 'week', mon: todayMonth, day: todayDay, title: 'New event', time: '', location: '', desc: '' })
          }]
        })));
  }

  function flyersTab() {
    const themeOptions = Object.entries(KioskStore.FLYER_THEMES).map(([value, theme]) => ({ value, label: theme.label }));
    return h('div', null,
      section('Attract-screen flyers', 'These rotate in the big slideshow on the idle screen (up to 8).',
        listEditor(draft.flyers, {
          max: 8,
          titleOf: f => f.title,
          renderItem: (f, i, refresh) => [
            textField('Badge (small label)', f, 'badge'),
            textField('Title', f, 'title', { onInput: refresh }),
            textField('Tagline', f, 'lead'),
            row(
              textField('Gold tag 1', f, 'tag1', { grow: true }),
              textField('Gold tag 2', f, 'tag2', { grow: true })),
            selectField('Background color', themeOptions, () => f.theme, v => { f.theme = v; })
          ],
          adds: [{
            label: '+ Add flyer',
            make: () => ({ badge: 'Announcement', title: 'New flyer', lead: '', tag1: '', tag2: '', theme: 'ocean' })
          }]
        })));
  }

  function tickerTab() {
    return h('div', null,
      section('News bar', 'The scrolling text along the bottom of the attract screen. Messages scroll in this order.',
        listEditor(draft.ticker, {
          titleOf: message => truncate(message, 44),
          renderItem: (message, i, refresh) => textField('Message', draft.ticker, i, { onInput: refresh, multiline: true, rows: 2 }),
          adds: [{ label: '+ Add message', make: () => 'New message' }]
        })));
  }

  function classesTab() {
    const prog = draft.programs[activeProgram];
    const programButtons = h('div', { class: 'adm-pills' }, Object.keys(draft.programs).map(key =>
      h('button', {
        type: 'button',
        class: `adm-pill${key === activeProgram ? ' active' : ''}`,
        text: truncate(draft.programs[key].title, 22),
        onclick: () => {
          activeProgram = key;
          renderBody();
        }
      })));

    return h('div', null,
      section('Today in Ka Lama', 'The class / event schedule card on the attract screen.',
        listEditor(draft.today, {
          titleOf: item => `${item.time} · ${item.title}`,
          renderItem: (item, i, refresh) => [
            row(
              textField('Time', item, 'time', { onInput: refresh, grow: true }),
              textField('Room / place', item, 'sub', { grow: true })),
            textField('Class or event name', item, 'title', { onInput: refresh })
          ],
          adds: [{ label: '+ Add class', make: () => ({ time: '', title: 'New class', sub: '' }) }]
        })),

      section('Programs & degrees', 'Pick a program, then edit what students see on the Business Programs screen. (Advisor names and emails are on the People tab.)',
        programButtons,
        textField('Program title', prog, 'title'),
        textField('Tagline', prog, 'tagline'),
        textField('Description', prog, 'desc', { multiline: true, rows: 5 }),
        h('h4', { class: 'adm-h4', text: 'Degrees & certificates' }),
        listEditor(prog.degrees, {
          titleOf: d => `[${d.code}] ${truncate(d.name, 34)}`,
          renderItem: (d, i, refresh) => [
            textField('Code (AAS, AS, CA, CO, BAS…)', d, 'code', { onInput: refresh }),
            textField('Full name', d, 'name', { onInput: refresh })
          ],
          adds: [{ label: '+ Add degree', make: () => ({ code: 'CO', name: 'New certificate' }) }]
        }),
        h('h4', { class: 'adm-h4', text: 'Career paths' }),
        listEditor(prog.careers, {
          titleOf: career => career,
          renderItem: (career, i, refresh) => textField('Career', prog.careers, i, { onInput: refresh }),
          adds: [{ label: '+ Add career', make: () => 'New career' }]
        })));
  }

  function peopleTab() {
    const rooms = window.KioskApp.getRooms();
    const roomOptions = rooms.map(r => ({ value: r.room, label: `${r.room} · Floor ${r.floor}` }));

    const searchInput = h('input', { class: 'adm-input', type: 'text', placeholder: 'Search name, room or email' });
    searchInput.setAttribute('autocomplete', 'off');
    searchInput.value = contactQuery;

    const contactList = listEditor(draft.contacts, {
      movable: false,
      filter: c => !contactQuery || `${c.room} ${c.name} ${c.email}`.toLowerCase().includes(contactQuery),
      titleOf: c => `${c.room} · ${c.name || '(new contact — enter a name)'}`,
      renderItem: (c, i, refresh) => [
        selectField('Room', roomOptions, () => c.room, v => { c.room = v; }, { onChange: refresh }),
        textField('Name / title', c, 'name', { onInput: refresh }),
        textField('Email', c, 'email', { placeholder: 'name@hawaii.edu' })
      ],
      adds: [{
        label: '+ Add contact',
        make: () => ({ room: rooms.length ? rooms[0].room : 'KL-101', name: '', email: '' })
      }]
    });
    searchInput.addEventListener('input', () => {
      contactQuery = searchInput.value.trim().toLowerCase();
      contactList.redraw();
    });

    const advisorCards = Object.keys(draft.programs).map(key => {
      const prog = draft.programs[key];
      return h('div', { class: 'adm-card' },
        h('div', { class: 'adm-card-head' }, h('span', { class: 'adm-card-title', text: prog.title })),
        h('div', { class: 'adm-card-body' },
          textField('Advisor line (shown on the program screen)', prog, 'advisor'),
          textField('Advisor email', prog, 'email', { placeholder: 'name@hawaii.edu' })));
    });

    return h('div', null,
      section('Program advisors', 'Name and email shown on each Business Programs screen.', advisorCards),
      section('Directory contacts', 'Faculty and staff shown in the Building Directory. Emails appear under the name and are searchable.',
        h('label', { class: 'adm-field' }, h('span', { class: 'adm-label', text: 'Find a contact' }), searchInput),
        contactList));
  }

  function layoutTab() {
    const screenOptions = KioskStore.VIEWS.map(v => ({ value: v.id, label: v.label }))
      .concat([{ value: 'custom', label: 'Custom info page (you write the text)' }]);
    const iconOptions = Object.entries(KioskStore.ICONS).map(([value, icon]) => ({ value, label: icon.label }));

    const unusedView = () => {
      const used = new Set(draft.menuTiles.filter(t => t.type === 'view').map(t => t.view));
      const free = KioskStore.VIEWS.find(v => !used.has(v.id)) || KioskStore.VIEWS[0];
      return free;
    };

    return h('div', null,
      section('Main Menu tiles', 'Add, remove, hide and reorder the tiles on the Main Menu. Use ▲ ▼ to change the order.',
        listEditor(draft.menuTiles, {
          titleOf: t => `${t.title}${t.hidden ? ' (hidden)' : ''}`,
          renderItem: (t, i, refresh, redraw) => [
            checkField('Show on the Main Menu', t, 'hidden', { invert: true }),
            textField('Tile title', t, 'title', { onInput: refresh }),
            textField('Small text under the title', t, 'subtitle'),
            selectField('Icon', iconOptions, () => t.icon, v => { t.icon = v; }),
            selectField('Opens', screenOptions,
              () => (t.type === 'custom' ? 'custom' : t.view),
              v => {
                if (v === 'custom') { t.type = 'custom'; t.view = 'view-custom'; }
                else { t.type = 'view'; t.view = v; }
              },
              { onChange: () => redraw() }),
            t.type === 'custom'
              ? textField('Page text (blank line = new paragraph)', t, 'body', { multiline: true, rows: 6 })
              : null
          ],
          adds: [
            {
              label: '+ Add screen shortcut',
              make: () => {
                const view = unusedView();
                return { id: KioskStore.uniqueId('tile'), type: 'view', view: view.id, title: view.label, subtitle: '', icon: 'info', body: '', hidden: false };
              }
            },
            {
              label: '+ Add info page',
              make: () => ({ id: KioskStore.uniqueId('tile'), type: 'custom', view: 'view-custom', title: 'New page', subtitle: 'Tap to read more', icon: 'info', body: 'Write your information here.', hidden: false })
            }
          ]
        })),

      section('Attract screen widgets', "Show, hide and reorder the cards on the idle screen. The \"Touch anywhere to begin\" bar always stays at the bottom.",
        listEditor(draft.attractWidgets, {
          removable: false,
          titleOf: w => ATTRACT_WIDGET_LABELS[w.id] || w.id,
          renderItem: w => checkField('Show on the attract screen', w, 'visible')
        })),

      section('Main Menu banner', null,
        checkField('Show the featured announcement banner', draft, 'menuBannerVisible'),
        h('p', { class: 'adm-hint', text: 'Edit the banner text on the Events tab.' })));
  }

  function backupTab() {
    const meta = draft.meta && draft.meta.updatedAt
      ? `Last edited by ${draft.meta.updatedBy || 'unknown'} on ${new Date(draft.meta.updatedAt).toLocaleString()}.`
      : 'No edits saved yet — the kiosk is showing its built-in defaults.';

    const messageEl = h('p', { class: 'adm-msg', role: 'status' });
    const showMessage = (text, isError) => {
      messageEl.textContent = text;
      messageEl.className = `adm-msg${isError ? ' error' : ' ok'}`;
    };

    const fileInput = h('input', { type: 'file', accept: 'application/json,.json', class: 'adm-file' });
    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const imported = KioskStore.importJSON(String(reader.result), window.KioskApp.getDefaults());
          draft = imported;
          commitNow();
          renderBody('Backup imported and applied to the kiosk.');
          return;
        } catch (err) {
          showMessage(err.message || 'That file could not be imported.', true);
        }
        fileInput.value = '';
      };
      reader.onerror = () => showMessage('That file could not be read.', true);
      reader.readAsText(file);
    });

    return h('div', null,
      section('Where your edits live', 'Edits are saved in this kiosk browser and are shown the next time it opens. They are lost if the browser\'s site data is cleared, if it runs in private mode, or on a different browser/device. Download a backup after big changes.',
        h('p', { class: 'adm-hint strong', text: meta })),
      section('Download a backup', 'Saves all of your edits to a .json file.',
        button('Download backup file', () => {
          commitNow();
          const text = KioskStore.exportJSON(window.KioskApp.getContent());
          const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
          const link = h('a', { href: url, download: `kiosk-backup-${new Date().toISOString().slice(0, 10)}.json` });
          document.body.append(link);
          link.click();
          link.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          showMessage('Backup downloaded.', false);
        }, 'primary')),
      section('Restore from a backup', 'Choose a .json file you downloaded earlier. This replaces the current edits.',
        fileInput),
      section('Start over', 'Removes every edit and goes back to the built-in defaults.',
        confirmButton('Reset everything to defaults', 'Tap again to erase all edits', () => {
          window.KioskApp.resetToDefaults();
          draft = window.KioskApp.getContent();
          setStatus('ok', 'Reset to defaults');
          showMessage('Everything was reset to the defaults.', false);
          renderBody(messageEl.textContent);
        }, 'danger')),
      messageEl);
  }

  // ------------------------------------------------------------- panel shell
  function renderBody(message) {
    bodyEl.replaceChildren();
    const builders = {
      events: eventsTab, flyers: flyersTab, ticker: tickerTab,
      classes: classesTab, people: peopleTab, layout: layoutTab, backup: backupTab
    };
    bodyEl.append(builders[activeTab]());
    if (message) {
      const note = bodyEl.querySelector('.adm-msg');
      if (note) { note.textContent = message; note.className = 'adm-msg ok'; }
    }
    tabBar.querySelectorAll('.adm-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === activeTab);
    });
    bodyEl.scrollTop = 0;
    applyInputMode();
  }

  function buildPanel() {
    statusEl = h('span', { class: 'adm-status ok', role: 'status', text: 'Ready' });
    kbdToggleBtn = h('button', {
      type: 'button', class: 'adm-btn small', text: '⌨ Keyboard', 'aria-pressed': String(kbdVisible),
      onclick: () => setKeyboardVisible(!kbdVisible)
    });
    panelHeader = h('div', { class: 'adm-panel-head' },
      h('div', { class: 'adm-head-top' },
        h('h2', { class: 'adm-title', text: 'Kiosk Admin' }),
        button('Sign out', () => closeAdmin(), 'small danger-outline')),
      h('div', { class: 'adm-head-sub' },
        h('span', { class: 'adm-who', text: session.email }),
        statusEl,
        kbdToggleBtn));
    tabBar = h('div', { class: 'adm-tabs', role: 'tablist' }, TABS.map(tab =>
      h('button', {
        type: 'button', class: 'adm-tab', role: 'tab', text: tab.label, 'data-tab': tab.id,
        onclick: () => { activeTab = tab.id; renderBody(); }
      })));
    bodyEl = h('div', { class: 'adm-body' });
    panelBox.replaceChildren(panelHeader, tabBar, bodyEl);
  }

  // -------------------------------------------------------------- keyboard
  function buildKeyboard() {
    kbdDock = h('div', { class: 'adm-kbd', 'aria-label': 'On-screen keyboard' });
    KEYBOARD_ROWS.forEach(keys => {
      kbdDock.append(h('div', { class: 'adm-kbd-row' }, keys.map(key => {
        const cls = ['adm-key'];
        if (key === 'SPACE') cls.push('space');
        if (['⌫', '⇧', '↵', '.com', '.edu'].includes(key)) cls.push('wide');
        const btn = h('button', { type: 'button', class: cls.join(' '), 'data-key': key, text: key === 'SPACE' ? 'space' : key });
        // Keep focus in the text field when a key is tapped
        btn.addEventListener('mousedown', e => e.preventDefault());
        btn.addEventListener('click', () => typeKey(key));
        return btn;
      })));
    });
  }

  function refreshKeyLabels() {
    kbdDock.querySelectorAll('.adm-key').forEach(btn => {
      const key = btn.dataset.key;
      if (key.length === 1 && /[a-z]/.test(key)) btn.textContent = shiftOn ? key.toUpperCase() : key;
      if (key === '⇧') btn.classList.toggle('active', shiftOn);
    });
  }

  function typeKey(key) {
    if (key === '⇧') {
      shiftOn = !shiftOn;
      refreshKeyLabels();
      return;
    }
    const el = lastField && document.contains(lastField) ? lastField : null;
    if (!el) return;
    el.focus({ preventScroll: true });

    if (key === '↵' && el.tagName !== 'TEXTAREA') {
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      return;
    }

    const start = el.selectionStart === null ? el.value.length : el.selectionStart;
    const end = el.selectionEnd === null ? el.value.length : el.selectionEnd;
    if (key === '⌫') {
      if (start !== end) el.setRangeText('', start, end, 'end');
      else if (start > 0) el.setRangeText('', start - 1, start, 'end');
    } else {
      let text = key;
      if (key === 'SPACE') text = ' ';
      else if (key === '↵') text = '\n';
      else if (shiftOn && key.length === 1) text = key.toUpperCase();
      el.setRangeText(text, start, end, 'end');
      if (shiftOn) {
        shiftOn = false;
        refreshKeyLabels();
      }
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function setKeyboardVisible(visible) {
    kbdVisible = visible;
    overlay.classList.toggle('kbd-open', visible);
    if (kbdToggleBtn) kbdToggleBtn.setAttribute('aria-pressed', String(visible));
    applyInputMode();
  }

  // On a touch kiosk the OS keyboard would cover the panel, so while our own
  // keyboard is showing we ask the browser not to open its keyboard.
  function applyInputMode() {
    if (!overlay) return;
    overlay.querySelectorAll('input[type="text"], textarea').forEach(el => {
      el.setAttribute('inputmode', kbdVisible ? 'none' : 'text');
    });
  }

  // ------------------------------------------------------------------ login
  function approvedEmails() {
    const raw = Array.isArray(window.KIOSK_APPROVED_EMAILS) ? window.KIOSK_APPROVED_EMAILS : [];
    // example.com is the placeholder in approved-emails.js, never a real login
    return raw
      .map(email => String(email).trim().toLowerCase())
      .filter(email => email && !email.endsWith('@example.com'));
  }

  function showLoginError(message) {
    loginErrorEl.textContent = message;
  }

  function attemptLogin() {
    const now = Date.now();
    if (now < lockedUntil) {
      showLoginError(`Too many attempts. Please wait ${Math.ceil((lockedUntil - now) / 1000)} seconds.`);
      return;
    }
    const approved = approvedEmails();
    if (approved.length === 0) {
      showLoginError('No approved emails are set up yet. Add yours to approved-emails.js in the GitHub repo.');
      return;
    }
    const email = emailInput.value.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      showLoginError('Please enter a valid email address.');
      return;
    }
    if (!approved.includes(email)) {
      failedLogins++;
      if (failedLogins >= MAX_FAILED_LOGINS) {
        failedLogins = 0;
        lockedUntil = now + LOCKOUT_MS;
        showLoginError('Too many attempts. Locked for 60 seconds.');
      } else {
        showLoginError("That email isn't on the approved list.");
      }
      return;
    }

    failedLogins = 0;
    session = { email };
    draft = window.KioskApp.getContent();
    activeTab = 'events';
    loginBox.hidden = true;
    panelBox.hidden = false;
    buildPanel();
    renderBody();
    touchSession();
  }

  function showLogin() {
    session = null;
    draft = null;
    panelBox.hidden = true;
    loginBox.hidden = false;
    emailInput.value = '';
    showLoginError('');
    applyInputMode();
    setTimeout(() => emailInput.focus({ preventScroll: true }), 50);
  }

  // ---------------------------------------------------------- open / close
  function openAdmin() {
    if (overlay.classList.contains('open')) return;
    window.KioskApp.setAdminOpen(true);
    overlay.classList.add('open');
    setKeyboardVisible(window.matchMedia('(pointer: coarse)').matches);
    showLogin();
  }

  function closeAdmin() {
    const wasSignedIn = !!session;
    if (wasSignedIn && saveTimer) commitNow(); // don't lose the last keystrokes
    clearTimeout(sessionTimer);
    session = null;
    draft = null;
    lastField = null;
    overlay.classList.remove('open');
    panelBox.replaceChildren();
    window.KioskApp.setAdminOpen(false);
    // After editing, land on the Main Menu so the changes are easy to check.
    // (Cancelling the sign-in leaves the kiosk exactly where it was.)
    if (wasSignedIn) window.KioskApp.goToMenu();
  }

  // Sign out automatically after 5 minutes without a touch or keypress
  function touchSession() {
    clearTimeout(sessionTimer);
    if (!session) return;
    sessionTimer = setTimeout(() => closeAdmin(), SESSION_MS);
  }

  // ------------------------------------------------------------------ setup
  function buildOverlay() {
    emailInput = h('input', { class: 'adm-input big', type: 'text', placeholder: 'you@hawaii.edu', id: 'adm-email' });
    emailInput.setAttribute('autocomplete', 'off');
    emailInput.setAttribute('autocapitalize', 'none');
    emailInput.setAttribute('spellcheck', 'false');
    emailInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') attemptLogin();
    });
    loginErrorEl = h('p', { class: 'adm-error', role: 'alert' });

    loginBox = h('div', { class: 'adm-login' },
      h('h2', { class: 'adm-title', text: 'Admin sign-in' }),
      h('p', { class: 'adm-hint', text: 'Enter your approved staff email address.' }),
      h('label', { class: 'adm-field' }, h('span', { class: 'adm-label', text: 'Email' }), emailInput),
      loginErrorEl,
      h('div', { class: 'adm-login-actions' },
        button('Cancel', () => closeAdmin(), 'ghost'),
        button('Sign in', attemptLogin, 'primary')));

    panelBox = h('div', { class: 'adm-panel' });
    panelBox.hidden = true;

    buildKeyboard();

    overlay = h('div', { id: 'admin-overlay', class: 'adm-overlay', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Kiosk admin' },
      h('div', { class: 'adm-main' }, loginBox, panelBox),
      kbdDock);

    overlay.addEventListener('focusin', e => {
      if (e.target.matches('input[type="text"], textarea')) lastField = e.target;
    });
    ['pointerdown', 'keydown'].forEach(evt => overlay.addEventListener(evt, touchSession, true));

    document.getElementById('kiosk-app').append(overlay);
  }

  function setupTriggers() {
    // Press and hold the UHMC badge to open the admin panel
    const logo = document.getElementById('header-logo-badge');
    if (logo) {
      const start = () => {
        clearTimeout(pressTimer);
        pressTimer = setTimeout(openAdmin, LONG_PRESS_MS);
      };
      const cancel = () => clearTimeout(pressTimer);
      logo.addEventListener('pointerdown', start);
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(evt => logo.addEventListener(evt, cancel));
      logo.addEventListener('contextmenu', e => e.preventDefault());
    }
    // Desktop shortcut
    window.addEventListener('keydown', e => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        openAdmin();
      }
    });
  }

  // app.js defines window.KioskApp inside its own DOMContentLoaded handler,
  // which runs before this one because it was registered first.
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.KioskApp) {
      console.warn('Admin panel not started: KioskApp is missing.');
      return;
    }
    buildOverlay();
    setupTriggers();
    window.KioskAdmin = { open: openAdmin, close: closeAdmin };
  });
})();
