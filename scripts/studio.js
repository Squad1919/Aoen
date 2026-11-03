/**
 * Mindustry Mod Studio — PatchEditor-class UX for full mods.
 * Tree fields + notes, visual pickers, magic clone, raw HJSON, spawn/inspect.
 */
const templates = require("templates");
const projects = require("projects");
const schema = require("schema");
const pickers = require("pickers");
const form = require("form");
const clone = require("clone");

var dialog = null;
var currentProject = "";
var currentKind = templates.kinds[0];
var state = form.newState(currentKind.id, "demo-unit");
var undoStack = [];
var redoStack = [];
var currentFile = "";

var projectTable, fileTable, fieldTable, noteLabel, rawArea, statusLabel;
var idField, projectField, kindLabel, modeForm = true;

function setStatus(msg) {
  Log.info("[Studio] " + msg);
  if (statusLabel != null) statusLabel.setText("" + msg);
  try {
    Vars.ui.showInfoToast("" + msg, 2);
  } catch (e) {}
}

function cloneState(s) {
  const o = {};
  Object.keys(s).forEach(k => {
    o[k] = s[k];
  });
  return o;
}

function pushUndo() {
  undoStack.push(cloneState(state));
  if (undoStack.length > 40) undoStack.shift();
  redoStack = [];
}

function undo() {
  if (undoStack.length === 0) return setStatus("Nothing to undo");
  redoStack.push(cloneState(state));
  state = undoStack.pop();
  rebuildFields();
  syncRaw();
  setStatus("Undo");
}

function redo() {
  if (redoStack.length === 0) return setStatus("Nothing to redo");
  undoStack.push(cloneState(state));
  state = redoStack.pop();
  rebuildFields();
  syncRaw();
  setStatus("Redo");
}

function syncRaw() {
  if (rawArea != null) rawArea.setText(form.toHjson(state));
}

function rebuildProjects() {
  if (projectTable == null) return;
  projectTable.clearChildren();
  projectTable.top().defaults().growX().height(32).pad(1);
  const list = projects.listProjects();
  if (!list.length) projectTable.add("(no projects)").pad(4).row();
  list.forEach(n => {
    projectTable.button(n, Styles.flatBordert, () => {
      currentProject = n;
      if (projectField) projectField.setText(n);
      rebuildFiles();
      setStatus("Project " + n);
    }).row();
  });
}

function rebuildFiles() {
  if (fileTable == null) return;
  fileTable.clearChildren();
  fileTable.top().defaults().growX().height(30).pad(1);
  if (!currentProject) {
    fileTable.add("—").pad(4).row();
    return;
  }
  const files = projects.listContent(currentProject);
  if (!files.length) fileTable.add("(empty)").pad(4).row();
  files.forEach(rel => {
    fileTable.button(rel, Styles.flatBordert, () => {
      currentFile = rel;
      const text = projects.readFile(currentProject, rel);
      if (rawArea) rawArea.setText(text);
      form.applyFlatHjson(state, text);
      rebuildFields();
      setStatus("Opened " + rel);
    }).row();
  });
}

function showNote(key) {
  const n = schema.notes[key] || schema.notes[key.split(".").pop()] || "No note for this field.";
  if (noteLabel != null) noteLabel.setText("[accent]" + key + "[]\n" + n);
}

function rebuildFields() {
  if (fieldTable == null) return;
  fieldTable.clearChildren();
  fieldTable.top().defaults().growX().pad(1);

  const kindId = state.__kind || currentKind.id;
  const fields = schema.schemasFor(kindId);

  fieldTable.add("[accent]— Identity —[]").left().padTop(4).row();
  addRow("__id", "string", state.__id || "");

  fieldTable.add("[accent]— Fields —[]").left().padTop(6).row();
  fields.forEach(f => {
    const key = f[0];
    const type = f[1];
    const val = state[key] != null ? state[key] : f[2];
    addRow(key, type, val);
  });

  if (("" + kindId).indexOf("unit") === 0) {
    fieldTable.add("[accent]— Weapon —[]").left().padTop(6).row();
    schema.weaponFields.forEach(f => {
      const key = "weapon." + f[0];
      const type = f[1];
      const val = state[key] != null ? state[key] : f[2];
      addRow(key, type, val);
    });
  }
}

function addRow(key, type, val) {
  const row = fieldTable.table().growX().height(34).get();
  row.left();
  row.button(key, Styles.flatBordert, () => showNote(key)).width(150).height(30);
  const shown = val == null || val === "" ? "…" : ("" + val);
  row.button(shown.length > 18 ? shown.substring(0, 16) + "…" : shown, Styles.flatBordert, () => {
    showNote(key);
    pickers.pickFieldValue(type, val, nv => {
      pushUndo();
      state[key] = nv;
      if (key === "__id") state.__id = nv;
      rebuildFields();
      syncRaw();
      setStatus(key + " = " + nv);
    });
  }).growX().height(30);
  fieldTable.row();
}

function createProjectDlg() {
  const d = new BaseDialog("New Project");
  const name = new TextField("my-mod");
  const display = new TextField("My Mod");
  const author = new TextField(Vars.player != null ? Vars.player.name : "Author");
  d.cont.defaults().pad(3);
  d.cont.add("id").left().row();
  d.cont.add(name).growX().row();
  d.cont.add("display").left().row();
  d.cont.add(display).growX().row();
  d.cont.add("author").left().row();
  d.cont.add(author).growX().row();
  d.buttons.button("@back", () => d.hide()).size(130, 48);
  d.buttons.button("@ok", () => {
    try {
      const dir = projects.createProject({
        name: name.getText(),
        display: display.getText(),
        author: author.getText(),
        version: "1.0.0"
      });
      currentProject = dir.name();
      if (projectField) projectField.setText(currentProject);
      rebuildProjects();
      rebuildFiles();
      setStatus("Created " + currentProject);
      d.hide();
    } catch (e) {
      setStatus("" + e);
    }
  }).size(130, 48);
  d.show();
}

function pickKindDlg() {
  const d = new BaseDialog("Content kind");
  d.cont.pane(t => {
    t.defaults().growX().height(40).pad(2);
    templates.kinds.forEach(k => {
      t.button(k.label, Styles.flatBordert, () => {
        currentKind = k;
        if (kindLabel) kindLabel.setText(k.label);
        pushUndo();
        state = form.newState(k.id, state.__id || "demo");
        rebuildFields();
        syncRaw();
        d.hide();
      }).row();
    });
  }).grow();
  d.buttons.button("@back", () => d.hide()).size(140, 50);
  d.show();
}

function createFromForm() {
  if (!currentProject) return setStatus("Select/create project");
  const id = (state.__id || "").trim();
  if (!/^[a-z][a-z0-9-]*$/.test(id)) return setStatus("Bad id");
  state.__kind = currentKind.id;
  const body = form.toHjson(state);
  try {
    const path = projects.writeContent(currentProject, currentKind.folder, id, body);
    if (currentKind.folder.indexOf("units") >= 0) {
      projects.writePlaceholderSprite(currentProject, "sprites/units/" + id + ".png", 64);
      projects.writePlaceholderSprite(currentProject, "sprites/units/" + id + "-preview.png", 64);
      projects.writePlaceholderSprite(currentProject, "sprites/units/" + id + "-gun.png", 32);
      if (currentKind.id === "unit-legs") {
        projects.writePlaceholderSprite(currentProject, "sprites/units/" + id + "-leg.png", 32);
        projects.writePlaceholderSprite(currentProject, "sprites/units/" + id + "-foot.png", 24);
      }
    } else if (currentKind.folder.indexOf("blocks") >= 0) {
      projects.writePlaceholderSprite(currentProject, "sprites/blocks/" + id + ".png", 64);
      if (currentKind.id === "drill") {
        projects.writePlaceholderSprite(currentProject, "sprites/blocks/" + id + "-rotator.png", 64);
        projects.writePlaceholderSprite(currentProject, "sprites/blocks/" + id + "-top.png", 64);
      }
    } else if (currentKind.folder.indexOf("items") >= 0) {
      projects.writePlaceholderSprite(currentProject, "sprites/items/" + id + ".png", 32);
    } else if (currentKind.folder.indexOf("status") >= 0) {
      projects.writePlaceholderSprite(currentProject, "sprites/status/" + id + ".png", 32);
    }
    if (rawArea) rawArea.setText(body);
    rebuildFiles();
    setStatus("Wrote " + path);
  } catch (e) {
    setStatus("" + e);
  }
}

function saveRaw() {
  if (!currentProject) return setStatus("No project");
  const d = new BaseDialog("Save raw");
  const def = currentFile || currentKind.folder + "/" + (state.__id || "content") + ".hjson";
  const pathField = new TextField(def);
  d.cont.add(pathField).growX().pad(8).row();
  d.buttons.button("@back", () => d.hide()).size(120, 48);
  d.buttons.button("Save", () => {
    try {
      const rel = pathField.getText();
      const f = projects.projectDir(currentProject).child(rel);
      f.parent().mkdirs();
      f.writeString(rawArea.getText(), false);
      currentFile = rel;
      rebuildFiles();
      setStatus("Saved " + rel);
      d.hide();
    } catch (e) {
      setStatus("" + e);
    }
  }).size(120, 48);
  d.show();
}

function spawnUnit() {
  if (Vars.player == null) return setStatus("Join a map");
  const id = state.__id;
  const tries = [];
  if (currentProject) tries.push(currentProject + "-" + id);
  tries.push(id);
  let ut = null;
  for (var i = 0; i < tries.length; i++) {
    ut = Vars.content.unit(tries[i]);
    if (ut != null) break;
  }
  if (ut == null) return setStatus("Not loaded — enable mod & reload. " + tries.join(" | "));
  ut.spawn(Vars.player.team(), Vars.player.x, Vars.player.y);
  setStatus("Spawned " + ut.name);
}

function showDocs() {
  const d = new BaseDialog("Studio Docs");
  d.cont.pane(p => {
    p.margin(12);
    p.add(
      "[accent]Mindustry Mod Studio[] — PatchEditor UX for full mods\n\n" +
        "[accent]Left[] projects & files\n" +
        "[accent]Center[] field tree — tap name for notes, tap value for picker\n" +
        "[accent]Right[] raw HJSON (always in sync from form)\n\n" +
        "[accent]Magic Clone[] — dump any loaded unit/block/item into your project\n" +
        "[accent]Pickers[] — color / sound / effect / content / texture / bool\n" +
        "[accent]Undo/Redo[] — Ctrl-like via toolbar buttons\n\n" +
        "After writing files: Mods → enable your mod → restart.\n" +
        "Add PNGs where .SPRITE.txt hints say.\n\n" +
        "[accent]Aoen hard lessons[]\n" +
        "• Drill: -rotator + -top or oh-no\n" +
        "• JS bullets: sprite + load()\n" +
        "• Never hit()+super$hit in Rhino\n" +
        "• Weapon name = sprite name\n" +
        "• Legs: lockLegBase + allowLegStep\n"
    ).left().wrap().growX();
  }).grow();
  d.buttons.button("@ok", () => d.hide()).size(150, 50);
  d.show();
}

function showInspector() {
  const d = new BaseDialog("Inspector");
  d.cont.pane(t => {
    t.defaults().growX().left().pad(2);
    t.add("[accent]Modded units (tap spawn)[]").row();
    Vars.content.units().each(u => {
      try {
        if (u.minfo != null && u.minfo.mod != null) {
          t.button(u.localizedName + " [" + u.name + "]", Styles.flatBordert, () => {
            if (Vars.player != null) u.spawn(Vars.player.team(), Vars.player.x, Vars.player.y);
          }).height(32).row();
        }
      } catch (e) {}
    });
  }).grow();
  d.buttons.button("@ok", () => d.hide()).size(140, 50);
  d.show();
}

function build() {
  dialog = new BaseDialog("Mindustry Mod Studio");
  dialog.addCloseButton();
  const root = dialog.cont;
  root.top();

  // ===== Toolbar (PatchEditor-like) =====
  const bar = root.table(Styles.black3).growX().get();
  bar.left().defaults().pad(2);
  bar.button("New", () => createProjectDlg()).size(70, 40);
  bar.button("Folder", () => {
    if (currentProject) projects.openFolder(currentProject);
  }).size(80, 40);
  bar.button("Clone", () => {
    if (!currentProject) return setStatus("Project first");
    clone.browseAndClone(currentProject, r => {
      if (r && r.hjson && rawArea) {
        rawArea.setText(r.hjson);
        state.__id = r.id;
        rebuildFiles();
        rebuildFields();
      }
    });
  }).size(80, 40);
  bar.button("Undo", () => undo()).size(70, 40);
  bar.button("Redo", () => redo()).size(70, 40);
  bar.button("Create", () => createFromForm()).size(90, 40);
  bar.button("Save", () => saveRaw()).size(70, 40);
  bar.button("Spawn", () => spawnUnit()).size(80, 40);
  bar.button("Inspect", () => showInspector()).size(90, 40);
  bar.button("Docs", () => showDocs()).size(70, 40);
  bar.button("↻", () => {
    rebuildProjects();
    rebuildFiles();
    rebuildFields();
  }).size(50, 40);
  root.row();

  // ===== Project / kind / id =====
  const meta = root.table().growX().get();
  meta.left();
  meta.add("Project").padRight(4);
  projectField = new TextField("");
  meta.add(projectField).width(160).height(36);
  meta.button("Use", () => {
    currentProject = ("" + projectField.getText()).trim();
    rebuildFiles();
  }).size(60, 36);
  kindLabel = meta.add(currentKind.label).width(110).padLeft(8).get();
  meta.button("Kind…", () => pickKindDlg()).size(80, 36);
  meta.add("id").padLeft(8).padRight(4);
  idField = new TextField("demo-unit");
  meta.add(idField).width(140).height(36);
  meta.button("Set id", () => {
    pushUndo();
    state.__id = ("" + idField.getText()).trim();
    rebuildFields();
    syncRaw();
  }).size(80, 36);
  root.row();

  // ===== 3 columns: nav | fields+notes | raw =====
  const body = root.table().grow().get();

  const nav = new Table();
  nav.top();
  nav.add("[accent]Projects[]").left().pad(3).row();
  projectTable = new Table();
  nav.add(new ScrollPane(projectTable)).width(170).height(180).row();
  nav.add("[accent]Files[]").left().pad(3).row();
  fileTable = new Table();
  nav.add(new ScrollPane(fileTable)).width(170).growY();
  body.add(nav).width(180).growY().pad(2);

  const mid = new Table();
  mid.top();
  mid.add("[accent]Field tree[]  (name=note, value=picker)").left().pad(3).row();
  fieldTable = new Table();
  mid.add(new ScrollPane(fieldTable)).grow().row();
  noteLabel = mid.add("Tap a field name for notes.").growX().height(70).left().wrap().pad(4).get();
  body.add(mid).grow().pad(2);

  const right = new Table();
  right.top();
  right.add("[accent]Raw HJSON[]").left().pad(3).row();
  rawArea = new TextArea("// form → HJSON appears here\n");
  right.add(rawArea).grow();
  right.row();
  right.button("Form ← Raw (flat keys)", () => {
    pushUndo();
    form.applyFlatHjson(state, rawArea.getText());
    rebuildFields();
    setStatus("Applied flat keys from raw");
  }).growX().height(36).pad(2);
  body.add(right).width(320).growY().pad(2);

  root.row();
  statusLabel = root.add("Ready — New project → Kind → edit fields → Create").growX().left().pad(6).get();
  root.row();
  root.add(projects.reloadHint()).left().padBottom(6).row();

  state = form.newState(currentKind.id, "demo-unit");
  rebuildProjects();
  rebuildFiles();
  rebuildFields();
  syncRaw();
}

exports.show = function () {
  try {
    if (dialog == null) build();
    rebuildProjects();
    rebuildFiles();
    dialog.show();
  } catch (e) {
    Log.err("[Studio] " + e);
    try {
      Vars.ui.showException(e);
    } catch (e2) {
      Vars.ui.showInfo("Studio: " + e);
    }
  }
};
