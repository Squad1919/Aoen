/**
 * Mindustry Mod Studio — opens from MAIN MENU (no content blocks).
 */
require("schema");
require("templates");
require("projects");
require("pickers");
require("form");
require("clone");
const studio = require("studio");

var menuHooked = false;

function hookMainMenu() {
  if (menuHooked) return;
  try {
    if (Vars.ui == null || Vars.ui.menufrag == null) return;
    const open = () => {
      try {
        studio.show();
      } catch (err) {
        Log.err("[Mod Studio] open: " + err);
        Vars.ui.showInfo("Mod Studio error: " + err);
      }
    };
    // Main menu button (like PatchEditor entry point)
    try {
      Vars.ui.menufrag.addButton("Mod Studio", Icon.book, open);
    } catch (e1) {
      Vars.ui.menufrag.addButton("Mod Studio", open);
    }
    menuHooked = true;
    Log.info("[Mod Studio] main menu button added");
  } catch (e) {
    Log.err("[Mod Studio] menu hook failed: " + e);
  }
}

Events.on(ClientLoadEvent, e => {
  // menufrag exists after UI load
  Timer.schedule(() => {
    hookMainMenu();
    try {
      Vars.ui.showInfoToast("[accent]Mod Studio[] — кнопка в главном меню", 4);
    } catch (err) {}
  }, 0.5);
});

// Fallback chat (optional) — does not require being in a map
Events.on(PlayerChatEvent, e => {
  try {
    const msg = ("" + e.message).trim().toLowerCase();
    if (msg === "/studio" || msg === "/modstudio") {
      studio.show();
    }
  } catch (err) {}
});

globalThis.modStudio = studio;
Log.info("[Mindustry Mod Studio] loaded — open from main menu");
