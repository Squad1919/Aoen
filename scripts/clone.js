/**
 * Magic Clone — dump loaded content into HJSON for a project (PatchEditor Magic Export analog).
 */
const projects = require("projects");

function safe(v) {
  if (v == null) return null;
  return v;
}

exports.cloneUnit = function (unit, projectName, newId) {
  if (unit == null) throw new Error("no unit");
  const id = newId || ("" + unit.name).replace(/^.*-/, "") + "-clone";
  let h = "";
  // Detect type roughly
  let type = "mech";
  try {
    if (unit.flying) type = "flying";
    else if (unit.naval) type = "naval";
    else if (unit.legCount > 0) type = "legs";
  } catch (e) {}
  h += "type: " + type + "\n";
  h += "outlines: false\n";
  h += "health: " + unit.health + "\n";
  h += "armor: " + unit.armor + "\n";
  h += "speed: " + unit.speed + "\n";
  h += "hitSize: " + unit.hitSize + "\n";
  h += "rotateSpeed: " + unit.rotateSpeed + "\n";
  h += "range: " + unit.range + "\n";
  if (type === "flying") {
    h += "flying: true\nlowAltitude: true\n";
    try {
      h += "engineOffset: " + unit.engineOffset + "\n";
      h += "engineSize: " + unit.engineSize + "\n";
    } catch (e) {}
  }
  if (type === "legs") {
    try {
      h += "legCount: " + unit.legCount + "\n";
      h += "legLength: " + unit.legLength + "\n";
      h += "legSpeed: " + unit.legSpeed + "\n";
      h += "legBaseOffset: " + unit.legBaseOffset + "\n";
      h += "lockLegBase: true\nallowLegStep: true\nlegContinuousMove: true\nhovering: true\n";
    } catch (e) {}
  }
  h += "weapons: [\n";
  try {
    if (unit.weapons != null) {
      for (var i = 0; i < unit.weapons.size; i++) {
        const w = unit.weapons.get(i);
        const wname = id + "-w" + i;
        h += "  {\n";
        h += "    name: " + wname + "\n";
        h += "    x: " + w.x + "\n";
        h += "    y: " + w.y + "\n";
        h += "    reload: " + w.reload + "\n";
        h += "    rotate: " + !!w.rotate + "\n";
        h += "    mirror: " + !!w.mirror + "\n";
        if (w.bullet != null) {
          h += "    bullet: {\n";
          h += "      type: BasicBulletType\n";
          h += "      damage: " + w.bullet.damage + "\n";
          h += "      speed: " + (w.bullet.speed || 3) + "\n";
          h += "      lifetime: " + (w.bullet.lifetime || 40) + "\n";
          h += "      width: " + (w.bullet.width || 8) + "\n";
          h += "      height: " + (w.bullet.height || 10) + "\n";
          if (w.bullet.splashDamage > 0) {
            h += "      splashDamage: " + w.bullet.splashDamage + "\n";
            h += "      splashDamageRadius: " + w.bullet.splashDamageRadius + "\n";
          }
          h += "    }\n";
        }
        h += "  }\n";
      }
    }
  } catch (e) {
    h += "  # weapon dump failed: " + e + "\n";
  }
  h += "]\n";
  h += "research: {\n  parent: core-nucleus\n}\n";
  const path = projects.writeContent(projectName, "content/units", id, h);
  projects.writePlaceholderSprite(projectName, "sprites/units/" + id + ".png", 64);
  projects.writePlaceholderSprite(projectName, "sprites/units/" + id + "-preview.png", 64);
  return { id: id, path: path, hjson: h };
};

exports.cloneBlock = function (block, projectName, newId) {
  if (block == null) throw new Error("no block");
  const id = newId || ("" + block.name).replace(/^.*-/, "") + "-clone";
  let h = "";
  h += "type: " + block.class.getSimpleName() + "\n";
  h += "outlineIcon: false\n";
  try {
    h += "category: " + block.category + "\n";
  } catch (e) {
    h += "category: effect\n";
  }
  h += "size: " + block.size + "\n";
  h += "health: " + block.health + "\n";
  h += "requirements: [\n  copper/20\n]\n";
  h += "research: {\n  parent: core-nucleus\n}\n";
  h += "# Cloned from " + block.name + " — refine type/fields manually.\n";
  const path = projects.writeContent(projectName, "content/blocks", id, h);
  projects.writePlaceholderSprite(projectName, "sprites/blocks/" + id + ".png", 32 * block.size);
  return { id: id, path: path, hjson: h };
};

exports.cloneItem = function (item, projectName, newId) {
  if (item == null) throw new Error("no item");
  const id = newId || ("" + item.name).replace(/^.*-/, "") + "-clone";
  let h = "";
  h += "hardness: " + item.hardness + "\n";
  h += "cost: " + item.cost + "\n";
  try {
    h += "color: " + item.color.toString().substring(0, 6) + "\n";
  } catch (e) {
    h += "color: 8899aa\n";
  }
  const path = projects.writeContent(projectName, "content/items", id, h);
  projects.writePlaceholderSprite(projectName, "sprites/items/" + id + ".png", 32);
  return { id: id, path: path, hjson: h };
};

exports.browseAndClone = function (projectName, onDone) {
  const d = new BaseDialog("Magic Clone (vanilla/mod → project)");
  const tabs = d.cont.table().grow().get();
  function listContent(title, seq, cloner) {
    const t = new Table();
    t.top().defaults().growX().height(34).pad(1);
    const search = new TextField("");
    const box = new Table();
    function rebuild() {
      box.clearChildren();
      box.top().defaults().growX().height(34).pad(1);
      const q = ("" + search.getText()).toLowerCase();
      seq.each(c => {
        const n = c.name;
        const label = c.localizedName + " [" + n + "]";
        if (q && label.toLowerCase().indexOf(q) < 0) return;
        box.button(label, Styles.flatBordert, () => {
          try {
            const r = cloner(c);
            if (onDone) onDone(r);
            Vars.ui.showInfoToast("Cloned → " + r.id, 3);
            d.hide();
          } catch (e) {
            Vars.ui.showInfo("Clone failed: " + e);
          }
        }).row();
      });
    }
    t.add(search).growX().row();
    search.changed(rebuild);
    t.add(new ScrollPane(box)).grow();
    rebuild();
    return t;
  }
  // simple stacked sections
  d.cont.pane(p => {
    p.add("[accent]Units[]").left().row();
    p.add(listContent("Units", Vars.content.units(), u => exports.cloneUnit(u, projectName))).height(220).growX().row();
    p.add("[accent]Blocks[]").left().padTop(8).row();
    p.add(listContent("Blocks", Vars.content.blocks(), b => exports.cloneBlock(b, projectName))).height(220).growX().row();
    p.add("[accent]Items[]").left().padTop(8).row();
    p.add(listContent("Items", Vars.content.items(), i => exports.cloneItem(i, projectName))).height(180).growX().row();
  }).grow();
  d.buttons.button("@back", () => d.hide()).size(160, 50);
  d.show();
};
