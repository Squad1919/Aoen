/**
 * Content templates for Mindustry Mod Studio (HJSON snippets).
 */
exports.item = function (id) {
  return (
    "hardness: 1\n" +
    "cost: 1\n" +
    "color: 8899aa\n" +
    "flammability: 0\n" +
    "radioactivity: 0\n" +
    "explosiveness: 0\n"
  );
};

exports.status = function (id) {
  return (
    "damage: 0.2\n" +
    "color: ff6644\n" +
    "speedMultiplier: 0.9\n" +
    "reloadMultiplier: 1\n" +
    "disarm: false\n" +
    "show: true\n"
  );
};

exports.unitLegs = function (id) {
  return (
    "type: legs\n" +
    "outlines: false\n" +
    "health: 700\n" +
    "armor: 5\n" +
    "speed: 0.6\n" +
    "hitSize: 11\n" +
    "rotateSpeed: 2.5\n" +
    "range: 50\n" +
    "legCount: 6\n" +
    "legLength: 14\n" +
    "legSpeed: 0.3\n" +
    "legBaseOffset: 3\n" +
    "legExtension: -7\n" +
    "lockLegBase: true\n" +
    "allowLegStep: true\n" +
    "legContinuousMove: true\n" +
    "hovering: true\n" +
    "weapons: [\n" +
    "  {\n" +
    "    name: " + id + "-gun\n" +
    "    x: 5\n" +
    "    y: 0\n" +
    "    reload: 20\n" +
    "    rotate: true\n" +
    "    mirror: true\n" +
    "    shootSound: shoot\n" +
    "    bullet: {\n" +
    "      type: BasicBulletType\n" +
    "      damage: 20\n" +
    "      speed: 3.2\n" +
    "      lifetime: 40\n" +
    "      width: 7\n" +
    "      height: 9\n" +
    "      frontColor: ddeeff\n" +
    "      backColor: 445566\n" +
    "    }\n" +
    "  }\n" +
    "]\n" +
    "research: {\n" +
    "  parent: core-nucleus\n" +
    "}\n"
  );
};

exports.unitMech = function (id) {
  return (
    "type: mech\n" +
    "outlines: false\n" +
    "health: 650\n" +
    "armor: 5\n" +
    "speed: 0.55\n" +
    "hitSize: 10\n" +
    "rotateSpeed: 3\n" +
    "range: 48\n" +
    "weapons: [\n" +
    "  {\n" +
    "    name: " + id + "-gun\n" +
    "    x: 4\n" +
    "    y: 0\n" +
    "    reload: 18\n" +
    "    rotate: true\n" +
    "    mirror: true\n" +
    "    shootSound: shoot\n" +
    "    bullet: {\n" +
    "      type: BasicBulletType\n" +
    "      damage: 18\n" +
    "      speed: 3.5\n" +
    "      lifetime: 35\n" +
    "      width: 6\n" +
    "      height: 8\n" +
    "    }\n" +
    "  }\n" +
    "]\n" +
    "research: {\n" +
    "  parent: core-nucleus\n" +
    "}\n"
  );
};

exports.unitFlying = function (id) {
  return (
    "type: flying\n" +
    "outlines: false\n" +
    "flying: true\n" +
    "lowAltitude: true\n" +
    "health: 400\n" +
    "armor: 2\n" +
    "speed: 2.2\n" +
    "accel: 0.08\n" +
    "drag: 0.03\n" +
    "hitSize: 9\n" +
    "rotateSpeed: 4\n" +
    "range: 42\n" +
    "engineOffset: 5\n" +
    "engineSize: 2.5\n" +
    "weapons: [\n" +
    "  {\n" +
    "    name: " + id + "-gun\n" +
    "    x: 0\n" +
    "    y: 2\n" +
    "    reload: 16\n" +
    "    rotate: true\n" +
    "    shootSound: shoot\n" +
    "    bullet: {\n" +
    "      type: BasicBulletType\n" +
    "      damage: 14\n" +
    "      speed: 3.8\n" +
    "      lifetime: 36\n" +
    "      width: 6\n" +
    "      height: 8\n" +
    "    }\n" +
    "  }\n" +
    "]\n" +
    "research: {\n" +
    "  parent: core-nucleus\n" +
    "}\n"
  );
};

exports.unitNaval = function (id) {
  return (
    "type: naval\n" +
    "outlines: false\n" +
    "health: 900\n" +
    "armor: 6\n" +
    "speed: 1.1\n" +
    "hitSize: 12\n" +
    "rotateSpeed: 2\n" +
    "range: 55\n" +
    "weapons: [\n" +
    "  {\n" +
    "    name: " + id + "-cannon\n" +
    "    x: 0\n" +
    "    y: 4\n" +
    "    reload: 28\n" +
    "    rotate: true\n" +
    "    shootSound: shootBig\n" +
    "    bullet: {\n" +
    "      type: BasicBulletType\n" +
    "      damage: 28\n" +
    "      splashDamage: 12\n" +
    "      splashDamageRadius: 16\n" +
    "      speed: 2.8\n" +
    "      lifetime: 50\n" +
    "      width: 8\n" +
    "      height: 10\n" +
    "    }\n" +
    "  }\n" +
    "]\n" +
    "research: {\n" +
    "  parent: core-nucleus\n" +
    "}\n"
  );
};

exports.blockTurret = function (id) {
  return (
    "type: ItemTurret\n" +
    "outlineIcon: false\n" +
    "category: turret\n" +
    "size: 2\n" +
    "health: 640\n" +
    "reload: 20\n" +
    "range: 160\n" +
    "inaccuracy: 2\n" +
    "rotateSpeed: 5\n" +
    "shootSound: shoot\n" +
    "ammoTypes: {\n" +
    "  copper: {\n" +
    "    type: BasicBulletType\n" +
    "    damage: 18\n" +
    "    speed: 4\n" +
    "    lifetime: 45\n" +
    "    width: 7\n" +
    "    height: 9\n" +
    "  }\n" +
    "}\n" +
    "requirements: [\n" +
    "  copper/60\n" +
    "  lead/40\n" +
    "]\n" +
    "research: {\n" +
    "  parent: duo\n" +
    "}\n"
  );
};

exports.blockCrafter = function (id) {
  return (
    "type: GenericCrafter\n" +
    "outlineIcon: false\n" +
    "category: crafting\n" +
    "size: 2\n" +
    "health: 320\n" +
    "craftTime: 60\n" +
    "hasItems: true\n" +
    "itemCapacity: 20\n" +
    "consumes: {\n" +
    "  power: 1.2\n" +
    "  items: [\n" +
    "    copper/1\n" +
    "  ]\n" +
    "}\n" +
    "outputItem: graphite/1\n" +
    "requirements: [\n" +
    "  copper/50\n" +
    "  lead/30\n" +
    "]\n" +
    "research: {\n" +
    "  parent: graphite-press\n" +
    "}\n"
  );
};

exports.blockDrill = function (id) {
  return (
    "type: Drill\n" +
    "outlineIcon: false\n" +
    "category: production\n" +
    "size: 2\n" +
    "health: 300\n" +
    "tier: 3\n" +
    "drillTime: 280\n" +
    "consumes: {\n" +
    "  power: 0.8\n" +
    "}\n" +
    "requirements: [\n" +
    "  copper/40\n" +
    "  lead/30\n" +
    "]\n" +
    "research: {\n" +
    "  parent: pneumatic-drill\n" +
    "}\n"
  );
};

exports.blockWall = function (id) {
  return (
    "type: Wall\n" +
    "outlineIcon: false\n" +
    "category: defense\n" +
    "size: 1\n" +
    "health: 800\n" +
    "requirements: [\n" +
    "  copper/12\n" +
    "]\n" +
    "research: {\n" +
    "  parent: copper-wall\n" +
    "}\n"
  );
};

exports.blockFactory = function (id) {
  return (
    "type: UnitFactory\n" +
    "outlineIcon: false\n" +
    "category: units\n" +
    "size: 3\n" +
    "consumes: {\n" +
    "  power: 1.2\n" +
    "}\n" +
    "itemCapacity: 10\n" +
    "plans: [\n" +
    "  {\n" +
    "    unit: dagger\n" +
    "    time: 900\n" +
    "    requirements: [\n" +
    "      silicon/10\n" +
    "      lead/10\n" +
    "    ]\n" +
    "  }\n" +
    "]\n" +
    "requirements: [\n" +
    "  copper/80\n" +
    "  lead/60\n" +
    "  silicon/40\n" +
    "]\n" +
    "research: {\n" +
    "  parent: ground-factory\n" +
    "}\n"
  );
};

exports.scriptMain = function (modName) {
  return (
    "Log.info(\"[" + modName + "] scripts loaded\");\n" +
    "\n" +
    "Events.on(ClientLoadEvent, e => {\n" +
    "  Log.info(\"[" + modName + "] client ready\");\n" +
    "});\n"
  );
};

exports.modMeta = function (name, display, author, version) {
  return (
    "name: " + name + "\n" +
    "displayName: " + display + "\n" +
    "author: " + author + "\n" +
    "description: \"Created with Mindustry Mod Studio\"\n" +
    "version: \"" + version + "\"\n" +
    "minGameVersion: 160\n" +
    "dependencies: []\n" +
    "hidden: false\n"
  );
};

exports.kinds = [
  { id: "item", folder: "content/items", label: "Item", fn: "item" },
  { id: "status", folder: "content/status", label: "Status", fn: "status" },
  { id: "unit-legs", folder: "content/units", label: "Unit (legs)", fn: "unitLegs" },
  { id: "unit-mech", folder: "content/units", label: "Unit (mech)", fn: "unitMech" },
  { id: "unit-flying", folder: "content/units", label: "Unit (flying)", fn: "unitFlying" },
  { id: "unit-naval", folder: "content/units", label: "Unit (naval)", fn: "unitNaval" },
  { id: "turret", folder: "content/blocks", label: "Turret", fn: "blockTurret" },
  { id: "crafter", folder: "content/blocks", label: "Crafter", fn: "blockCrafter" },
  { id: "drill", folder: "content/blocks", label: "Drill", fn: "blockDrill" },
  { id: "wall", folder: "content/blocks", label: "Wall", fn: "blockWall" },
  { id: "factory", folder: "content/blocks", label: "Unit Factory", fn: "blockFactory" }
];
