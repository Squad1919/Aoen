/**
 * Visual selectors — PatchEditor-style pickers for content/color/sound/effect/texture.
 */
const schema = require("schema");

exports.pickString = function (title, options, current, onPick) {
  const d = new BaseDialog(title);
  const search = new TextField("");
  const list = new Table();
  function rebuild() {
    list.clearChildren();
    list.top().defaults().growX().height(36).pad(1);
    const q = ("" + search.getText()).toLowerCase();
    options.forEach(opt => {
      const s = "" + opt;
      if (q && s.toLowerCase().indexOf(q) < 0) return;
      const mark = s === current ? "[accent]> []" : "";
      list.button(mark + s, Styles.flatBordert, () => {
        onPick(s);
        d.hide();
      }).row();
    });
  }
  d.cont.add(search).growX().pad(6).row();
  search.changed(rebuild);
  d.cont.pane(list).grow();
  d.buttons.button("@back", () => d.hide()).size(140, 50);
  rebuild();
  d.show();
};

exports.pickBool = function (current, onPick) {
  exports.pickString("Boolean", ["true", "false"], current ? "true" : "false", v => onPick(v === "true"));
};

exports.pickColor = function (current, onPick) {
  const d = new BaseDialog("Color");
  const field = new TextField(current || "ffffff");
  d.cont.add("Hex RRGGBB").row();
  d.cont.add(field).growX().pad(6).row();
  const pal = d.cont.table().growX().get();
  const colors = [
    "ffffff", "000000", "ff6644", "ffaa44", "ffe080", "88cc66", "66e0c8",
    "66aacc", "6688ff", "aa66ff", "ff66aa", "b81428", "8899aa", "445566"
  ];
  colors.forEach((c, i) => {
    pal.button(c, Styles.flatBordert, () => {
      field.setText(c);
    }).size(70, 32);
    if ((i + 1) % 4 === 0) pal.row();
  });
  d.buttons.button("@back", () => d.hide()).size(120, 48);
  d.buttons.button("@ok", () => {
    onPick(("" + field.getText()).replace("#", ""));
    d.hide();
  }).size(120, 48);
  d.show();
};

exports.pickSound = function (current, onPick) {
  exports.pickString("Sound", schema.sounds, current || "shoot", onPick);
};

exports.pickEffect = function (current, onPick) {
  exports.pickString("Effect", schema.effects, current || "none", onPick);
};

exports.pickCategory = function (current, onPick) {
  exports.pickString("Category", schema.categories, current || "crafting", onPick);
};

exports.pickVisibility = function (current, onPick) {
  exports.pickString("BuildVisibility", schema.visibilities, current || "shown", onPick);
};

exports.pickBulletType = function (current, onPick) {
  exports.pickString("BulletType", schema.bulletTypes, current || "BasicBulletType", onPick);
};

exports.pickContent = function (type, current, onPick) {
  const opts = [];
  try {
    if (type === "item" || type === "content:item") {
      Vars.content.items().each(i => opts.push(i.name));
    } else if (type === "block" || type === "content:block") {
      Vars.content.blocks().each(b => opts.push(b.name));
    } else if (type === "unit" || type === "content:unit") {
      Vars.content.units().each(u => opts.push(u.name));
    } else if (type === "status" || type === "content:status") {
      Vars.content.statusEffects().each(s => opts.push(s.name));
    } else if (type === "liquid" || type === "content:liquid") {
      Vars.content.liquids().each(l => opts.push(l.name));
    } else {
      Vars.content.items().each(i => opts.push(i.name));
    }
  } catch (e) {
    Log.warn("[Studio] pickContent: " + e);
  }
  exports.pickString("Content (" + type + ")", opts, current || "", onPick);
};

exports.pickTexture = function (current, onPick) {
  // Browse atlas region names (capped)
  const opts = [];
  try {
    const atlas = Core.atlas;
    // Common prefixes for browsing
    const prefixes = ["duo", "hail", "ripple", "dagger", "mace", "flare", "risso", "atrax", "toxopid", "copper", "silicon"];
    prefixes.forEach(p => {
      opts.push(p);
      opts.push(p + "-preview");
      opts.push(p + "-leg");
      opts.push(p + "-cell");
    });
    // Also dump some from content icons
    Vars.content.blocks().each(b => {
      if (opts.length > 400) return;
      if (b.region != null && b.region.found && b.region.found()) opts.push(b.name);
    });
  } catch (e) {}
  exports.pickString("Texture / region name", opts, current || "", onPick);
};

exports.pickFieldValue = function (fieldType, current, onPick) {
  if (fieldType === "bool") return exports.pickBool(current === true || current === "true", v => onPick("" + v));
  if (fieldType === "color") return exports.pickColor(current, onPick);
  if (fieldType === "sound") return exports.pickSound(current, onPick);
  if (fieldType === "effect") return exports.pickEffect(current, onPick);
  if (fieldType === "category") return exports.pickCategory(current, onPick);
  if (fieldType === "visibility") return exports.pickVisibility(current, onPick);
  if (fieldType === "bullet") return exports.pickBulletType(current, onPick);
  if (fieldType.indexOf("content:") === 0) return exports.pickContent(fieldType, current, onPick);
  if (fieldType === "texture") return exports.pickTexture(current, onPick);
  // number / string — inline dialog
  const d = new BaseDialog("Edit value");
  const f = new TextField(current == null ? "" : "" + current);
  d.cont.add(f).growX().pad(10).row();
  d.buttons.button("@back", () => d.hide()).size(120, 48);
  d.buttons.button("@ok", () => {
    onPick(f.getText());
    d.hide();
  }).size(120, 48);
  d.show();
};
