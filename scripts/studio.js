/**
 * Mindustry Mod Studio — in-game HJSON/JS mod authoring UI.
 */
const templates = require("templates");
const projects = require("projects");

var studioDialog = null;
var currentProject = "";
var currentKind = templates.kinds[0];
var editorArea = null;
var statusLabel = null;
var fileTable = null;
var projectTable = null;
var idField = null;
var projectField = null;
var kindLabel = null;

function setStatus(msg) {
  Log.info("[Studio] " + msg);
  if (statusLabel != null) statusLabel.setText("" + msg);
  try {
    Vars.ui.showInfoToast("" + msg, 2.2);
  } catch (e) {}
}

function rebuildProjects() {
  if (projectTable == null) return;
  projectTable.clearChildren();
  projectTable.top().defaults().growX().height(34).pad(1);
  const list = projects.listProjects();
  if (list.length === 0) {
    projectTable.add("(no mods with mod.hjson yet)").pad(6).row();
  }
  list.forEach(n => {
    projectTable.button(n, Styles.flatBordert, () => {
      currentProject = n;
      if (projectField != null) projectField.setText(n);
      rebuildFiles();
      setStatus("Project: " + n);
    }).row();
  });
}

function rebuildFiles() {
  if (fileTable == null) return;
  fileTable.clearChildren();
  fileTable.top().defaults().growX().height(32).pad(1);
  if (!currentProject) {
    fileTable.add("Select a project").pad(6).row();
    return;
  }
  const files = projects.listContent(currentProject);
  if (files.length === 0) {
    fileTable.add("Empty — create content").pad(6).row();
    return;
  }
  files.forEach(rel => {
    fileTable.button(rel, Styles.flatBordert, () => {
      try {
        editorArea.setText(projects.readFile(currentProject, rel));
        setStatus("Opened " + rel);
      } catch (e) {
        setStatus("" + e);
      }
    }).row();
  });
}

function createNewProject() {
  const d = new BaseDialog("New Project");
  const name = new TextField("my-mod");
  const display = new TextField("My Mod");
  const author = new TextField(Vars.player != null ? Vars.player.name : "Author");
  d.cont.defaults().pad(4);
  d.cont.add("mod id").left().row();
  d.cont.add(name).growX().row();
  d.cont.add("display name").left().row();
  d.cont.add(display).growX().row();
  d.cont.add("author").left().row();
  d.cont.add(author).growX().row();
  d.buttons.button("@back", () => d.hide()).size(140, 50);
  d.buttons.button("@ok", () => {
    try {
      const dir = projects.createProject({
        name: name.getText(),
        display: display.getText(),
        author: author.getText(),
        version: "1.0.0"
      });
      currentProject = dir.name();
      if (projectField != null) projectField.setText(currentProject);
      rebuildProjects();
      rebuildFiles();
      setStatus("Created " + currentProject + " in mods/");
      d.hide();
    } catch (e) {
      setStatus("Create failed: " + e);
    }
  }).size(140, 50);
  d.show();
}

function createContent() {
  if (!currentProject) {
    setStatus("Select/create project first");
    return;
  }
  const id = ("" + idField.getText()).trim();
  if (!/^[a-z][a-z0-9-]*$/.test(id)) {
    setStatus("Bad id — use a-z, 0-9, dashes");
    return;
  }
  const kind = currentKind;
  const body = templates[kind.fn](id);
  try {
    const path = projects.writeContent(currentProject, kind.folder, id, body);
    if (kind.folder.indexOf("units") >= 0) {
      projects.writePlaceholderSprite(currentProject, "sprites/units/" + id + ".png", 64);
      projects.writePlaceholderSprite(currentProject, "sprites/units/" + id + "-preview.png", 64);
      projects.writePlaceholderSprite(currentProject, "sprites/units/" + id + "-gun.png", 32);
    } else if (kind.folder.indexOf("blocks") >= 0) {
      projects.writePlaceholderSprite(currentProject, "sprites/blocks/" + id + ".png", 64);
    } else if (kind.folder.indexOf("items") >= 0) {
      projects.writePlaceholderSprite(currentProject, "sprites/items/" + id + ".png", 32);
    } else if (kind.folder.indexOf("status") >= 0) {
      projects.writePlaceholderSprite(currentProject, "sprites/status/" + id + ".png", 32);
    }
    editorArea.setText(body);
    rebuildFiles();
    setStatus("Wrote " + path);
  } catch (e) {
    setStatus("Write failed: " + e);
  }
}

function saveEditor() {
  if (!currentProject) {
    setStatus("No project");
    return;
  }
  const d = new BaseDialog("Save");
  const pathField = new TextField("content/units/demo.hjson");
  d.cont.add("Path relative to project root").row();
  d.cont.add(pathField).growX().pad(8).row();
  d.buttons.button("@back", () => d.hide()).size(120, 48);
  d.buttons.button("Save", () => {
    try {
      const rel = pathField.getText();
      const f = projects.projectDir(currentProject).child(rel);
      f.parent().mkdirs();
      f.writeString(editorArea.getText(), false);
      rebuildFiles();
      setStatus("Saved " + rel);
      d.hide();
    } catch (e) {
      setStatus("" + e);
    }
  }).size(120, 48);
  d.show();
}

function spawnPreview() {
  if (Vars.state == null || Vars.player == null) {
    setStatus("Join a map first (sandbox)");
    return;
  }
  const id = ("" + idField.getText()).trim();
  const tries = [];
  if (currentProject) tries.push(currentProject + "-" + id);
  tries.push(id);
  let ut = null;
  for (var i = 0; i < tries.length; i++) {
    ut = Vars.content.unit(tries[i]);
    if (ut != null) break;
  }
  if (ut == null) {
    setStatus("Unit not in content yet (enable mod + reload). Tried " + tries.join(", "));
    return;
  }
  ut.spawn(Vars.player.team(), Vars.player.x, Vars.player.y);
  setStatus("Spawned " + ut.name);
}

function showDocs() {
  const d = new BaseDialog("Docs");
  d.cont.pane(p => {
    p.margin(14);
    p.add(
      "[accent]Workflow[]\n" +
        "1. New Project → folder appears in Mindustry/saves/mods/\n" +
        "2. Choose Kind + id → Create (writes HJSON + sprite hints)\n" +
        "3. Edit text → Save\n" +
        "4. Drop PNG sprites next to .SPRITE.txt hints\n" +
        "5. Mods menu: enable your mod, restart to reload\n" +
        "6. Spawn unit to test\n\n" +
        "[accent]Supported[]\n" +
        "Items, Status, Units (legs/mech/flying/naval),\n" +
        "Turrets, Crafters, Drills, Walls, Unit Factories, scripts/main.js\n\n" +
        "[accent]Hard-won tips (from Aoen)[]\n" +
        "• Drill needs -rotator and -top or oh-no\n" +
        "• JS BulletType: set sprite + call load()\n" +
        "• Do not override hit() with super$hit (StackOverflow)\n" +
        "• Weapon name == sprite name\n" +
        "• Legs: lockLegBase, allowLegStep, -leg/-foot\n" +
        "• outlineIcon: false for custom sprites\n\n" +
        "[accent]Open folder[] opens the project in Explorer.\n"
    ).left().growX().wrap();
  }).grow();
  d.buttons.button("@ok", () => d.hide()).size(160, 50);
  d.show();
}

function showInspector() {
  const d = new BaseDialog("Inspector");
  d.cont.pane(t => {
    t.defaults().left().growX().pad(2);
    t.add("[accent]Modded units[]").row();
    Vars.content.units().each(u => {
      try {
        if (u.minfo != null && u.minfo.mod != null) {
          t.button(u.localizedName + " [" + u.name + "]", Styles.flatBordert, () => {
            if (Vars.player != null) u.spawn(Vars.player.team(), Vars.player.x, Vars.player.y);
          }).height(32).row();
        }
      } catch (e) {}
    });
    t.add("[accent]Modded blocks[]").padTop(8).row();
    Vars.content.blocks().each(b => {
      try {
        if (b.minfo != null && b.minfo.mod != null) {
          t.add(b.localizedName + " [" + b.name + "]").row();
        }
      } catch (e) {}
    });
  }).grow();
  d.buttons.button("@ok", () => d.hide()).size(140, 50);
  d.show();
}

function pickKind() {
  const d = new BaseDialog("Content kind");
  d.cont.pane(t => {
    t.defaults().growX().height(40).pad(2);
    templates.kinds.forEach(k => {
      t.button(k.label, Styles.flatBordert, () => {
        currentKind = k;
        if (kindLabel != null) kindLabel.setText(k.label);
        d.hide();
      }).row();
    });
  }).grow();
  d.buttons.button("@back", () => d.hide()).size(140, 50);
  d.show();
}

function buildUi() {
  studioDialog = new BaseDialog("Mindustry Mod Studio");
  studioDialog.addCloseButton();

  const root = studioDialog.cont;
  root.top();

  // toolbar
  const bar = root.table(Styles.black3).growX().height(52).get();
  bar.left().defaults().pad(3);
  bar.button("New Project", () => createNewProject()).size(130, 42);
  bar.button("Open folder", () => {
    if (!currentProject) return setStatus("No project");
    projects.openFolder(currentProject);
  }).size(120, 42);
  bar.button("Docs", () => showDocs()).size(80, 42);
  bar.button("Inspect", () => showInspector()).size(100, 42);
  bar.button("Refresh", () => {
    rebuildProjects();
    rebuildFiles();
  }).size(100, 42);
  root.row();

  // project field
  const prow = root.table().growX().get();
  prow.left();
  prow.add("Project id:").padRight(6);
  projectField = new TextField("");
  prow.add(projectField).width(200).height(40);
  prow.button("Use", () => {
    currentProject = ("" + projectField.getText()).trim();
    rebuildFiles();
    setStatus("Project: " + currentProject);
  }).size(70, 40).padLeft(4);
  root.row();

  // create controls
  const crow = root.table().growX().get();
  crow.left();
  kindLabel = crow.add(currentKind.label).width(140).get();
  crow.button("Kind…", () => pickKind()).size(90, 40).padLeft(4);
  crow.add("id:").padLeft(10).padRight(4);
  idField = new TextField("demo-unit");
  crow.add(idField).width(160).height(40);
  crow.button("Create", () => createContent()).size(100, 40).padLeft(6);
  crow.button("Spawn", () => spawnPreview()).size(90, 40);
  crow.button("Save", () => saveEditor()).size(90, 40);
  root.row();

  // 3 columns
  const body = root.table().grow().get();
  const left = new Table();
  left.top();
  left.add("[accent]Projects[]").left().pad(4).row();
  projectTable = new Table();
  left.add(new ScrollPane(projectTable)).width(200).growY().row();
  left.add("[accent]Files[]").left().pad(4).row();
  fileTable = new Table();
  left.add(new ScrollPane(fileTable)).width(200).growY();
  body.add(left).width(210).growY();

  editorArea = new TextArea(
    "// Welcome to Mindustry Mod Studio\n" +
      "// 1) New Project\n" +
      "// 2) Kind + id → Create\n" +
      "// 3) Edit & Save\n" +
      "// 4) Add sprites, enable mod, reload\n"
  );
  body.add(editorArea).grow().pad(4);
  root.row();

  statusLabel = root.add("Ready — create a project to begin.").growX().left().pad(6).get();
  root.row();
  root.add(projects.reloadHint()).left().padBottom(8).row();

  rebuildProjects();
  rebuildFiles();
}

exports.show = function () {
  try {
    if (studioDialog == null) buildUi();
    rebuildProjects();
    rebuildFiles();
    studioDialog.show();
  } catch (e) {
    Log.err("[Studio] " + e);
    try {
      Vars.ui.showException(e);
    } catch (e2) {
      Vars.ui.showInfo("Studio error: " + e);
    }
  }
};
