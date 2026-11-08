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
    adminOpen: false,
    customPageId: null,
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

  const spreadsheetContacts = {
    "KL-101": ["Pai Ka Mana", "EOC"],
    "KL-106": ["Veteran's Resource Center"],
    "KL-110": ["Paul Thornton, Social Science"],
    "KL-111": ["Julie Powers, Social Science"],
    "KL-112": ["Gemma Medina, Early Childhood Education"],
    "KL-113": ["Leanne Higa, Dental Hygiene"],
    "KL-114": ["Tim Botkin, STEM Department"],
    "KL-115": ["Meagan Jones, STEM Department"],
    "KL-117": ["Charlie Schlather, Humanities and Social Science"],
    "KL-119": ["Ron St. John, Humanities"],
    "KL-120": ["Selene LeGare, Social Science"],
    "KL-121": ["Melissa Kirkendall, Social Science"],
    "KL-122": ["Liping Liu, PhD, Business and Hospitality"],
    "KL-123": ["Liana Horovitz, Humanities"],
    "KL-125": ["Velma Panlasigui, Humanities and Social Science", "Cathy Yago, Title III"],
    "KL-126": ["STEM Department Lecturers"],
    "KL-127": ["Hawaii Child Welfare CQI"],
    "KL-131": ["Marshall Norman - Good Jobs Hawaii"],
    "KL-201": ["Allied Health Lab"],
    "KL-203": ["Allied Health Lab"],
    "KL-214": ["Papaikani'au Kai'anui"],
    "KL-215": ["Aubrey Matsuura, Hawaiian Studies"],
    "KL-217": ["Business Administration Lecturers"],
    "KL-218": ["Gil Logan, Business"],
    "KL-219": ["Lorelle Solanzo Peros, Business & Hospitality"],
    "KL-230": ["Rosiana (Nani) Azman, Social Science"],
    "KL-231": ["Aubrey Weston, Business & Hospitality (Accounting)"],
    "KL-232": ["Financial Aid Director"],
    "KL-233": ["Nicholas Winfrey - Maui United Way"],
    "KL-234": ["Vincent Domingo, Business & Hospitality"],
    "KL-235": ["Jeff Scharnhorst/Stephan Johnson"]
  };

  const spreadsheetRooms = [
    [1, 106], [1, 110], [1, 111], [1, 112], [1, 113], [1, 114], [1, 115],
    [1, 116], [1, 117], [1, 118], [1, 119], [1, 120], [1, 121], [1, 122],
    [1, 123], [1, 124], [1, 125], [1, 126], [1, 127], [1, 130], [1, 131],
    [1, 132], [1, 133], [1, 134], [1, 135], [2, 211], [2, 212], [2, 213],
    [2, 214], [2, 215], [2, 216], [2, 217], [2, 218], [2, 219], [2, 230],
    [2, 231], [2, 232], [2, 233], [2, 234], [2, 235]
  ];

  spreadsheetRooms.forEach(([floor, roomNumber]) => {
    const room = `KL-${roomNumber}`;
    if (!directoryData.some(item => item.room === room)) {
      directoryData.push({
        floor,
        room,
        name: `Room ${roomNumber}`,
        category: "offices",
        catLabel: "Directory",
        desc: "Building directory contact",
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        path: ""
      });
    }
  });

  // Contacts (names + emails) come from the editable content store (section 13).
  function getRoomContacts(room) {
    return contactsByRoom[room.room] || [];
  }

  function getRoomContact(room) {
    return getRoomContacts(room).map(contact => contact.name);
  }

  function getRoomSubtitle(room) {
    const contacts = getRoomContacts(room);
    if (contacts.length === 0) return room.desc;
    const emails = contacts.map(contact => contact.email).filter(Boolean);
    return [`Room ${room.room.replace('KL-', '')}`, ...emails].join(' · ');
  }

  function getRoomDisplayName(room) {
    const contacts = getRoomContact(room);
    return contacts.length > 0 ? contacts.join(" · ") : room.name;
  }

  // --- MOCK DATA: ACADEMIC PROGRAMS ---
  const defaultPrograms = {
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
  const defaultEvents = [
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

  // --- EDITABLE CONTENT -----------------------------------------------------
  // Everything below is the DEFAULT content. Edits made in the admin panel are
  // saved in this browser (see content-store.js) and loaded on top of it.
  const defaultContacts = Object.entries(spreadsheetContacts).flatMap(([room, names]) =>
    names.map(name => ({ room, name, email: '' }))
  );

  const defaultContent = {
    flyers: [
      { badge: "Featured Program", title: "Applied Business & Info Tech (ABIT)", lead: "Island tech starts here.", tag1: "4-Year Bachelor Degree", tag2: "100% On Maui", theme: "ocean" },
      { badge: "Hospitality & Tourism", title: "Lead Maui's Premier Resorts & Tourism", lead: "Lead Maui's next great guest experience.", tag1: "Guaranteed Internships", tag2: "Direct Career Track", theme: "navy" },
      { badge: "Student Event", title: "Fall Business Capstone & Pitch Day", lead: "Nov 12 · Ka Lama 102", tag1: "Ka Lama 102", tag2: "Free Refreshments", theme: "copper" },
      { badge: "Career Opportunity", title: "Student Help & Lab Assistant Positions", lead: "Flexible campus work while you study.", tag1: "$16.50/hr", tag2: "Apply at Ka Lama 203", theme: "slate" },
      { badge: "Advising & Registration", title: "Spring 2027 Registration Starts Soon", lead: "Spring 2027 planning starts soon.", tag1: "Walk-ins Welcome", tag2: "Ka Lama 2nd Floor", theme: "lagoon" }
    ],
    today: [
      { time: "9:00 AM", title: "BUS 120: Principles of Management", sub: "Ka Lama 101 Lecture Hall" },
      { time: "11:30 AM", title: "HOST Industry Guest Speaker & Lunch", sub: "Ka Lama 102 Active Learning Lab" },
      { time: "2:00 PM", title: "ABIT Open Cyber Lab & Mentoring", sub: "Ka Lama 202 Technology Hub" }
    ],
    ticker: [
      "UHMC Spring 2027 Registration opens Dec 1",
      "Ka Lama 201 Open Computer Lab hours: Mon–Fri 8:00 AM – 5:00 PM",
      "Free VITA Volunteer Tax Preparation starting next month",
      "Maui County Internship stipend applications now open",
      "Ka Lama Advising Office walk-ins available daily on 2nd floor"
    ],
    banner: {
      badge: "FEATURED ANNOUNCEMENT",
      title: "Spring 2027 Registration & Academic Advising Now Open",
      body: "Plan your degree pathways with Ka Lama business faculty. Stop by 2nd Floor offices or schedule via STAR GPS."
    },
    menuBannerVisible: true,
    featuredEvent: {
      artBadge: "FEATURED EVENT FLYER",
      artTitle: "ABIT Senior Capstone & Venture Pitch Showcase",
      artText: "Maui tech, software & business startup presentations by UHMC graduates.",
      tag: "Academic & Tech",
      title: "Annual Business Pitch & Tech Demo Day",
      date: "Friday, Nov 12",
      time: "1:00 PM – 4:00 PM",
      location: "Ka Lama Rm 102",
      summary: "Join our community of Maui mentors, entrepreneurs, and students. Refreshments served. Open to all students, alumni, and local business leaders."
    },
    events: defaultEvents,
    programs: defaultPrograms,
    contacts: defaultContacts,
    menuTiles: [
      { id: "programs", type: "view", view: "view-programs", title: "Business Programs", subtitle: "Business · Hospitality · Accounting · ABIT", icon: "book", body: "", hidden: false },
      { id: "directory", type: "view", view: "view-directory", title: "Building Directory", subtitle: "Rooms and offices, floors 1–2", icon: "layout", body: "", hidden: false },
      { id: "jobs", type: "view", view: "view-jobs", title: "Job Opportunities", subtitle: "Business jobs and internships", icon: "briefcase", body: "", hidden: false },
      { id: "events", type: "view", view: "view-events", title: "Events & News", subtitle: "Events, marketing, special occasions", icon: "calendar", body: "", hidden: false },
      { id: "survey", type: "view", view: "view-survey", title: "Student Survey", subtitle: "Share your ideas for campus", icon: "clipboard", body: "", hidden: false },
      { id: "website", type: "view", view: "view-website", title: "UHMC Website", subtitle: "Browse maui.hawaii.edu", icon: "globe", body: "", hidden: false }
    ],
    attractWidgets: [
      { id: "slideshow", visible: true },
      { id: "today", visible: true },
      { id: "job", visible: true },
      { id: "ticker", visible: true }
    ],
    meta: { updatedBy: "", updatedAt: "" }
  };

  // Live content (defaults + saved admin edits). The module renderers below read
  // these variables each time they draw, so applyContent() can swap them out.
  let content = KioskStore.load(defaultContent);
  let eventsData = content.events;
  let programsData = content.programs;
  let contactsByRoom = buildContactsByRoom(content.contacts);
  let slideIndex = 0;
  const rerenderHooks = []; // each module registers its render() here

  // --- INITIALIZE ALL MODULES ---
  initClock();
  renderContentWidgets();
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

    // Main Menu Tiles (delegated, because the admin can add/remove/reorder tiles)
    const menuGrid = document.querySelector('.menu-grid-2x3');
    if (menuGrid) {
      menuGrid.addEventListener('click', event => {
        const tile = event.target.closest('.menu-tile');
        if (!tile) return;
        const targetView = tile.getAttribute('data-view');
        if (targetView === 'view-custom') {
          state.customPageId = tile.getAttribute('data-tile-id');
          renderCustomPage();
        }
        switchView(targetView);
      });
    }

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

      case 'view-custom': {
        // Info pages created by the admin from the Layout tab
        const customTile = content.menuTiles.find(t => t.id === state.customPageId);
        appEl.classList.remove('at-attract');
        screenHeading.textContent = customTile ? customTile.title : "Information";
        if (btnMainMenu) btnMainMenu.style.display = 'block';
        if (footerIdleHint) footerIdleHint.style.display = 'none';
        state.isIdle = false;
        break;
      }
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
      // The idle countdown pauses while an admin is signed in
      if (!state.isIdle && !state.adminOpen) {
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
    // Slides are rendered from the editable content (renderFlyers), so look
    // them up fresh on every tick.
    setInterval(() => {
      const slides = document.querySelectorAll('#attract-slideshow .flyer-slide');
      const dots = document.querySelectorAll('#slideshow-dots .dot');
      if (slides.length < 2) return;

      const current = slideIndex % slides.length;
      slides[current].classList.remove('active');
      if (dots[current]) dots[current].classList.remove('active');

      slideIndex = (current + 1) % slides.length;

      slides[slideIndex].classList.add('active');
      if (dots[slideIndex]) dots[slideIndex].classList.add('active');
    }, 4500);
  }

  // =========================================================================
  // 5. PAGE 3: BUILDING DIRECTORY & INTERACTIVE FLOOR MAP
  // =========================================================================
  function initDirectoryModule() {
    const floorPills = document.querySelectorAll('.floor-pill-btn');
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
        const contactText = getRoomContacts(r).map(c => `${c.name} ${c.email}`).join(' ');
        const matchesQuery = !query ||
          r.room.toLowerCase().includes(query) ||
          r.name.toLowerCase().includes(query) ||
          r.desc.toLowerCase().includes(query) ||
          contactText.toLowerCase().includes(query);
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
          <div class="dir-row-item ${item.room === state.selectedRoom ? 'selected' : ''}" data-room="${esc(item.room)}">
            <div class="dir-row-left">
              <span class="dir-room-tag">${esc(item.room)}</span>
              <div>
                <div class="dir-name-title">${esc(getRoomDisplayName(item))}</div>
                <div class="dir-cat-sub">${esc(getRoomSubtitle(item))}</div>
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

      renderSvgFloorMap(floorRooms);
    }

    function renderSvgFloorMap(floorRooms) {
      const activeItem = directoryData.find(r => r.room === state.selectedRoom && r.floor === state.activeFloor) || floorRooms[0];
      if (activeItem) {
        roomPill.textContent = `Selected: Rm ${activeItem.room} · ${getRoomDisplayName(activeItem)}`;
      }

      const floorOne = state.activeFloor === 1;
      const rooms = floorOne ? [
        ['130', 450, 12, 49, 83, '#4d91dc'], ['131', 503, 12, 49, 83, '#82d044'],
        ['132', 555, 12, 47, 83, '#fff8e8'], ['133', 604, 12, 49, 83, '#fff8e8'],
        ['134', 656, 12, 49, 83, '#4d91dc'], ['135', 708, 12, 49, 83, '#fff8e8'],
        ['103A', 768, 86, 70, 53, '#fff8e8'], ['101', 450, 141, 80, 170, '#82d044'],
        ['A', 532, 141, 56, 55, '#fff8e8'], ['105', 532, 201, 56, 110, '#fff8e8'],
        ['103', 592, 141, 246, 170, '#fff8e8'], ['137', 485, 275, 45, 35, '#fff8e8'],
        ['102', 522, 352, 85, 170, '#fff8e8'], ['104A', 610, 352, 113, 170, '#fff8e8'],
        ['104B', 725, 352, 113, 170, '#fff8e8'],
        ['124', 10, 200, 72, 49, '#fff8e8'], ['123', 10, 253, 72, 49, '#4d91dc'],
        ['122', 10, 307, 72, 49, '#4d91dc'], ['121', 10, 361, 72, 49, '#4d91dc'],
        ['120', 10, 415, 72, 49, '#4d91dc'], ['119', 10, 469, 72, 49, '#4d91dc'],
        ['118', 10, 523, 72, 49, '#fff8e8'], ['117', 10, 577, 72, 49, '#4d91dc'],
        ['125', 121, 200, 84, 52, '#4d91dc'], ['126', 121, 254, 84, 54, '#4d91dc'],
        ['127', 121, 310, 84, 56, '#82d044'], ['107', 208, 200, 100, 168, '#fff8e8'],
        ['109', 121, 410, 103, 157, '#fff8e8'], ['108', 226, 410, 110, 157, '#fff8e8'],
        ['106', 338, 410, 61, 118, '#82d044'], ['110', 338, 530, 61, 36, '#4d91dc'],
        ['116', 130, 613, 42, 96, '#fff8e8'], ['115', 175, 613, 43, 96, '#4d91dc'],
        ['114', 220, 613, 43, 96, '#4d91dc'], ['113', 265, 613, 43, 96, '#4d91dc'],
        ['112', 310, 613, 43, 96, '#4d91dc'], ['111', 355, 613, 43, 96, '#4d91dc']
      ] : [
        ['230', 447, 15, 49, 80, '#4d91dc'], ['231', 500, 15, 49, 80, '#4d91dc'],
        ['232', 552, 15, 49, 80, '#ffd21a'], ['233', 604, 15, 49, 80, '#82d044'],
        ['234', 656, 15, 49, 80, '#4d91dc'], ['235', 708, 15, 49, 80, '#fff8e8'],
        ['201', 447, 150, 176, 163, '#ffd21a'], ['203', 628, 150, 176, 163, '#ffd21a'],
        ['203A', 628, 199, 40, 80, '#fff8e8'], ['202', 520, 340, 157, 162, '#fff8e8'],
        ['204', 682, 340, 154, 162, '#fff8e8'], ['207', 99, 212, 211, 163, '#fff8e8'],
        ['209', 9, 212, 88, 150, '#fff8e8'], ['208', 119, 420, 135, 156, '#fff8e8'],
        ['206', 258, 420, 141, 156, '#fff8e8'], ['221', 9, 367, 72, 49, '#fff8e8'],
        ['220', 9, 419, 72, 49, '#fff8e8'], ['219', 9, 470, 72, 50, '#4d91dc'],
        ['218', 9, 523, 72, 50, '#4d91dc'], ['217', 9, 576, 72, 50, '#4d91dc'],
        ['216', 128, 616, 43, 93, '#fff8e8'], ['215', 174, 616, 43, 93, '#4d91dc'],
        ['214', 220, 616, 43, 93, '#4d91dc'], ['213', 266, 616, 43, 93, '#fff8e8'],
        ['212', 312, 616, 43, 93, '#fff8e8'], ['211', 358, 616, 43, 93, '#fff8e8']
      ];

      const selectableRooms = new Set(floorRooms.map(room => room.room.replace('KL-', '')));
      const zoom = state.mapZoom;
      const viewWidth = 850 / zoom;
      const viewHeight = 719 / zoom;
      const minX = (850 - viewWidth) / 2;
      const minY = (719 - viewHeight) / 2;
      const roomSvg = rooms.map(([label, x, y, w, h, fill]) => {
        const code = `KL-${label}`;
        const selectable = selectableRooms.has(label);
        const selected = activeItem && activeItem.room === code;
        return `
          <g class="map-room-node ${selected ? 'highlighted' : ''} ${selectable ? '' : 'map-room-static'}" ${selectable ? `data-room="${code}"` : ''}>
            <rect class="map-room-rect" x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff8e8" stroke="#202526" stroke-width="3"/>
            <text x="${x + w / 2}" y="${y + h / 2 + 7}" fill="#202526" font-size="${w < 60 ? 14 : 22}" font-weight="800" text-anchor="middle">${label}</text>
          </g>`;
      }).join('');

      const stairSvg = (x, y, w, h) => `
        <g class="map-stairs">
          <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#5bd4f5" stroke="#202526" stroke-width="3"/>
          <path d="M${x + 14} ${y + 18}h${w - 28}m0 12H${x + 14}m0 12h${w - 28}m0 12H${x + 14}m0 12h${w - 28}"
                stroke="#202526" stroke-width="5"/>
          <path d="M${x + w / 2} ${y + 10}v${h - 20}" stroke="#202526" stroke-width="5"/>
        </g>`;

      const stairs = floorOne
        ? `${stairSvg(767, 12, 72, 72)}${stairSvg(10, 626, 98, 83)}`
        : `${stairSvg(766, 14, 70, 82)}${stairSvg(8, 630, 98, 79)}`;
      const restroomSvg = (x, y, label) => `
        <g class="map-room-static">
          <rect x="${x}" y="${y}" width="87" height="70" rx="3" fill="#60ded8" stroke="#202526" stroke-width="3"/>
          <text x="${x + 43.5}" y="${y + 43}" fill="#202526" font-size="22" font-weight="800" text-anchor="middle">${label}</text>
        </g>`;
      const restrooms = floorOne
        ? `${restroomSvg(310, 200, 'M')}${restroomSvg(310, 291, 'W')}`
        : `${restroomSvg(310, 213, 'M')}${restroomSvg(310, 288, 'W')}`;
      const mapWidth = floorOne ? 850 : 843;
      const mapHeight = floorOne ? 719 : 715;
      const corridorX = floorOne ? 420 : 402;

      mapFrame.innerHTML = `
        <svg viewBox="${minX} ${minY} ${viewWidth} ${viewHeight}" xmlns="http://www.w3.org/2000/svg" aria-label="Ka Lama Floor ${state.activeFloor} map">
          <rect width="${mapWidth}" height="${mapHeight}" fill="#575858"/>
          <rect x="10" y="10" width="${floorOne ? 410 : 393}" height="${floorOne ? 187 : 201}" fill="#fffdf8" stroke="#202526" stroke-width="4"/>
          <text x="35" y="${floorOne ? 120 : 135}" fill="#303234" font-size="78" font-weight="800">FLOOR ${state.activeFloor}</text>
          <rect x="${corridorX}" y="10" width="52" height="${mapHeight - 20}" fill="#686a6b"/>
          ${roomSvg}
          ${restrooms}
          ${stairs}
          <rect x="${floorOne ? 450 : 445}" y="${floorOne ? 352 : 342}" width="55" height="53" rx="3" fill="#f27ad6" stroke="#202526" stroke-width="3"/>
          <text x="${floorOne ? 477 : 472}" y="${floorOne ? 387 : 377}" fill="#202526" font-size="22" font-weight="800" text-anchor="middle">E</text>
          <rect x="${floorOne ? 450 : 445}" y="${floorOne ? 412 : 405}" width="55" height="112" rx="3" fill="#5bd4f5" stroke="#202526" stroke-width="3"/>
          <path d="M${floorOne ? 477 : 472} ${floorOne ? 432 : 425}v72m-20-56h14m-14 17h14m-14 17h14m12-34h14m-14 17h14m-14 17h14" stroke="#202526" stroke-width="5"/>
        </svg>
      `;

      mapFrame.querySelectorAll('.map-room-node[data-room]').forEach(node => {
        node.addEventListener('click', () => selectRoom(node.getAttribute('data-room')));
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

    rerenderHooks.push(render);
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
          <strong>[${esc(d.code)}]</strong> · ${esc(d.name)}
        </div>
      `).join('');

      careersListEl.innerHTML = prog.careers.map(c => `
        <span class="career-chip">${esc(c)}</span>
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

    rerenderHooks.push(() => renderProgram(state.selectedProgram));
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
            <span class="event-date-month">${esc(ev.mon)}</span>
            <span class="event-date-day">${esc(ev.day)}</span>
          </div>
          <div class="event-item-info">
            <div class="event-item-title">${esc(ev.title)}</div>
            <div class="event-item-sub">🕒 ${esc(ev.time)} · 📍 ${esc(ev.location)}</div>
          </div>
        </div>
      `).join('') || `
        <div class="event-card-item">
          <div class="event-item-info">
            <div class="event-item-sub">No events listed here right now. Check back soon!</div>
          </div>
        </div>
      `;
    }

    timeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        timeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.activeEventFilter = tab.getAttribute('data-efilter');
        renderEvents();
      });
    });

    rerenderHooks.push(renderEvents);
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

  // =========================================================================
  // 13. EDITABLE CONTENT (flyers, ticker, layout...) + ADMIN PANEL HOOKS
  // =========================================================================
  function esc(value) {
    return String(value === null || value === undefined ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function buildContactsByRoom(contacts) {
    const map = {};
    contacts.forEach(contact => {
      if (!map[contact.room]) map[contact.room] = [];
      map[contact.room].push(contact);
    });
    return map;
  }

  function renderContentWidgets() {
    renderFlyers();
    renderToday();
    renderTicker();
    renderMenuBanner();
    renderFeaturedEvent();
    renderMenuTiles();
    applyAttractLayout();
    if (state.currentView === 'view-custom') renderCustomPage();
  }

  function renderFlyers() {
    const track = document.getElementById('attract-slideshow');
    const dots = document.getElementById('slideshow-dots');
    if (!track || !dots) return;

    slideIndex = 0;
    track.innerHTML = content.flyers.map((flyer, i) => {
      const theme = KioskStore.FLYER_THEMES[flyer.theme] || KioskStore.FLYER_THEMES.ocean;
      const tags = [flyer.tag1, flyer.tag2]
        .filter(Boolean)
        .map(tag => `<span class="tag-gold">${esc(tag)}</span>`)
        .join('');
      return `
        <div class="flyer-slide ${i === 0 ? 'active' : ''}" style="--flyer-bg: ${theme.css};">
          <div class="flyer-overlay"></div>
          <div class="flyer-badge">${esc(flyer.badge)}</div>
          <div class="flyer-body">
            <h2>${esc(flyer.title)}</h2>
            <p class="flyer-lead">${esc(flyer.lead)}</p>
            <div class="flyer-meta-row">${tags}</div>
          </div>
        </div>`;
    }).join('');
    dots.innerHTML = content.flyers.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}"></span>`).join('');
  }

  function renderToday() {
    const list = document.querySelector('.today-list');
    if (!list) return;
    list.innerHTML = content.today.map(item => `
      <div class="today-item">
        <div class="time-pill">${esc(item.time)}</div>
        <div class="today-details">
          <span class="item-title">${esc(item.title)}</span>
          <span class="item-sub">${esc(item.sub)}</span>
        </div>
      </div>
    `).join('') || `
      <div class="today-item">
        <div class="today-details">
          <span class="item-sub">Nothing scheduled right now.</span>
        </div>
      </div>
    `;
  }

  function renderTicker() {
    const track = document.querySelector('.ticker-track');
    if (!track) return;
    track.innerHTML = content.ticker
      .map((message, i) => `${i ? '<span class="bullet">•</span>' : ''}<span>${esc(message)}</span>`)
      .join('');
    // Keep the scroll speed steady no matter how much text there is
    const characters = content.ticker.join(' ').length;
    track.style.animationDuration = `${Math.max(20, Math.round(characters * 0.28))}s`;
  }

  function renderMenuBanner() {
    const banner = document.querySelector('.featured-banner-card');
    if (!banner) return;
    banner.style.display = content.menuBannerVisible ? '' : 'none';
    document.getElementById('banner-badge-text').textContent = content.banner.badge;
    document.getElementById('banner-title').textContent = content.banner.title;
    document.getElementById('banner-body').textContent = content.banner.body;
  }

  function renderFeaturedEvent() {
    const fe = content.featuredEvent;
    const set = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    set('feat-art-badge', fe.artBadge);
    set('feat-art-title', fe.artTitle);
    set('feat-art-text', fe.artText);
    set('feat-tag', fe.tag);
    set('feat-title', fe.title);
    set('feat-date', `📅 ${fe.date}`);
    set('feat-time', `⏰ ${fe.time}`);
    set('feat-location', `📍 ${fe.location}`);
    set('feat-summary', fe.summary);
  }

  function renderMenuTiles() {
    const grid = document.querySelector('.menu-grid-2x3');
    if (!grid) return;
    grid.innerHTML = content.menuTiles
      .filter(tile => !tile.hidden)
      .map(tile => `
        <button class="menu-tile menu-tile-${esc(tile.id)}" data-view="${esc(tile.view)}" data-tile-id="${esc(tile.id)}">
          <div class="tile-icon-circle">${KioskStore.iconSvg(tile.icon, 34)}</div>
          <div class="tile-text">
            <h3>${esc(tile.title)}</h3>
            <p>${esc(tile.subtitle)}</p>
          </div>
        </button>
      `).join('');
  }

  function renderCustomPage() {
    const tile = content.menuTiles.find(t => t.id === state.customPageId);
    const titleEl = document.getElementById('custom-page-title');
    const bodyEl = document.getElementById('custom-page-body');
    if (!tile || !titleEl || !bodyEl) return;
    titleEl.textContent = tile.title;
    bodyEl.innerHTML = esc(tile.body)
      .split(/\n{2,}/)
      .filter(Boolean)
      .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }

  function applyAttractLayout() {
    const selectors = {
      slideshow: '.slideshow-card',
      today: '.today-card',
      job: '.featured-job-card',
      ticker: '.news-ticker-bar'
    };
    content.attractWidgets.forEach((widget, index) => {
      const el = document.querySelector(selectors[widget.id]);
      if (!el) return;
      el.style.order = index;
      el.style.display = widget.visible ? '' : 'none';
    });
    const touchBanner = document.querySelector('.touch-begin-banner');
    if (touchBanner) touchBanner.style.order = 99; // always last
  }

  // Swap in new content, redraw every screen, and save it in this browser.
  // Returns true when the browser accepted the save.
  function applyContent(newContent, persist) {
    content = KioskStore.sanitize(newContent, defaultContent);
    eventsData = content.events;
    programsData = content.programs;
    contactsByRoom = buildContactsByRoom(content.contacts);
    renderContentWidgets();
    rerenderHooks.forEach(fn => fn());
    return persist === false ? true : KioskStore.save(content);
  }

  // The admin panel (admin.js) talks to the kiosk only through this object.
  window.KioskApp = {
    getContent: () => KioskStore.clone(content),
    getDefaults: () => KioskStore.clone(defaultContent),
    getRooms: () => directoryData
      .map(room => ({ room: room.room, floor: room.floor }))
      .sort((a, b) => a.floor - b.floor || a.room.localeCompare(b.room, undefined, { numeric: true })),
    applyContent,
    resetToDefaults() {
      KioskStore.reset();
      applyContent(KioskStore.clone(defaultContent), false);
    },
    setAdminOpen(open) {
      state.adminOpen = !!open;
      resetIdleTimer();
    },
    goToMenu() {
      wakeFromAttract();
      switchView('view-menu');
    }
  };
});
