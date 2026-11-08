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

**Sign in:** type your email address (an on-screen keyboard is built in). Only emails listed in [`approved-emails.js`](approved-emails.js) are let in. To add or remove people, edit that file on GitHub and commit. The list ships with a placeholder (`admin@example.com`) that can never sign in, so **replace it with your real addresses**.

| Tab | What you can edit |
| :--- | :--- |
| **Events** | Main Menu announcement banner, the featured event card, and the This Week / This Month / Special Occasions event list |
| **Flyers** | Attract-screen flyer slideshow (add, remove, reorder, change colors) |
| **News bar** | The scrolling text at the bottom of the attract screen |
| **Classes** | "Today in Ka Lama" schedule, plus each program's description, degrees and career paths |
| **People** | Program advisor names/emails and directory contacts (name + email per room) |
| **Layout** | Add, remove, hide and reorder Main Menu tiles (including custom info pages), and show/hide/reorder attract-screen cards |
| **Backup** | Download / restore a backup file, or reset to defaults |

Changes appear on the kiosk immediately. The panel signs itself out after 5 minutes without a touch.

### Where edits are saved (important)

There is no server, so edits are stored in **that kiosk browser's local storage**. They survive reloads, restarts and power cycles on the same device and browser profile. They are lost if the browser's site data is cleared, if it runs in private/incognito mode, or if you open the kiosk in a different browser or on another computer. Edits are **not** written back to GitHub, so use **Backup → Download backup file** after big changes.

### Security note

The email check runs in the browser, so it keeps casual users away from the admin panel but is **not strong security** (someone with browser developer tools could bypass it). This repository is public, so the emails in `approved-emails.js` are visible to anyone. Don't use this panel to protect sensitive data.

### Admin files

- `content-store.js`: saves/loads edits and validates data
- `admin.js` / `admin.css`: the admin panel itself
- `approved-emails.js`: who may sign in (edit through GitHub)

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
