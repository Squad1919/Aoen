/**
 * Mindustry Mod Studio — MAIN MENU button (no content blocks).
 *
 * MenuFragment.addButton only appends to customButtons; the menu UI is rebuilt
 * on ResizeEvent. So we must fire ResizeEvent after adding, or the button never appears.
 */
require("schema");
require("templates");
require("projects");
require("pickers");
require("form");
require("clone");
require("wizard");
const studio = require("studio");

var menuHooked = false;
var modsHooked = false;

function openStudio() {
  try {
    studio.show();
  } catch (err) {
    Log.err("[Mod Studio] open: " + err);
    try {
      Vars.ui.showInfo("Mod Studio error:\n" + err);
    } catch (e2) {}
  }
}

function rebuildMenu() {
  try {
    Events.fire(new ResizeEvent());
  } catch (e) {
    Log.warn("[Mod Studio] ResizeEvent: " + e);
  }
}

function hookMainMenu() {
  if (menuHooked) return;
  if (Vars.ui == null || Vars.ui.menufrag == null) return;

  try {
    // Preferred API
    try {
      Vars.ui.menufrag.addButton("Mod Studio", Icon.book, openStudio);
    } catch (eIcon) {
      Vars.ui.menufrag.addButton("Mod Studio", openStudio);
    }

    // Also push into desktopButtons if already initialized (extra safety)
    try {
      const frag = Vars.ui.menufrag;
      if (frag.desktopButtons != null) {
        const btn = new MenuFragment.MenuButton("Mod Studio", Icon.book, openStudio);
        // avoid duplicates
        var found = false;
        frag.desktopButtons.each(b => {
          if (b != null && ("" + b.text) === "Mod Studio") found = true;
        });
        if (!found) frag.desktopButtons.add(btn);
      }
    } catch (eDesk) {
      Log.warn("[Mod Studio] desktopButtons: " + eDesk);
    }

    menuHooked = true;
    rebuildMenu();
    // rebuild again next frame — first Resize can race
    Timer.schedule(rebuildMenu, 0.05);
    Timer.schedule(rebuildMenu, 0.5);
    Log.info("[Mod Studio] main menu button hooked");
  } catch (e) {
    Log.err("[Mod Studio] menu hook failed: " + e);
  }
}

function hookModsDialog() {
  if (modsHooked) return;
  try {
    if (Vars.ui == null || Vars.ui.mods == null) return;
    // When Mods dialog is shown, inject a top button once
    const mods = Vars.ui.mods;
    const prev = mods.shown;
    // BaseDialog.shown(Runnable) adds a listener
    mods.shown(() => {
      try {
        // Avoid stacking forever: only add if not present
        const title = mods.titleTable;
        if (title != null && title.find("mod-studio-btn") == null) {
          const b = title.button("Open Mod Studio", Icon.book, Styles.flatBordert, openStudio)
            .name("mod-studio-btn")
            .size(200, 40)
            .pad(4)
            .get();
          if (b != null) b.name = "mod-studio-btn";
        }
      } catch (e) {
        // Fallback: toast with hint
        try {
          Vars.ui.showInfoToast("Mod Studio: кнопка в главном меню / Open Mod Studio", 3);
        } catch (e2) {}
      }
    });
    modsHooked = true;
    Log.info("[Mod Studio] mods dialog hook ready");
  } catch (e) {
    Log.warn("[Mod Studio] mods dialog hook: " + e);
  }
}

function hookHudFallback() {
  // Small persistent button when menu is visible (last resort)
  try {
    Events.run(Trigger.update, () => {
      // no-op placeholder — menu rebuild is the real fix
    });
  } catch (e) {}
}

Events.on(ClientLoadEvent, e => {
  Timer.schedule(() => {
    hookMainMenu();
    hookModsDialog();
    try {
      Vars.ui.showInfoToast("[accent]Mod Studio[] — кнопка в главном меню (ниже Mods)", 5);
    } catch (err) {}
  }, 0.2);
  // Late retry: some UI packs rebuild menu after load
  Timer.schedule(hookMainMenu, 1.0);
  Timer.schedule(hookMainMenu, 2.5);
});

// Rebuild menu whenever window resizes anyway — customButtons already filled
Events.on(ResizeEvent, e => {
  // ensure hooked at least once
  if (!menuHooked) hookMainMenu();
});

Events.on(PlayerChatEvent, e => {
  try {
    const msg = ("" + e.message).trim().toLowerCase();
    if (msg === "/studio" || msg === "/modstudio") openStudio();
  } catch (err) {}
});

globalThis.modStudio = studio;
Log.info("[Mindustry Mod Studio] menu fix loaded");
