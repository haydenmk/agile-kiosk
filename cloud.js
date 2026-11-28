/*
 * Online sync for the kiosk (Firebase). Loaded as an ES module.
 *
 *  - Every kiosk reads the shared content from Firestore document kiosk/content
 *    and redraws itself whenever it changes (no sign-in needed to read).
 *  - The admin panel signs in with an email + password account (created by you in
 *    the Firebase console) and writes edits to that document. Firestore rules
 *    (see README) accept writes only from those accounts.
 *
 * If firebase-config.js is missing, or Firebase cannot be reached, this file
 * does nothing and the kiosk keeps working from the copy saved in the browser.
 */
const SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';
const DOC_PATH = ['kiosk', 'content'];
const SAVE_TIMEOUT_MS = 10000;

async function start() {
  const config = window.KIOSK_FIREBASE_CONFIG;
  if (!config || !config.projectId || !config.apiKey) return;

  let appMod, authMod, fsMod;
  try {
    [appMod, authMod, fsMod] = await Promise.all([
      import(SDK + 'firebase-app.js'),
      import(SDK + 'firebase-auth.js'),
      import(SDK + 'firebase-firestore.js')
    ]);
  } catch (err) {
    console.warn('Kiosk online sync is unavailable (Firebase could not be loaded).', err);
    return;
  }

  const app = appMod.initializeApp(config);
  const auth = authMod.getAuth(app);
  // Sign-in lasts only for this tab/session, never beyond it
  await authMod.setPersistence(auth, authMod.browserSessionPersistence).catch(() => {});
  const db = fsMod.getFirestore(app);
  const contentRef = fsMod.doc(db, DOC_PATH[0], DOC_PATH[1]);

  // Only one tab/browser identity at a time; the kiosk itself never stays signed in.
  const cloud = {
    enabled: true,
    signedIn: () => !!auth.currentUser,
    // Email + password accounts that you create yourself in the Firebase console.
    // Writing is limited to those accounts' IDs in firestore.rules.
    async signInPassword(email, password) {
      const cred = await authMod.signInWithEmailAndPassword(auth, email, password);
      return { email: cred.user.email || '' };
    },
    resetPassword(email) {
      return authMod.sendPasswordResetEmail(auth, email);
    },
    signOut() {
      return authMod.signOut(auth).catch(() => {});
    },
    save(content) {
      const user = auth.currentUser;
      if (!user) return Promise.reject(Object.assign(new Error('Not signed in'), { code: 'kiosk/not-signed-in' }));
      const write = fsMod.setDoc(contentRef, {
        json: JSON.stringify(content),
        updatedAt: fsMod.serverTimestamp(),
        updatedBy: user.email || ''
      });
      const timeout = new Promise((_, reject) => setTimeout(
        () => reject(Object.assign(new Error('Timed out'), { code: 'kiosk/timeout' })), SAVE_TIMEOUT_MS));
      return Promise.race([write, timeout]);
    }
  };
  window.KioskCloud = cloud;

  // Follow the shared content
  let lastApplied = null;
  function whenKioskReady(fn) {
    if (window.KioskApp) { fn(); return; }
    const timer = setInterval(() => {
      if (window.KioskApp) { clearInterval(timer); fn(); }
    }, 100);
  }

  fsMod.onSnapshot(contentRef, snap => {
    if (snap.metadata.hasPendingWrites || !snap.exists()) return; // our own write in flight, or nothing saved yet
    const json = snap.data().json;
    if (typeof json !== 'string' || json === lastApplied) return;
    let parsed;
    try {
      parsed = JSON.parse(json);
    } catch (err) {
      console.warn('Shared kiosk content was not valid JSON; ignoring it.');
      return;
    }
    lastApplied = json;
    whenKioskReady(() => window.KioskApp.applyContent(parsed));
  }, err => {
    console.warn('Kiosk online sync stopped.', err);
  });
}

start();
