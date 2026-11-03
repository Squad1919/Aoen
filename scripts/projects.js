/**
 * Project filesystem helpers — write mods into Mindustry mods directory.
 */
const templates = require("templates");

function modsRoot() {
  try {
    return Vars.modDirectory;
  } catch (e) {
    return Core.files.local("mods");
  }
}

function sanitize(name) {
  return ("" + name).toLowerCase().replace(/[^a-z0-9-_]/g, "-").replace(/-+/g, "-");
}

exports.listProjects = function () {
  const root = modsRoot();
  const out = [];
  if (root == null || !root.exists()) return out;
  root.list().forEach(fi => {
    if (!fi.isDirectory()) return;
    if (fi.child("mod.hjson").exists() || fi.child("mod.json").exists()) {
      out.push(fi.name());
    }
  });
  return out;
};

exports.projectDir = function (name) {
  return modsRoot().child(sanitize(name));
};

exports.createProject = function (opts) {
  const name = sanitize(opts.name || "my-mod");
  const display = opts.display || name;
  const author = opts.author || "Studio User";
  const version = opts.version || "1.0.0";
  const dir = exports.projectDir(name);
  dir.mkdirs();
  [
    "content/items",
    "content/blocks",
    "content/units",
    "content/status",
    "content/liquids",
    "sprites/items",
    "sprites/blocks",
    "sprites/units",
    "scripts",
    "bundles"
  ].forEach(p => dir.child(p).mkdirs());

  dir.child("mod.hjson").writeString(templates.modMeta(name, display, author, version), false);
  dir.child("scripts/main.js").writeString(templates.scriptMain(name), false);
  dir.child("README.md").writeString(
    "# " + display + "\n\nCreated with Mindustry Mod Studio.\nReload mods after edits.\n",
    false
  );
  return dir;
};

exports.writeContent = function (projectName, folder, fileStem, body) {
  const dir = exports.projectDir(projectName);
  if (!dir.exists()) throw new Error("project missing: " + projectName);
  const target = dir.child(folder);
  target.mkdirs();
  const path = target.child(fileStem + ".hjson");
  path.writeString(body, false);
  return path.path();
};

exports.writeScript = function (projectName, fileName, body) {
  const dir = exports.projectDir(projectName);
  dir.child("scripts").mkdirs();
  const path = dir.child("scripts").child(fileName);
  path.writeString(body, false);
  return path.path();
};

exports.readFile = function (projectName, relative) {
  const f = exports.projectDir(projectName).child(relative);
  if (!f.exists()) return "";
  return f.readString();
};

exports.listContent = function (projectName) {
  const dir = exports.projectDir(projectName);
  const out = [];
  ["content/items", "content/blocks", "content/units", "content/status", "content/liquids", "scripts"].forEach(folder => {
    const d = dir.child(folder);
    if (!d.exists()) return;
    d.list().forEach(fi => {
      if (fi.isDirectory()) return;
      out.push(folder + "/" + fi.name());
    });
  });
  return out;
};

exports.writePlaceholderSprite = function (projectName, spriteRel, size) {
  // Can't easily encode PNG from JS without Pixmap — write note file instead
  const dir = exports.projectDir(projectName);
  const note = dir.child(spriteRel.replace(/\.png$/i, "") + ".SPRITE.txt");
  note.parent().mkdirs();
  note.writeString(
    "Place a " + size + "x" + size + " PNG here as: " + spriteRel + "\n" +
      "Tip: copy vanilla sprites from Mindustry assets-raw and recolor.\n",
    false
  );
  return note.path();
};

exports.openFolder = function (projectName) {
  try {
    const dir = exports.projectDir(projectName);
    if (Core.app != null) {
      Core.app.openFolder(dir.absolutePath());
    }
  } catch (e) {
    Log.warn("[Studio] openFolder: " + e);
  }
};

exports.reloadHint = function () {
  return "Mods → Disable/Enable mod OR restart Mindustry to reload HJSON/JS.";
};
