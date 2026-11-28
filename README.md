# UHMC Business Department — Ka Lama Interactive Kiosk

An interactive touchscreen digital signage web application prototype designed for the two 43” commercial touchscreen kiosks on the 1st and 2nd floors of the Ka Lama building at **University of Hawaiʻi Maui College (UHMC)**.

Built in exact accordance with the 8-screen wireframe specifications in [`UHMC Kiosk Lo-Fi Wireframes.pdf`](UHMC%20Kiosk%20Lo-Fi%20Wireframes.pdf) using official UHMC brand styling (UHMC Ocean Blue Pantone 3025 C `#004f6e`, Deep Teal `#00313c`, and UHMC Gold Pantone 7549 C `#ffb600`).

---

## 📱 8 Wireframe Screen Architecture

| Wireframe Screen | View ID | Description |
| :--- | :--- | :--- |
| **Page 1: Attract Screen** | `#view-attract` | Rotating flyer slideshow with 5 dot indicators, "Today in Ka Lama" schedule preview, featured job posting with scan-to-apply QR code, animated scrolling news ticker, and high-visibility bottom *"Touch anywhere to begin"* bar. |
| **Page 2: Main Menu** | `#view-menu` | Top featured upcoming announcement banner, 2×3 touch tile grid (Programs, Directory, Jobs, Events, Survey, Website), and persistent bottom status bar with 60s idle countdown. |
| **Page 3: Building Directory** | `#view-directory` | Interactive SVG floor plan for Ka Lama 1st & 2nd floors with active room highlight, walking path route from kiosk location, (+) / (−) zoom controls, search bar, and category filter chips (*Offices, Classrooms, Labs, Restrooms, Elevator & Stairs*). |
| **Page 4: Business Programs** | `#view-programs` | Program overview hero banner, degrees & certificates list (*AAS, AS, CA, CO, BAS*), career paths chips, faculty advisor contact card with QR code, and bottom program selector tabs (*Business, Hospitality, Accounting, ABIT*). |
| **Page 5: Job Opportunities** | `#view-jobs` | Selected job highlight hero card with 2×2 specs grid (*Pay, Schedule, Location, Deadline*), mobile apply QR code, job category filters (*All, Business, Hospitality, Accounting, ABIT/Tech, Internships*), and paginated job list rows. |
| **Page 6: Events & News** | `#view-events` | Featured event flyer showcase with RSVP QR code, time filters (*This Week, This Month, Special Occasions*), and calendar event cards with month/day badges. |
| **Page 7: Student Survey** | `#view-survey` | Multi-step anonymous survey (*Questions 1–3*) with progress bar, multi-select checkmark pills, on-screen virtual keyboard for custom ideas (*"Other"*), and live aggregated percentage feedback visualization. |
| **Page 8: UHMC Website** | `#view-website` | Embedded campus web access portal with read-only URL bar (`maui.hawaii.edu`), browser navigation controls (*Back, Forward, Reload, Home, Keyboard*), 2-minute idle session reset guard, and verified portal shortcuts. |

---

## 🛠️ Admin Panel (edit the kiosk without touching code)

Staff can update kiosk content right on the touchscreen.

**Open it:** press and hold the **UHMC** badge in the top-left corner for about 1.5 seconds (on a desktop you can also press `Ctrl + Shift + A`).

**Sign in:** type your approved email address and the shared admin password (an on-screen keyboard is built in). The approved emails and the password both live in [`approved-emails.js`](approved-emails.js). To add or remove people or change the password, edit that file on GitHub and commit, then refresh the kiosk. Emails are not case-sensitive; the password is. After 5 wrong attempts, sign-in locks for 60 seconds.

| Tab | What you can edit |
| :--- | :--- |
| **Events** | The featured event card, and an **event calendar**: tap a day, add events with name, info, date, start/end time (or all day), building and room. Several events can share the same day and time |
| **Slideshow** | The full-screen photo slides on the welcome screen: choose a photo, badge, title, tagline and gold tag (add, remove, reorder) |
| **Programs** | Each program's description, degrees and career paths |
| **People** | Program advisor names/emails and directory contacts (name + email per room) |
| **Layout** | Add, remove, hide and reorder Main Menu tiles, change each tile's photo, and create custom info pages |
| **Backup** | Download / restore a backup file, or reset to defaults |

The Events & News page is driven by the calendar dates: **This Week** shows today through the next 6 days, **This Month** shows the rest of the current month, and **Special Occasions** shows upcoming events marked as special. Past events are hidden automatically. The sample events that ship with the kiosk are placed relative to today as placeholders.

Changes appear on the kiosk immediately. The panel signs itself out after 5 minutes without a touch.

**Photos:** the slideshow and tile editors list the photos in `assets/images/`. To offer a new photo, add the file to that folder on GitHub and add one line for it to the `IMAGES` list in `content-store.js` (you can also type any `assets/...` path or web address directly).

### Online sync with Firebase (shared across devices)

When `firebase-config.js` is present, edits are saved to a free Firebase project, and every kiosk or browser that opens the page shows the same content within a few seconds. Admins sign in with an **approved email and a password that you create for them** in the Firebase console (**Authentication → Users → Add user**), so nobody has to register. **Forgot password?** emails a reset link, so each admin can choose their own password after you give them a temporary one. The Firestore rules in [`firestore.rules`](firestore.rules) let only the listed account IDs write, so a stranger who registers with an approved email still can't save anything. Anyone can read, because the kiosk screens need the content.

One-time setup in the Firebase console: create a project, register a web app and paste its config into `firebase-config.js`, create a Firestore database, enable **Authentication → Sign-in method → Email/Password** (leave "Email link" off), add your site's domain (for example `haydenmk.github.io`) under **Authentication → Settings → Authorized domains**, add each admin under **Authentication → Users**, and publish `firestore.rules` with those users' **User UID** values. When you add or remove an admin, update **both** `approved-emails.js` and the UID list in `firestore.rules`.

Each browser keeps a copy of the latest content, so a kiosk that loses internet keeps showing it. If Firebase can't be loaded at all, the panel falls back to the older email + shared password sign-in and saves only in that browser.

### Where edits are saved without Firebase

Without Firebase there is no server, so edits are stored in **that kiosk browser's local storage**. They survive reloads, restarts and power cycles on the same device and browser profile. They are lost if the browser's site data is cleared, if it runs in private/incognito mode, or if you open the kiosk in a different browser or on another computer. Use **Backup → Download backup file** after big changes.

### Security note

With Firebase on, the real protection is the Firestore rules, which check the signed-in account on Google's servers. Without Firebase, the sign-in check runs in the browser and is **not strong security**, and since this repository is public, the emails **and the password** in `approved-emails.js` are visible to anyone. Don't use this panel to protect sensitive data.

### Admin files

- `content-store.js`: saves/loads edits and validates data
- `admin.js` / `admin.css`: the admin panel itself
- `approved-emails.js`: who may sign in, and the fallback password (edit through GitHub)
- `cloud.js` / `firebase-config.js` / `firestore.rules`: online sync with Firebase

---

## 🚀 How to Run Locally

Because this prototype is built with standard web technologies (HTML5, CSS3, JavaScript), there are no complex build steps required:

1. Double-click [`index.html`](index.html) to open directly in any browser.
2. Or run a quick local server:
   ```powershell
   npx serve .
   # or
   python -m http.server 8080
   ```
   Then navigate to `http://localhost:8080`.

3. **Display Modes**:
   - Use the **Fit Window / Portrait Kiosk** button in the top bar to toggle between the 9:16 vertical bezel framing (simulating a physical 43" kiosk) and full-window mode.
   - Use the **Fullscreen** button for kiosk demonstrations.
