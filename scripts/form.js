/**
 * Form state → HJSON (and parse simple HJSON flat fields back).
 */
const schema = require("schema");

exports.newState = function (kindId, contentId) {
  const fields = schema.schemasFor(kindId);
  const state = { __kind: kindId, __id: contentId || "unnamed" };
  fields.forEach(f => {
    state[f[0]] = f[2];
  });
  // default weapon name from id
  if (kindId.indexOf("unit") === 0) {
    state["weapon.name"] = (contentId || "gun") + "-gun";
    state["weapon.x"] = "4";
    state["weapon.y"] = "0";
    state["weapon.reload"] = "20";
    state["weapon.rotate"] = "true";
    state["weapon.mirror"] = kindId.indexOf("flying") >= 0 ? "false" : "true";
    state["weapon.shootSound"] = "shoot";
    state["weapon.bullet.type"] = "BasicBulletType";
    state["weapon.bullet.damage"] = "20";
    state["weapon.bullet.speed"] = "3.2";
    state["weapon.bullet.lifetime"] = "40";
    state["weapon.bullet.width"] = "7";
    state["weapon.bullet.height"] = "9";
    state["weapon.bullet.splashDamage"] = "0";
    state["weapon.bullet.splashDamageRadius"] = "0";
    state["weapon.bullet.status"] = "";
    state["weapon.bullet.statusDuration"] = "60";
    state["weapon.bullet.frontColor"] = "ddeeff";
    state["weapon.bullet.backColor"] = "445566";
  }
  if (kindId === "turret") {
    state.type = "ItemTurret";
    state.category = "turret";
  }
  if (kindId === "drill") {
    state.type = "Drill";
    state.category = "production";
  }
  if (kindId === "crafter") {
    state.type = "GenericCrafter";
    state.category = "crafting";
  }
  if (kindId === "wall") {
    state.type = "Wall";
    state.category = "defense";
    state.size = "1";
  }
  if (kindId === "factory") {
    state.type = "UnitFactory";
    state.category = "units";
    state.size = "3";
  }
  if (kindId === "unit-legs") state.type = "legs";
  if (kindId === "unit-mech") state.type = "mech";
  if (kindId === "unit-flying") state.type = "flying";
  if (kindId === "unit-naval") state.type = "naval";
  return state;
};

function line(key, val) {
  return key + ": " + val + "\n";
}

exports.toHjson = function (state) {
  const kind = state.__kind;
  const id = state.__id;
  let out = "";

  if (kind === "item" || kind === "status") {
    Object.keys(state).forEach(k => {
      if (k.indexOf("__") === 0) return;
      if (state[k] === "" || state[k] == null) return;
      out += line(k, state[k]);
    });
    return out;
  }

  // top-level non-weapon fields
  Object.keys(state).forEach(k => {
    if (k.indexOf("__") === 0) return;
    if (k.indexOf("weapon.") === 0) return;
    if (state[k] === "" || state[k] == null) return;
    out += line(k, state[k]);
  });

  if (kind.indexOf("unit") === 0) {
    out += "weapons: [\n";
    out += "  {\n";
    out += "    name: " + (state["weapon.name"] || id + "-gun") + "\n";
    out += "    x: " + (state["weapon.x"] || "0") + "\n";
    out += "    y: " + (state["weapon.y"] || "0") + "\n";
    out += "    reload: " + (state["weapon.reload"] || "20") + "\n";
    out += "    rotate: " + (state["weapon.rotate"] || "true") + "\n";
    out += "    mirror: " + (state["weapon.mirror"] || "false") + "\n";
    out += "    shootSound: " + (state["weapon.shootSound"] || "shoot") + "\n";
    out += "    bullet: {\n";
    out += "      type: " + (state["weapon.bullet.type"] || "BasicBulletType") + "\n";
    out += "      damage: " + (state["weapon.bullet.damage"] || "10") + "\n";
    out += "      speed: " + (state["weapon.bullet.speed"] || "3") + "\n";
    out += "      lifetime: " + (state["weapon.bullet.lifetime"] || "40") + "\n";
    out += "      width: " + (state["weapon.bullet.width"] || "7") + "\n";
    out += "      height: " + (state["weapon.bullet.height"] || "9") + "\n";
    if (parseFloat(state["weapon.bullet.splashDamage"] || "0") > 0) {
      out += "      splashDamage: " + state["weapon.bullet.splashDamage"] + "\n";
      out += "      splashDamageRadius: " + (state["weapon.bullet.splashDamageRadius"] || "8") + "\n";
    }
    if (state["weapon.bullet.status"]) {
      out += "      status: " + state["weapon.bullet.status"] + "\n";
      out += "      statusDuration: " + (state["weapon.bullet.statusDuration"] || "60") + "\n";
    }
    out += "      frontColor: " + (state["weapon.bullet.frontColor"] || "ffffff") + "\n";
    out += "      backColor: " + (state["weapon.bullet.backColor"] || "666666") + "\n";
    out += "    }\n";
    out += "  }\n";
    out += "]\n";
    out += "research: {\n  parent: core-nucleus\n}\n";
  }

  if (kind === "turret") {
    out += "ammoTypes: {\n";
    out += "  copper: {\n";
    out += "    type: BasicBulletType\n";
    out += "    damage: 18\n";
    out += "    speed: 4\n";
    out += "    lifetime: 45\n";
    out += "    width: 7\n";
    out += "    height: 9\n";
    out += "  }\n";
    out += "}\n";
    out += "requirements: [\n  copper/60\n  lead/40\n]\n";
    out += "research: {\n  parent: duo\n}\n";
  }

  if (kind === "crafter") {
    out += "consumes: {\n  power: 1.2\n  items: [\n    copper/1\n  ]\n}\n";
    if (!state.outputItem) out += "outputItem: graphite/1\n";
    out += "requirements: [\n  copper/50\n  lead/30\n]\n";
    out += "research: {\n  parent: graphite-press\n}\n";
  }

  if (kind === "drill") {
    out += "consumes: {\n  power: 0.8\n}\n";
    out += "requirements: [\n  copper/40\n  lead/30\n]\n";
    out += "research: {\n  parent: pneumatic-drill\n}\n";
  }

  if (kind === "wall") {
    out += "requirements: [\n  copper/12\n]\n";
    out += "research: {\n  parent: copper-wall\n}\n";
  }

  if (kind === "factory") {
    out += "consumes: {\n  power: 1.2\n}\n";
    out += "itemCapacity: 10\n";
    out += "plans: [\n  {\n    unit: dagger\n    time: 900\n    requirements: [\n      silicon/10\n      lead/10\n    ]\n  }\n]\n";
    out += "requirements: [\n  copper/80\n  lead/60\n  silicon/40\n]\n";
    out += "research: {\n  parent: ground-factory\n}\n";
  }

  return out;
};

/** Flatten simple key: value lines into state (ignores nested blocks). */
exports.applyFlatHjson = function (state, text) {
  const lines = ("" + text).split("\n");
  lines.forEach(line => {
    const m = /^\s*([a-zA-Z0-9_.-]+):\s*(.+?)\s*$/.exec(line);
    if (!m) return;
    if (m[1] === "weapons" || m[1] === "research" || m[1] === "requirements" || m[1] === "consumes" || m[1] === "ammoTypes" || m[1] === "plans" || m[1] === "parts" || m[1] === "bullet") return;
    if (state.hasOwnProperty(m[1]) || true) {
      state[m[1]] = m[2];
    }
  });
  return state;
};
