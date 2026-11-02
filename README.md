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
