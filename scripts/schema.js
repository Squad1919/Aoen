/**
 * Field schemas with inline notes — PatchEditor-style field tree for mod content.
 */
exports.notes = {
  health: "Max HP. Scale ~x2 per tier for Aoen-like lines.",
  armor: "Flat damage reduction before multipliers.",
  speed: "Tiles/tick-ish movement. Flying ~1.5–3, legs ~0.3–0.7.",
  hitSize: "Collision radius. Legs need room for legLength.",
  range: "Weapon targeting range (world units).",
  rotateSpeed: "Body turn speed.",
  type: "UnitType constructor: legs | mech | flying | naval | tank | payload",
  legCount: "Number of legs (legs units). Even usually looks better.",
  legLength: "Reach of each leg. Scale with hitSize.",
  legSpeed: "How fast legs step.",
  legBaseOffset: "Leg origin distance from center.",
  legExtension: "Negative pulls feet under body (atrax-like).",
  lockLegBase: "Locks leg base rotation — set true for spiders.",
  allowLegStep: "Allow stepping onto solid blocks.",
  legContinuousMove: "Smooth crawl instead of stop-step.",
  hovering: "Draw/shadow as hovering.",
  flying: "true for air units.",
  lowAltitude: "Fly low (can be hit by ground AA more).",
  engineOffset: "Engine trail position from center toward back.",
  engineSize: "Engine visual size.",
  outlines: "false if you supply custom outline sprites.",
  outlineIcon: "false to skip auto gray outline on icons.",
  category: "turret|production|crafting|defense|units|effect|power|liquid|logic",
  size: "Footprint in tiles (1–16).",
  reload: "Frames between shots (turret/weapon).",
  shootSound: "Vanilla sound name: shoot, shootBig, laser, missile…",
  craftTime: "Frames per craft cycle.",
  drillTime: "Lower = faster drill.",
  tier: "Max ore hardness this drill can mine.",
  damage: "Bullet direct damage.",
  splashDamage: "AoE damage on hit/despawn.",
  splashDamageRadius: "AoE radius.",
  lifetime: "Bullet life in frames.",
  width: "Bullet draw width.",
  height: "Bullet draw height.",
  status: "StatusEffect id (burning, shocked, wet, sapped…).",
  statusDuration: "Ticks of status.",
  mirror: "Duplicate weapon mirrored on X.",
  rotate: "Weapon turret rotates toward target.",
  alwaysShooting: "Fire without a target (orbs).",
  requirements: "Build cost ItemStack list.",
  research: "Tech tree parent + research cost.",
  consumes: "power / items / liquid inputs.",
  outputItem: "item/amount crafted.",
  ammoTypes: "Map of item → BulletType for ItemTurret.",
  plans: "UnitFactory production plans.",
  upgrades: "Reconstructor [[from, to], …].",
  constructTime: "Reconstructor duration (frames).",
  buildVisibility: "shown|hidden|sandboxOnly|campaignOnly|editorOnly",
  color: "Hex RRGGBB for items/status.",
  hardness: "Ore hardness for items.",
  cost: "Build material weight of item."
};

exports.unitCommon = [
  ["type", "string", "legs"],
  ["outlines", "bool", "false"],
  ["health", "number", "700"],
  ["armor", "number", "5"],
  ["speed", "number", "0.55"],
  ["hitSize", "number", "11"],
  ["rotateSpeed", "number", "2.5"],
  ["range", "number", "50"],
  ["researchCostMultiplier", "number", "0.6"]
];

exports.unitLegsExtra = [
  ["legCount", "number", "6"],
  ["legLength", "number", "14"],
  ["legSpeed", "number", "0.3"],
  ["legBaseOffset", "number", "3"],
  ["legExtension", "number", "-7"],
  ["legMoveSpace", "number", "1.15"],
  ["lockLegBase", "bool", "true"],
  ["allowLegStep", "bool", "true"],
  ["legContinuousMove", "bool", "true"],
  ["hovering", "bool", "true"],
  ["flipBackLeg", "bool", "true"]
];

exports.unitFlyingExtra = [
  ["flying", "bool", "true"],
  ["lowAltitude", "bool", "true"],
  ["accel", "number", "0.08"],
  ["drag", "number", "0.03"],
  ["engineOffset", "number", "5"],
  ["engineSize", "number", "2.5"]
];

exports.weaponFields = [
  ["name", "string", "gun"],
  ["x", "number", "4"],
  ["y", "number", "0"],
  ["reload", "number", "20"],
  ["rotate", "bool", "true"],
  ["mirror", "bool", "true"],
  ["shootSound", "sound", "shoot"],
  ["bullet.type", "string", "BasicBulletType"],
  ["bullet.damage", "number", "20"],
  ["bullet.speed", "number", "3.2"],
  ["bullet.lifetime", "number", "40"],
  ["bullet.width", "number", "7"],
  ["bullet.height", "number", "9"],
  ["bullet.splashDamage", "number", "0"],
  ["bullet.splashDamageRadius", "number", "0"],
  ["bullet.status", "content:status", ""],
  ["bullet.statusDuration", "number", "60"],
  ["bullet.frontColor", "color", "ddeeff"],
  ["bullet.backColor", "color", "445566"]
];

exports.itemFields = [
  ["hardness", "number", "1"],
  ["cost", "number", "1"],
  ["color", "color", "8899aa"],
  ["flammability", "number", "0"],
  ["radioactivity", "number", "0"],
  ["explosiveness", "number", "0"]
];

exports.statusFields = [
  ["damage", "number", "0.2"],
  ["color", "color", "ff6644"],
  ["speedMultiplier", "number", "0.9"],
  ["reloadMultiplier", "number", "1"],
  ["damageMultiplier", "number", "1"],
  ["healthMultiplier", "number", "1"],
  ["disarm", "bool", "false"],
  ["show", "bool", "true"]
];

exports.blockCommon = [
  ["type", "string", "GenericCrafter"],
  ["outlineIcon", "bool", "false"],
  ["category", "category", "crafting"],
  ["size", "number", "2"],
  ["health", "number", "320"],
  ["buildVisibility", "visibility", "shown"]
];

exports.turretExtra = [
  ["reload", "number", "20"],
  ["range", "number", "160"],
  ["inaccuracy", "number", "2"],
  ["rotateSpeed", "number", "5"],
  ["shootSound", "sound", "shoot"]
];

exports.drillExtra = [
  ["tier", "number", "3"],
  ["drillTime", "number", "280"]
];

exports.crafterExtra = [
  ["craftTime", "number", "60"],
  ["hasItems", "bool", "true"],
  ["itemCapacity", "number", "20"],
  ["outputItem", "string", "graphite/1"]
];

exports.categories = ["turret", "production", "crafting", "defense", "units", "effect", "power", "liquid", "logic", "distribution"];
exports.visibilities = ["shown", "hidden", "sandboxOnly", "campaignOnly", "editorOnly"];
exports.sounds = ["shoot", "shootBig", "shootSmite", "laser", "laserblast", "missile", "artillery", "explosion", "place", "break", "buttonClick", "chatMessage", "respawn"];
exports.effects = ["none", "shootSmall", "shootBig", "hitBulletColor", "hitLaserBlast", "blastExplosion", "massiveExplosion", "smoke", "fireSmoke", "sparkShoot"];
exports.bulletTypes = ["BasicBulletType", "MissileBulletType", "ArtilleryBulletType", "LaserBulletType", "ContinuousLaserBulletType", "ShrapnelBulletType", "FlakBulletType", "RailBulletType", "EmpBulletType"];

exports.schemasFor = function (kindId) {
  if (kindId === "item") return exports.itemFields.slice();
  if (kindId === "status") return exports.statusFields.slice();
  if (kindId.indexOf("unit-legs") === 0) return exports.unitCommon.concat(exports.unitLegsExtra);
  if (kindId.indexOf("unit-flying") === 0) return exports.unitCommon.concat(exports.unitFlyingExtra);
  if (kindId.indexOf("unit") === 0) return exports.unitCommon.slice();
  if (kindId === "turret") return exports.blockCommon.concat(exports.turretExtra);
  if (kindId === "drill") return exports.blockCommon.concat(exports.drillExtra);
  if (kindId === "crafter") return exports.blockCommon.concat(exports.crafterExtra);
  if (kindId === "wall" || kindId === "factory") return exports.blockCommon.slice();
  return exports.unitCommon.slice();
};
