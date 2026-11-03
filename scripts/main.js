/**
 * Mindustry Mod Studio — entry.
 * Open: chat /studio | configure Studio Terminal / Studio Bench (sandbox)
 */
require("templates");
require("projects");
const studio = require("studio");
require("blocks");

Events.on(ClientLoadEvent, e => {
  Timer.schedule(() => {
    try {
      Vars.ui.showInfoToast("[accent]Mindustry Mod Studio[] — type /studio", 5);
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

Log.info("[Mindustry Mod Studio] ready — /studio");
