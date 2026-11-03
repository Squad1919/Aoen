/**
 * Mindustry Mod Studio — PatchEditor-class mod authoring.
 * Open: /studio  |  Studio Terminal (sandbox configure)
 */
require("schema");
require("templates");
require("projects");
require("pickers");
require("form");
require("clone");
const studio = require("studio");
require("blocks");

Events.on(ClientLoadEvent, e => {
  Timer.schedule(() => {
    try {
      Vars.ui.showInfoToast("[accent]Mod Studio[] ready — /studio  (fields • pickers • magic clone)", 5);
    } catch (err) {}
  }, 1.5);
});

Events.on(PlayerChatEvent, e => {
  try {
    const msg = ("" + e.message).trim().toLowerCase();
    if (msg === "/studio" || msg === "/modstudio" || msg === "studio") {
      studio.show();
      if (e.player != null) e.player.sendMessage("[accent]Mod Studio[] opened");
    }
  } catch (err) {
    Log.err(err);
  }
});

globalThis.modStudio = studio;
Log.info("[Mindustry Mod Studio] PatchEditor-style UI loaded");
