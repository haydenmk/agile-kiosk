/**
 * UHMC Business Department — Ka Lama Interactive Kiosk Controller
 * Powering all 8 wireframe screens from UHMC Kiosk Lo-Fi Wireframes.pdf
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- APPLICATION STATE ---
  const state = {
    currentView: 'view-attract',
    activeFloor: 1,
    activeCategory: 'all',
    selectedRoom: 'KL-101',
    selectedProgram: 'business',
    selectedJobCategory: 'all',
    selectedJobIndex: 0,
    jobPage: 1,
    jobsPerPage: 3,
    activeEventFilter: 'week',
    surveyStep: 1,
    surveySelectedOptions: new Set(),
    idleSecondsRemaining: 60,
    idleThreshold: 60,
    isIdle: true,
    mapZoom: 1,
    surveyVotes: {
      "Food Trucks & Social Events": 54,
      "Industry Mentorship Nights": 42,
      "24/7 Study Lounge & Coffee": 58,
      "Tech Certification Workshops": 49,
      "Intramural Sports & Fitness": 27,
      "Student Venture Funding": 35
    }
  };

  // --- MOCK DATA: KA LAMA DIRECTORY ---
  const directoryData = [
    // 1st Floor
    {
      floor: 1,
      room: "KL-101",
      name: "Business Dept. Main Office",
      category: "offices",
      catLabel: "Offices",
      desc: "Faculty advising, student support, and department chair office.",
      x: 35, y: 25, w: 90, h: 55,
      path: "M 45 130 L 45 90 L 80 90 L 80 80"
    },
    {
      floor: 1,
      room: "KL-102",
      name: "Lecture Hall & Presentation Room",
      category: "classrooms",
      catLabel: "Classrooms",
      desc: "Tiered seating for 60 students, dual projection, lecture captures.",
      x: 135, y: 25, w: 90, h: 55,
      path: "M 45 130 L 45 90 L 180 90 L 180 80"
    },
    {
      floor: 1,
      room: "KL-103",
      name: "Collaborative Study Pods",
      category: "classrooms",
      catLabel: "Classrooms",
      desc: "Whiteboards, display monitors, and group project workstations.",
      x: 235, y: 25, w: 90, h: 55,
      path: "M 45 130 L 45 90 L 280 90 L 280 80"
    },
    {
      floor: 1,
      room: "KL-104",
      name: "Student Lounge & Water Station",
      category: "restrooms",
      catLabel: "Restrooms",
      desc: "Filtered water refill, microwave, charging ports, vending.",
      x: 335, y: 25, w: 85, h: 55,
      path: "M 45 130 L 45 90 L 377 90 L 377 80"
    },
    {
      floor: 1,
      room: "KL-105",
      name: "First Floor Restrooms",
      category: "restrooms",
      catLabel: "Restrooms",
      desc: "ADA accessible restrooms (All-gender & family accessible).",
      x: 335, y: 105, w: 85, h: 45,
      path: "M 45 130 L 45 90 L 377 90 L 377 105"
    },
    {
      floor: 1,
      room: "KL-ELEV",
      name: "Elevator & Central Stairs",
      category: "elevator",
      catLabel: "Elevator & Stairs",
      desc: "Direct access to 2nd Floor faculty offices, computer labs & ABIT hub.",
      x: 135, y: 105, w: 85, h: 45,
      path: "M 45 130 L 45 90 L 177 90 L 177 105"
    },

    // 2nd Floor
    {
      floor: 2,
      room: "KL-201",
      name: "Open Computer Lab & Printing",
      category: "labs",
      catLabel: "Labs",
      desc: "32 workstations with Adobe CC, Microsoft Office & accounting software.",
      x: 35, y: 25, w: 90, h: 55,
      path: "M 177 110 L 177 90 L 80 90 L 80 80"
    },
    {
      floor: 2,
      room: "KL-202",
      name: "ABIT Cyber & Tech Venture Hub",
      category: "labs",
      catLabel: "Labs",
      desc: "Software dev pods, hardware test benches, and senior capstone workstations.",
      x: 135, y: 25, w: 90, h: 55,
      path: "M 177 110 L 177 90 L 180 90 L 180 80"
    },
    {
      floor: 2,
      room: "KL-203",
      name: "Faculty Offices & Advising",
      category: "offices",
      catLabel: "Offices",
      desc: "Offices for Business, Accounting, and HOST faculty advisors.",
      x: 235, y: 25, w: 90, h: 55,
      path: "M 177 110 L 177 90 L 280 90 L 280 80"
    },
    {
      floor: 2,
      room: "KL-204",
      name: "Hospitality & Resort Simulation Lab",
      category: "classrooms",
      catLabel: "Classrooms",
      desc: "Front-desk PMS software, concierge simulations, and meeting planning.",
      x: 335, y: 25, w: 85, h: 55,
      path: "M 177 110 L 177 90 L 377 90 L 377 80"
    },
    {
      floor: 2,
      room: "KL-205",
      name: "Department Conference Room",
      category: "offices",
      catLabel: "Offices",
      desc: "Executive conference room, faculty senate, and committee hearings.",
      x: 235, y: 105, w: 90, h: 45,
      path: "M 177 110 L 177 90 L 280 90 L 280 105"
    },
    {
      floor: 2,
      room: "KL-ELEV-2",
      name: "Elevator & 2nd Floor Lobby",
      category: "elevator",
      catLabel: "Elevator & Stairs",
      desc: "Elevator and open stairwell connection to Ground Floor.",
      x: 135, y: 105, w: 85, h: 45,
      path: "M 177 110 L 177 105"
    }
  ];

  // --- MOCK DATA: ACADEMIC PROGRAMS ---
  const programsData = {
    business: {
      title: "Business Administration",
      tagline: "Empowering island business leaders, entrepreneurs, and managers.",
      desc: "Develop foundational expertise in management, marketing, financial analysis, business law, ethics, and operations. Articulates directly to 4-year business bachelor degrees across the University of Hawaiʻi system.",
      degrees: [
        { code: "AAS", name: "Associate in Applied Science in Business Administration" },
        { code: "CA", name: "Certificate of Achievement in Small Business Management" },
        { code: "CO", name: "Certificate of Competence in Business Marketing" }
      ],
      careers: ["Small Business Manager", "Marketing Coordinator", "Operations Lead", "Financial Specialist", "Store Director", "Island Entrepreneur"],
      advisor: "Advisor: Business Dept Faculty · Rm KL-203",
      email: "mauibus@hawaii.edu"
    },
    hospitality: {
      title: "Hospitality & Tourism (HOST)",
      tagline: "Launch a leadership career in Maui's world-renowned resort industry.",
      desc: "Co-developed with premier island resort general managers, this program blends authentic Hawaiian values, guest services excellence, revenue management, and luxury event operations with guaranteed resort internships.",
      degrees: [
        { code: "AS", name: "Associate in Science in Hospitality & Tourism Management" },
        { code: "CA", name: "Certificate of Achievement in Hospitality Operations" },
        { code: "CO", name: "Certificate of Competence in Guest Services & Front Desk" }
      ],
      careers: ["Resort Operations Manager", "Guest Experience Lead", "Event & Banquet Planner", "Concierge Director", "Food & Beverage Supervisor"],
      advisor: "Advisor: HOST Program Lead · Rm KL-204",
      email: "hostuhmc@hawaii.edu"
    },
    accounting: {
      title: "Accounting Program",
      tagline: "Essential financial expertise for Maui's corporate and public sectors.",
      desc: "Master industry-standard software (QuickBooks, Excel, TaxCalc) while building practical expertise in financial reporting, auditing, payroll compliance, and tax preparation. Includes annual student VITA tax clinic.",
      degrees: [
        { code: "AAS", name: "Associate in Applied Science in Accounting" },
        { code: "CA", name: "Certificate of Achievement in Payroll & Tax Practice" },
        { code: "CO", name: "Certificate of Competence in Bookkeeping Essentials" }
      ],
      careers: ["Staff Accountant", "Payroll Specialist", "Tax Consultant", "Certified Bookkeeper", "Budget Analyst", "Audit Assistant"],
      advisor: "Advisor: Accounting Faculty · Rm KL-203",
      email: "accounting@hawaii.edu"
    },
    abit: {
      title: "Applied Business & Info Tech (ABIT)",
      tagline: "Maui's premier four-year Bachelor of Applied Science degree.",
      desc: "ABIT bridges the gap between modern corporate management and computer technology. Students master software engineering, data analytics, cybersecurity, and digital marketing, graduating with a launched senior business venture.",
      degrees: [
        { code: "BAS", name: "Bachelor of Applied Science in ABIT (4-Year Degree)" },
        { code: "CO", name: "Certificate of Competence in Web Development & Cloud" },
        { code: "CO", name: "Certificate of Competence in Cybersecurity Fundamentals" }
      ],
      careers: ["Full-Stack Software Developer", "Tech Product Manager", "Systems & Data Analyst", "Cybersecurity Specialist", "IT Consultant", "Startup Founder"],
      advisor: "Advisor: Dr. Debasis Bhattacharya · Rm KL-202",
      email: "debasis@hawaii.edu"
    }
  };

  // --- MOCK DATA: JOBS BOARD ---
  const jobsData = [
    {
      title: "Business Analyst Intern",
      employer: "Maui High Performance Computing Center (MHPCC)",
      category: "tech",
      type: "Student Internship",
      pay: "$22.00 / hr",
      schedule: "15–20 hrs / wk (Flexible)",
      location: "Kihei, Maui (Hybrid)",
      deadline: "Nov 30, 2026",
      posted: "Posted Oct 20",
      desc: "Assist defense and research analysts with operational workflows, data reporting, and tech documentation. Open to ABIT and Business Administration students. Mentorship provided by senior systems engineers."
    },
    {
      title: "Ka Lama Lab Assistant & Student Help",
      employer: "UHMC Business Department",
      category: "business",
      type: "Part-Time Campus Job",
      pay: "$16.50 / hr",
      schedule: "12–15 hrs / wk (Between classes)",
      location: "Ka Lama Building",
      deadline: "Open until filled",
      posted: "Posted Oct 22",
      desc: "Support Ka Lama 201 open computer lab, monitor printer supplies, assist fellow students with login and basic software questions, and assist department faculty with flyers."
    },
    {
      title: "Hospitality Management Trainee",
      employer: "Grand Wailea Resort",
      category: "hospitality",
      type: "Full-Time Career Track",
      pay: "$58,000 / yr + Full Island Benefits",
      schedule: "Full-Time (Rotational)",
      location: "Wailea, Maui",
      deadline: "Dec 15, 2026",
      posted: "Posted Oct 18",
      desc: "Fast-track rotational leadership program across front desk, guest relations, and luxury event operations. UHMC HOST graduates prioritized with direct path to assistant department manager."
    },
    {
      title: "Junior Staff Bookkeeper",
      employer: "Valley Isle Financial Services",
      category: "accounting",
      type: "Full-Time Career",
      pay: "$25.00 – $28.00 / hr",
      schedule: "40 hrs / wk (Mon–Fri)",
      location: "Kahului, Maui",
      deadline: "Nov 25, 2026",
      posted: "Posted Oct 15",
      desc: "Manage payroll, general ledger, and accounts payable for local Maui small businesses. Proficiency with QuickBooks and Microsoft Excel required. Great career start for accounting AAS grads."
    },
    {
      title: "Digital Marketing & Social Specialist",
      employer: "Maui Ocean Arts & Native Goods",
      category: "business",
      type: "Part-Time / Contract",
      pay: "$20.00 / hr",
      schedule: "15 hrs / wk",
      location: "Makawao / Remote",
      deadline: "Dec 01, 2026",
      posted: "Posted Oct 14",
      desc: "Create engaging social video content, write email marketing newsletters, and analyze web analytics for an established Maui artisan collective."
    },
    {
      title: "IT Support & Web Intern",
      employer: "County of Maui — Department of Finance",
      category: "tech",
      type: "Student Internship",
      pay: "$21.50 / hr",
      schedule: "20 hrs / wk",
      location: "Wailuku, Maui",
      deadline: "Dec 10, 2026",
      posted: "Posted Oct 12",
      desc: "Assist municipal IT staff with workstation deployments, hardware diagnostics, and intranet database maintenance. Excellent resume builder for ABIT and tech students."
    }
  ];

  // --- MOCK DATA: EVENTS ---
  const eventsData = [
    {
      filter: "week",
      mon: "OCT",
      day: "28",
      title: "HOST Industry Speaker: Luxury Resort Trends",
      time: "11:30 AM – 1:00 PM",
      location: "Ka Lama Rm 102",
      desc: "Guest lecture with Maui resort general managers discussing hospitality innovations and post-graduation hiring."
    },
    {
      filter: "week",
      mon: "OCT",
      day: "30",
      title: "Resume & LinkedIn Touch-Up Clinic",
      time: "1:00 PM – 3:30 PM",
      location: "Ka Lama Rm 201 Computer Lab",
      desc: "Drop in for 1-on-1 resume reviews and optimize your profile before fall career recruiting begins."
    },
    {
      filter: "month",
      mon: "NOV",
      day: "12",
      title: "ABIT Senior Venture Pitch & Demo Showcase",
      time: "1:00 PM – 4:00 PM",
      location: "Ka Lama Rm 102",
      desc: "Senior students present real web apps and business ventures to local community mentors and angel judges."
    },
    {
      filter: "month",
      mon: "NOV",
      day: "18",
      title: "Accounting Society Fall Speaker Dinner",
      time: "5:30 PM – 7:30 PM",
      location: "Pilina Multi-Purpose Room",
      desc: "Network with Hawaii Society of CPAs representatives and discover scholarship and internship programs."
    },
    {
      filter: "special",
      mon: "DEC",
      day: "01",
      title: "Spring 2027 STAR GPS Registration Opens",
      time: "All Day • Online & Ka Lama Advising",
      location: "Ka Lama 2nd Floor Advising Hub",
      desc: "Priority course registration opens for continuing UHMC students. Meet with faculty advisors to graduate on time."
    },
    {
      filter: "special",
      mon: "DEC",
      day: "15",
      title: "Fall Semester Commencement Celebration",
      time: "5:00 PM – 7:30 PM",
      location: "UHMC Great Lawn",
      desc: "Join us in celebrating our graduating Business, Accounting, HOST, and ABIT degree recipients!"
    }
  ];

  // --- MOCK DATA: SURVEY QUESTIONS ---
  const surveyQuestions = [
    {
      step: 1,
      total: 3,
      icon: "🎓",
      sub: "UHMC Student Voice • Shaping Campus Life",
      question: "What would you like to see or happen more on campus?",
      options: [
        "Food Trucks & Social Events",
        "Industry Mentorship Nights",
        "24/7 Study Lounge & Coffee",
        "Tech Certification Workshops",
        "Intramural Sports & Fitness",
        "Other (type it)"
      ]
    },
    {
      step: 2,
      total: 3,
      icon: "💼",
      sub: "Career Pathways & Professional Growth",
      question: "Which career resources would benefit you most right now?",
      options: [
        "Local Maui Internship Matching",
        "1-on-1 Resume & Interview Coaching",
        "Networking with Island Alumni",
        "Free Professional Headshots",
        "Employer Site Visits & Tours",
        "Other (type it)"
      ]
    },
    {
      step: 3,
      total: 3,
      icon: "💻",
      sub: "Ka Lama Technology & Study Facilities",
      question: "What facility or tech upgrades should Ka Lama add first?",
      options: [
        "Dual-Monitor Student Workstations",
        "Quiet Soundproof Podcast/Zoom Pods",
        "Free Charging Lockers & Cables",
        "Outdoor Shaded Seating with Wi-Fi",
        "More Open Lab Evening Hours",
        "Other (type it)"
      ]
    }
  ];

  // --- INITIALIZE ALL MODULES ---
  initClock();
  initNavigation();
  initIdleTimer();
  initAttractSlideshow();
  initDirectoryModule();
  initProgramsModule();
  initJobsModule();
  initEventsModule();
  initSurveyModule();
  initWebsiteModule();
  initModalsAndA11y();
  initPreviewControls();

  // Set initial view
  switchView('view-attract');

  // =========================================================================
  // 1. CLOCK & WEATHER WIDGET
  // =========================================================================
  function initClock() {
    const timeEl = document.getElementById('header-time');
    const dateEl = document.getElementById('header-date');

    function update() {
      const now = new Date();
      timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      dateEl.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    }
    update();
    setInterval(update, 1000);
  }

  // =========================================================================
  // 2. VIEW CONTROLLER & NAVIGATION
  // =========================================================================
  function initNavigation() {
    // Tap anywhere on Attract screen to enter Main Menu
    const attractTrigger = document.getElementById('attract-touch-trigger');
    if (attractTrigger) {
      attractTrigger.addEventListener('click', () => {
        wakeFromAttract();
        switchView('view-menu');
      });
    }

    // Main Menu Tiles
    document.querySelectorAll('.menu-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        const targetView = tile.getAttribute('data-view');
        switchView(targetView);
      });
    });

    // Featured Announcement Banner on Menu
    const featBanner = document.querySelector('.featured-banner-card');
    if (featBanner) {
      featBanner.addEventListener('click', () => {
        switchView('view-events');
      });
    }

    // Footer Shared Buttons
    const btnMainMenu = document.getElementById('btn-nav-mainmenu');
    const btnExit = document.getElementById('btn-nav-exit');

    if (btnMainMenu) {
      btnMainMenu.addEventListener('click', () => {
        switchView('view-menu');
      });
    }

    if (btnExit) {
      btnExit.addEventListener('click', () => {
        triggerAttractMode();
      });
    }
  }

  function switchView(viewId) {
    const panels = document.querySelectorAll('.view-panel');
    panels.forEach(p => p.classList.remove('active'));

    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add('active');
      target.scrollTop = 0;
      state.currentView = viewId;
    }

    const appEl = document.getElementById('kiosk-app');
    const screenHeading = document.getElementById('screen-heading');
    const btnMainMenu = document.getElementById('btn-nav-mainmenu');
    const footerIdleHint = document.getElementById('footer-idle-hint');

    // Dynamic Header Title & Footer State per Wireframe
    switch (viewId) {
      case 'view-attract':
        appEl.classList.add('at-attract');
        screenHeading.textContent = "Business Dept · Ka Lama";
        state.isIdle = true;
        break;

      case 'view-menu':
        appEl.classList.remove('at-attract');
        screenHeading.textContent = "Main Menu";
        if (btnMainMenu) btnMainMenu.style.display = 'none'; // Don't show "Main Menu" on Main Menu
        if (footerIdleHint) footerIdleHint.style.display = 'flex';
        state.isIdle = false;
        break;

      case 'view-directory':
        appEl.classList.remove('at-attract');
        screenHeading.textContent = "Building Directory";
        if (btnMainMenu) btnMainMenu.style.display = 'block';
        if (footerIdleHint) footerIdleHint.style.display = 'none';
        state.isIdle = false;
        break;

      case 'view-programs':
        appEl.classList.remove('at-attract');
        screenHeading.textContent = "Business Programs";
        if (btnMainMenu) btnMainMenu.style.display = 'block';
        if (footerIdleHint) footerIdleHint.style.display = 'none';
        state.isIdle = false;
        break;

      case 'view-jobs':
        appEl.classList.remove('at-attract');
        screenHeading.textContent = "Job Opportunities";
        if (btnMainMenu) btnMainMenu.style.display = 'block';
        if (footerIdleHint) footerIdleHint.style.display = 'none';
        state.isIdle = false;
        break;

      case 'view-events':
        appEl.classList.remove('at-attract');
        screenHeading.textContent = "Events & News";
        if (btnMainMenu) btnMainMenu.style.display = 'block';
        if (footerIdleHint) footerIdleHint.style.display = 'none';
        state.isIdle = false;
        break;

      case 'view-survey':
        appEl.classList.remove('at-attract');
        screenHeading.textContent = "Student Survey";
        if (btnMainMenu) btnMainMenu.style.display = 'block';
        if (footerIdleHint) footerIdleHint.style.display = 'none';
        state.isIdle = false;
        break;

      case 'view-website':
        appEl.classList.remove('at-attract');
        screenHeading.textContent = "UHMC Website";
        if (btnMainMenu) btnMainMenu.style.display = 'block';
        if (footerIdleHint) footerIdleHint.style.display = 'none';
        state.isIdle = false;
        break;
    }

    resetIdleTimer();
  }

  // =========================================================================
  // 3. IDLE TIMER & ATTRACT TRANSITION
  // =========================================================================
  function initIdleTimer() {
    const idleSecsEl = document.getElementById('idle-secs-counter');

    // Any touch/click resets idle timer
    ['touchstart', 'click', 'mousemove', 'keydown'].forEach(evt => {
      window.addEventListener(evt, () => {
        resetIdleTimer();
      }, { passive: true });
    });

    setInterval(() => {
      if (!state.isIdle) {
        state.idleSecondsRemaining--;
        if (idleSecsEl) {
          idleSecsEl.textContent = Math.max(0, state.idleSecondsRemaining);
        }
        if (state.idleSecondsRemaining <= 0) {
          triggerAttractMode();
        }
      }
    }, 1000);
  }

  function resetIdleTimer() {
    state.idleSecondsRemaining = state.idleThreshold;
  }

  function triggerAttractMode() {
    state.isIdle = true;
    switchView('view-attract');
  }

  function wakeFromAttract() {
    state.isIdle = false;
    resetIdleTimer();
  }

  // =========================================================================
  // 4. PAGE 1: ATTRACT SLIDESHOW (Portrait Flyers)
  // =========================================================================
  function initAttractSlideshow() {
    const slides = document.querySelectorAll('.flyer-slide');
    const dots = document.querySelectorAll('#slideshow-dots .dot');
    let currentIndex = 0;

    if (slides.length === 0) return;

    setInterval(() => {
      slides[currentIndex].classList.remove('active');
      dots[currentIndex].classList.remove('active');

      currentIndex = (currentIndex + 1) % slides.length;

      slides[currentIndex].classList.add('active');
      dots[currentIndex].classList.add('active');
    }, 4500);
  }

  // =========================================================================
  // 5. PAGE 3: BUILDING DIRECTORY & INTERACTIVE FLOOR MAP
  // =========================================================================
  function initDirectoryModule() {
    const floorPills = document.querySelectorAll('.floor-pill-btn');
    const catChips = document.querySelectorAll('.cat-chip');
    const searchInput = document.getElementById('input-dir-search');
    const clearBtn = document.getElementById('btn-clear-dir-search');
    const listContainer = document.getElementById('dir-list-container');
    const mapFrame = document.getElementById('svg-map-frame');
    const floorLabel = document.getElementById('dir-active-floor-label');
    const roomPill = document.getElementById('dir-active-room-pill');
    const zoomInBtn = document.getElementById('btn-map-zoom-in');
    const zoomOutBtn = document.getElementById('btn-map-zoom-out');

    function render() {
      floorLabel.textContent = `Ka Lama · Floor ${state.activeFloor}`;

      // Filter rooms
      const query = (searchInput.value || '').trim().toLowerCase();
      const floorRooms = directoryData.filter(r => r.floor === state.activeFloor);

      const filtered = floorRooms.filter(r => {
        const matchesCat = state.activeCategory === 'all' || r.category === state.activeCategory;
        const matchesQuery = !query ||
          r.room.toLowerCase().includes(query) ||
          r.name.toLowerCase().includes(query) ||
          r.desc.toLowerCase().includes(query);
        return matchesCat && matchesQuery;
      });

      // Render List
      if (filtered.length === 0) {
        listContainer.innerHTML = `
          <div style="padding:20px; text-align:center; color:var(--text-muted); font-size:12px;">
            No rooms matching criteria on Floor ${state.activeFloor}.
          </div>
        `;
      } else {
        listContainer.innerHTML = filtered.map(item => `
          <div class="dir-row-item ${item.room === state.selectedRoom ? 'selected' : ''}" data-room="${item.room}">
            <div class="dir-row-left">
              <span class="dir-room-tag">${item.room}</span>
              <div>
                <div class="dir-name-title">${item.name}</div>
                <div class="dir-cat-sub">${item.desc}</div>
              </div>
            </div>
            <span class="dir-chevron">›</span>
          </div>
        `).join('');

        listContainer.querySelectorAll('.dir-row-item').forEach(el => {
          el.addEventListener('click', () => {
            const rm = el.getAttribute('data-room');
            selectRoom(rm);
          });
        });
      }

      // Render SVG Map
      renderSvgFloorMap(floorRooms);
    }

    function renderSvgFloorMap(floorRooms) {
      const activeItem = directoryData.find(r => r.room === state.selectedRoom && r.floor === state.activeFloor) || floorRooms[0];
      if (activeItem) {
        roomPill.textContent = `Selected: Rm ${activeItem.room} · ${activeItem.name}`;
      }

      // SVG Base size
      const viewBoxWidth = 460 / state.mapZoom;
      const viewBoxHeight = 165 / state.mapZoom;
      const minX = (460 - viewBoxWidth) / 2;
      const minY = (165 - viewBoxHeight) / 2;

      mapFrame.innerHTML = `
        <svg viewBox="${minX} ${minY} ${viewBoxWidth} ${viewBoxHeight}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="hallwayGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#0f1922"/>
              <stop offset="50%" stop-color="#192836"/>
              <stop offset="100%" stop-color="#0f1922"/>
            </linearGradient>
          </defs>

          <!-- Outer boundary -->
          <rect x="20" y="12" width="420" height="142" rx="10" fill="#0b1319" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>

          <!-- Hallway Corridor -->
          <rect x="30" y="82" width="400" height="20" rx="4" fill="url(#hallwayGrad)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
          <text x="230" y="95" fill="rgba(255,255,255,0.3)" font-size="8" font-weight="800" text-anchor="middle" letter-spacing="1">CENTRAL CORRIDOR</text>

          <!-- Animated Walking Route to Selected Room -->
          ${activeItem && activeItem.path ? `
            <path d="${activeItem.path}" fill="none" stroke="#ffb600" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="walking-route-path"/>
          ` : ''}

          <!-- Room Nodes -->
          ${floorRooms.map(r => `
            <g class="map-room-node ${r.room === (activeItem ? activeItem.room : '') ? 'highlighted' : ''}" data-room="${r.room}">
              <rect class="map-room-rect" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="6"
                    fill="rgba(0, 79, 110, 0.75)" stroke="#004f6e" stroke-width="1.5" />
              <text x="${r.x + r.w / 2}" y="${r.y + r.h / 2 - 2}" fill="#FFFFFF" font-size="10" font-weight="800" text-anchor="middle">${r.room}</text>
              <text x="${r.x + r.w / 2}" y="${r.y + r.h / 2 + 10}" fill="#ffb600" font-size="7" font-weight="700" text-anchor="middle">${r.catLabel}</text>
            </g>
          `).join('')}

          <!-- Kiosk "You Are Here" Marker -->
          <circle cx="45" cy="130" r="8" fill="#10B981" opacity="0.3"/>
          <circle cx="45" cy="130" r="5" fill="#10B981"/>
          <circle cx="45" cy="130" r="2" fill="#FFFFFF"/>
          <text x="45" y="148" fill="#10B981" font-size="7" font-weight="800" text-anchor="middle">KIOSK</text>
        </svg>
      `;

      // Map room node clicks
      mapFrame.querySelectorAll('.map-room-node').forEach(node => {
        node.addEventListener('click', () => {
          const rm = node.getAttribute('data-room');
          selectRoom(rm);
        });
      });
    }

    function selectRoom(roomCode) {
      state.selectedRoom = roomCode;
      const targetRoom = directoryData.find(r => r.room === roomCode);
      if (targetRoom) {
        state.activeFloor = targetRoom.floor;
        floorPills.forEach(btn => {
          btn.classList.toggle('active', parseInt(btn.getAttribute('data-floor'), 10) === targetRoom.floor);
        });
      }
      render();

      // Scroll selected item into view in list
      setTimeout(() => {
        const activeRow = listContainer.querySelector(`.dir-row-item[data-room="${roomCode}"]`);
        if (activeRow) {
          activeRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 50);
    }

    // Floor button clicks
    floorPills.forEach(pill => {
      pill.addEventListener('click', () => {
        floorPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.activeFloor = parseInt(pill.getAttribute('data-floor'), 10);
        // Default select first room on that floor
        const first = directoryData.find(r => r.floor === state.activeFloor);
        if (first) state.selectedRoom = first.room;
        render();
      });
    });

    // Category chip clicks
    catChips.forEach(chip => {
      chip.addEventListener('click', () => {
        catChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.activeCategory = chip.getAttribute('data-cat');
        render();
      });
    });

    // Search events
    searchInput.addEventListener('input', render);
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      render();
    });

    // Zoom buttons
    zoomInBtn.addEventListener('click', () => {
      state.mapZoom = Math.min(1.6, state.mapZoom + 0.2);
      render();
    });

    zoomOutBtn.addEventListener('click', () => {
      state.mapZoom = Math.max(0.8, state.mapZoom - 0.2);
      render();
    });

    render();
  }

  // =========================================================================
  // 6. PAGE 4: BUSINESS PROGRAMS
  // =========================================================================
  function initProgramsModule() {
    const tabs = document.querySelectorAll('.prog-tab-btn');
    const titleEl = document.getElementById('prog-title');
    const taglineEl = document.getElementById('prog-tagline');
    const descEl = document.getElementById('prog-description');
    const degreesListEl = document.getElementById('prog-degrees-list');
    const careersListEl = document.getElementById('prog-careers-list');
    const advisorNameEl = document.getElementById('prog-advisor-name');
    const advisorEmailEl = document.getElementById('prog-advisor-email');

    function renderProgram(key) {
      const prog = programsData[key];
      if (!prog) return;

      titleEl.textContent = prog.title;
      taglineEl.textContent = prog.tagline;
      descEl.textContent = prog.desc;
      advisorNameEl.textContent = prog.advisor;
      advisorEmailEl.textContent = prog.email;

      degreesListEl.innerHTML = prog.degrees.map(d => `
        <div class="degree-item">
          <strong>[${d.code}]</strong> · ${d.name}
        </div>
      `).join('');

      careersListEl.innerHTML = prog.careers.map(c => `
        <span class="career-chip">${c}</span>
      `).join('');
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const progKey = tab.getAttribute('data-prog');
        state.selectedProgram = progKey;
        renderProgram(progKey);
      });
    });

    renderProgram('business');
  }

  // =========================================================================
  // 7. PAGE 5: JOB OPPORTUNITIES
  // =========================================================================
  function initJobsModule() {
    const heroTitle = document.getElementById('sel-job-title');
    const heroEmployer = document.getElementById('sel-job-employer');
    const heroPay = document.getElementById('sel-job-pay');
    const heroSchedule = document.getElementById('sel-job-schedule');
    const heroLocation = document.getElementById('sel-job-location');
    const heroDeadline = document.getElementById('sel-job-deadline');
    const heroDesc = document.getElementById('sel-job-desc');
    const heroPosted = document.getElementById('sel-job-posted');

    const countLabel = document.getElementById('jobs-count-label');
    const rowsContainer = document.getElementById('jobs-rows-container');
    const filterPills = document.querySelectorAll('.job-pill');
    const btnPrev = document.getElementById('btn-job-prev');
    const btnNext = document.getElementById('btn-job-next');
    const pageInfo = document.getElementById('job-page-info');

    function render() {
      // Filter list
      const filtered = jobsData.filter(j => {
        if (state.selectedJobCategory === 'all') return true;
        if (state.selectedJobCategory === 'internship') return j.type.toLowerCase().includes('intern');
        return j.category === state.selectedJobCategory;
      });

      countLabel.innerHTML = `<strong>${filtered.length}</strong> open positions`;

      const totalPages = Math.ceil(filtered.length / state.jobsPerPage) || 1;
      if (state.jobPage > totalPages) state.jobPage = totalPages;
      if (state.jobPage < 1) state.jobPage = 1;

      pageInfo.textContent = `Page ${state.jobPage} of ${totalPages}`;

      // Slice current page
      const startIdx = (state.jobPage - 1) * state.jobsPerPage;
      const pageItems = filtered.slice(startIdx, startIdx + state.jobsPerPage);

      // Selected active job
      const activeJob = filtered[state.selectedJobIndex] || filtered[0] || jobsData[0];
      heroTitle.textContent = activeJob.title;
      heroEmployer.textContent = activeJob.employer;
      heroPay.textContent = activeJob.pay;
      heroSchedule.textContent = activeJob.schedule;
      heroLocation.textContent = activeJob.location;
      heroDeadline.textContent = activeJob.deadline;
      heroDesc.textContent = activeJob.desc;
      heroPosted.textContent = activeJob.posted;

      // Render Rows
      rowsContainer.innerHTML = pageItems.map((job, idx) => {
        const globalIdx = startIdx + idx;
        const isSelected = activeJob.title === job.title;
        return `
          <div class="job-row-item ${isSelected ? 'selected' : ''}" data-index="${globalIdx}">
            <div class="job-row-left">
              <span class="row-job-title">${job.title}</span>
              <span class="row-job-meta">${job.employer} · ${job.location} · ${job.type}</span>
            </div>
            <div class="row-job-right">
              ${job.posted}
            </div>
          </div>
        `;
      }).join('');

      rowsContainer.querySelectorAll('.job-row-item').forEach(el => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.getAttribute('data-index'), 10);
          state.selectedJobIndex = idx;
          render();
        });
      });
    }

    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.selectedJobCategory = pill.getAttribute('data-jfilter');
        state.selectedJobIndex = 0;
        state.jobPage = 1;
        render();
      });
    });

    btnPrev.addEventListener('click', () => {
      if (state.jobPage > 1) {
        state.jobPage--;
        render();
      }
    });

    btnNext.addEventListener('click', () => {
      const filtered = jobsData.filter(j => state.selectedJobCategory === 'all' || j.category === state.selectedJobCategory);
      const totalPages = Math.ceil(filtered.length / state.jobsPerPage) || 1;
      if (state.jobPage < totalPages) {
        state.jobPage++;
        render();
      }
    });

    render();
  }

  // =========================================================================
  // 8. PAGE 6: EVENTS & NEWS
  // =========================================================================
  function initEventsModule() {
    const timeTabs = document.querySelectorAll('.event-time-btn');
    const cardsList = document.getElementById('events-cards-list');

    function renderEvents() {
      const filtered = eventsData.filter(e => e.filter === state.activeEventFilter);

      cardsList.innerHTML = filtered.map(ev => `
        <div class="event-card-item">
          <div class="event-date-col">
            <span class="event-date-month">${ev.mon}</span>
            <span class="event-date-day">${ev.day}</span>
          </div>
          <div class="event-item-info">
            <div class="event-item-title">${ev.title}</div>
            <div class="event-item-sub">🕒 ${ev.time} · 📍 ${ev.location}</div>
          </div>
        </div>
      `).join('');
    }

    timeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        timeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.activeEventFilter = tab.getAttribute('data-efilter');
        renderEvents();
      });
    });

    renderEvents();
  }

  // =========================================================================
  // 9. PAGE 7: STUDENT SURVEY MODULE
  // =========================================================================
  function initSurveyModule() {
    const stepLabel = document.getElementById('survey-step-label');
    const progressFill = document.getElementById('survey-progress-fill');
    const questionText = document.getElementById('survey-question-text');
    const artIcon = document.getElementById('survey-art-icon');
    const artSub = document.getElementById('survey-art-subtitle');
    const optionsGrid = document.getElementById('survey-options-grid');
    const btnSkip = document.getElementById('btn-survey-skip');
    const btnNext = document.getElementById('btn-survey-next');

    const resultsModal = document.getElementById('survey-results-modal');
    const resultsBarsList = document.getElementById('survey-bars-list');
    const btnRestart = document.getElementById('btn-survey-restart');

    function renderStep() {
      const q = surveyQuestions[state.surveyStep - 1];
      if (!q) return;

      stepLabel.textContent = `Question ${q.step} of ${q.total}`;
      progressFill.style.width = `${(q.step / q.total) * 100}%`;
      questionText.textContent = q.question;
      artIcon.textContent = q.icon;
      artSub.textContent = q.sub;

      state.surveySelectedOptions.clear();

      optionsGrid.innerHTML = q.options.map(opt => {
        const isOther = opt.toLowerCase().includes('other');
        return `
          <button class="survey-opt-btn ${isOther ? 'dashed-opt' : ''}" data-val="${opt}">
            <span class="opt-checkmark"></span>
            <span>${opt}</span>
          </button>
        `;
      }).join('');

      optionsGrid.querySelectorAll('.survey-opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = btn.getAttribute('data-val');
          if (val.toLowerCase().includes('other')) {
            openKeyboardModal();
          } else {
            if (state.surveySelectedOptions.has(val)) {
              state.surveySelectedOptions.delete(val);
              btn.classList.remove('checked');
            } else {
              state.surveySelectedOptions.add(val);
              btn.classList.add('checked');
            }
          }
        });
      });
    }

    function advanceStep() {
      // Record any selections
      state.surveySelectedOptions.forEach(opt => {
        if (state.surveyVotes[opt]) {
          state.surveyVotes[opt]++;
        } else {
          state.surveyVotes[opt] = 1;
        }
      });

      if (state.surveyStep < surveyQuestions.length) {
        state.surveyStep++;
        renderStep();
      } else {
        // Show Results Screen
        showResults();
      }
    }

    function showResults() {
      resultsModal.classList.remove('hidden');

      const totalVotes = Object.values(state.surveyVotes).reduce((a, b) => a + b, 0);

      resultsBarsList.innerHTML = Object.entries(state.surveyVotes).map(([opt, count]) => {
        const pct = Math.round((count / totalVotes) * 100);
        return `
          <div class="result-bar-row">
            <div class="result-label-line">
              <span>${opt}</span>
              <span><strong>${pct}%</strong> (${count})</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style="width: ${pct}%;"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    btnNext.addEventListener('click', advanceStep);
    btnSkip.addEventListener('click', advanceStep);

    btnRestart.addEventListener('click', () => {
      resultsModal.classList.add('hidden');
      state.surveyStep = 1;
      renderStep();
      switchView('view-menu');
    });

    renderStep();
  }

  // =========================================================================
  // 10. PAGE 8: EMBEDDED UHMC WEBSITE BROWSER
  // =========================================================================
  function initWebsiteModule() {
    const urlDisplay = document.getElementById('browser-url-display');
    const destCards = document.querySelectorAll('.web-dest-card');
    const btnReload = document.getElementById('b-btn-reload');
    const btnHome = document.getElementById('b-btn-home');
    const btnEndSession = document.getElementById('btn-end-web-session');

    destCards.forEach(card => {
      card.addEventListener('click', () => {
        const url = card.getAttribute('data-url');
        urlDisplay.textContent = url;
      });
    });

    btnReload.addEventListener('click', () => {
      urlDisplay.textContent = "Loading " + urlDisplay.textContent + "...";
      setTimeout(() => {
        urlDisplay.textContent = "maui.hawaii.edu / refreshed";
      }, 400);
    });

    btnHome.addEventListener('click', () => {
      urlDisplay.textContent = "maui.hawaii.edu / home";
    });

    btnEndSession.addEventListener('click', () => {
      switchView('view-menu');
    });
  }

  // =========================================================================
  // 11. ACCESSIBILITY, HELP & VIRTUAL KEYBOARD MODALS
  // =========================================================================
  function initModalsAndA11y() {
    // Accessibility Modal trigger
    const btnA11y = document.getElementById('btn-nav-accessibility');
    const modalA11y = document.getElementById('modal-accessibility');

    if (btnA11y && modalA11y) {
      btnA11y.addEventListener('click', () => {
        modalA11y.classList.add('open');
      });
    }

    // Help Modal trigger
    const btnHelp = document.getElementById('btn-nav-help');
    const modalHelp = document.getElementById('modal-help');

    if (btnHelp && modalHelp) {
      btnHelp.addEventListener('click', () => {
        modalHelp.classList.add('open');
      });
    }

    // Universal Modal close buttons
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-close');
        const modal = document.getElementById(targetId);
        if (modal) modal.classList.remove('open');
      });
    });

    // High Contrast Toggle
    const btnToggleContrast = document.getElementById('btn-toggle-contrast');
    if (btnToggleContrast) {
      btnToggleContrast.addEventListener('click', () => {
        document.body.classList.toggle('high-contrast');
        btnToggleContrast.classList.toggle('active');
        btnToggleContrast.textContent = document.body.classList.contains('high-contrast') ? "Disable Contrast" : "Enable High Contrast";
      });
    }

    // Text Sizing
    const sizeBtns = document.querySelectorAll('.size-btn');
    sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const sz = btn.getAttribute('data-size');
        document.body.classList.remove('large-text', 'xlarge-text');
        if (sz === 'large') document.body.classList.add('large-text');
        if (sz === 'xlarge') document.body.classList.add('xlarge-text');
      });
    });

    // ADA Height adjustment
    const btnAda = document.getElementById('btn-toggle-wheelchair');
    if (btnAda) {
      btnAda.addEventListener('click', () => {
        document.body.classList.toggle('ada-reach');
        btnAda.classList.toggle('active');
        btnAda.textContent = document.body.classList.contains('ada-reach') ? "Reset UI Height" : "Lower UI Reach";
      });
    }

    // Build Virtual Keyboard
    buildVirtualKeyboard();
  }

  function openKeyboardModal() {
    const modal = document.getElementById('modal-keyboard');
    const inputDisplay = document.getElementById('keyboard-input-display');
    if (inputDisplay) inputDisplay.value = '';
    if (modal) modal.classList.add('open');
  }

  function buildVirtualKeyboard() {
    const kbdContainer = document.getElementById('onscreen-keyboard');
    const inputDisplay = document.getElementById('keyboard-input-display');
    const submitBtn = document.getElementById('btn-keyboard-submit');
    const modal = document.getElementById('modal-keyboard');

    if (!kbdContainer) return;

    const rows = [
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
      ["Z", "X", "C", "V", "B", "N", "M", "⌫"],
      ["SPACE"]
    ];

    kbdContainer.innerHTML = rows.map(row => `
      <div class="kbd-row">
        ${row.map(k => {
          let extraClass = '';
          if (k === 'SPACE') extraClass = 'space-key';
          if (k === '⌫') extraClass = 'back-key';
          return `<button class="kbd-key ${extraClass}" data-key="${k}">${k}</button>`;
        }).join('')}
      </div>
    `).join('');

    kbdContainer.querySelectorAll('.kbd-key').forEach(btn => {
      btn.addEventListener('click', () => {
        const k = btn.getAttribute('data-key');
        if (k === 'SPACE') {
          inputDisplay.value += ' ';
        } else if (k === '⌫') {
          inputDisplay.value = inputDisplay.value.slice(0, -1);
        } else {
          inputDisplay.value += k;
        }
      });
    });

    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const val = inputDisplay.value.trim();
        if (val) {
          state.surveySelectedOptions.add(val);
          state.surveyVotes[val] = 1;
        }
        if (modal) modal.classList.remove('open');
      });
    }
  }

  // =========================================================================
  // 12. DESKTOP PREVIEW & FULLSCREEN CONTROLS
  // =========================================================================
  function initPreviewControls() {
    const toggleDisplayBtn = document.getElementById('toggle-display-mode');
    const displayLabel = document.getElementById('display-mode-label');
    const fsBtn = document.getElementById('btn-fullscreen-toggle');

    if (toggleDisplayBtn) {
      toggleDisplayBtn.addEventListener('click', () => {
        if (document.body.classList.contains('kiosk-frame-mode')) {
          document.body.classList.remove('kiosk-frame-mode');
          document.body.classList.add('kiosk-full-mode');
          displayLabel.textContent = "Portrait Kiosk (9:16)";
        } else {
          document.body.classList.remove('kiosk-full-mode');
          document.body.classList.add('kiosk-frame-mode');
          displayLabel.textContent = "Fit Window";
        }
      });
    }

    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => {
            console.warn('Fullscreen request failed:', err);
          });
        } else {
          document.exitFullscreen();
        }
      });
    }
  }
});
