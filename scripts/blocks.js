/**
 * Wire Studio Terminal / Bench to open the studio UI.
 */
const studio = require("studio");

function open() {
  studio.show();
}

function hookNamed(fullName, BuildParent) {
  const b = Vars.content.block(fullName);
  if (b == null) {
    Log.warn("[Studio] block missing: " + fullName);
    return;
  }
  b.configurable = true;
  b.saveConfig = false;
  b.buildType = () =>
    extend(BuildParent, {
      buildConfiguration(table) {
        table.button("Open Mod Studio", Icon.book, Styles.cleart, () => {
          open();
        }).width(240).height(50);
        table.row();
        table.button("/studio chat also works", Styles.cleart, () => {
          Vars.ui.showInfo("Type /studio in chat anytime.");
        }).width(240).height(40);
      },
      configured(player, value) {
        open();
      }
    });
  Log.info("[Studio] hooked " + fullName);
}

Events.on(ClientLoadEvent, e => {
  Timer.schedule(() => {
    try {
      hookNamed("mindustry-mod-studio-studio-terminal", OverflowGate.OverflowGateBuild);
    } catch (err) {
      Log.err("[Studio] terminal hook: " + err);
    }
    try {
      hookNamed("mindustry-mod-studio-studio-bench", Router.RouterBuild);
    } catch (err) {
      Log.err("[Studio] bench hook: " + err);
    }
  }, 0.4);
});
