/**
 * Mindustry Mod Studio — понятный домашний экран + мастера.
 * Продвинутый редактор спрятан за отдельной кнопкой.
 */
const templates = require("templates");
const projects = require("projects");
const schema = require("schema");
const pickers = require("pickers");
const form = require("form");
const clone = require("clone");
const wizard = require("wizard");

var homeDialog = null;
var editorDialog = null;
var currentProject = "";
var currentKind = templates.kinds[2];
var state = form.newState(currentKind.id, "demo-unit");
var undoStack = [];
var redoStack = [];
var currentFile = "";

var projectTable, fileTable, fieldTable, noteLabel, rawArea, statusLabel;
var idField, projectField, kindLabel;

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
  if (undoStack.length === 0) return setStatus("Нечего отменять");
  redoStack.push(cloneState(state));
  state = undoStack.pop();
  rebuildFields();
  syncRaw();
  setStatus("Undo");
}

function redo() {
  if (redoStack.length === 0) return setStatus("Нечего повторить");
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
  if (!list.length) projectTable.add("(нет модов)").pad(4).row();
  list.forEach(n => {
    projectTable
      .button(n, Styles.flatBordert, () => {
        currentProject = n;
        if (projectField) projectField.setText(n);
        rebuildFiles();
        setStatus("Проект " + n);
      })
      .row();
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
  if (!files.length) fileTable.add("(пусто)").pad(4).row();
  files.forEach(rel => {
    fileTable
      .button(rel, Styles.flatBordert, () => {
        currentFile = rel;
        const text = projects.readFile(currentProject, rel);
        if (rawArea) rawArea.setText(text);
        form.applyFlatHjson(state, text);
        rebuildFields();
        setStatus("Открыт " + rel);
      })
      .row();
  });
}

function showNote(key) {
  const n = schema.notes[key] || schema.notes[key.split(".").pop()] || "Нет подсказки.";
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
  const shown = val == null || val === "" ? "…" : "" + val;
  row
    .button(shown.length > 18 ? shown.substring(0, 16) + "…" : shown, Styles.flatBordert, () => {
      showNote(key);
      pickers.pickFieldValue(type, val, nv => {
        pushUndo();
        state[key] = nv;
        if (key === "__id") state.__id = nv;
        rebuildFields();
        syncRaw();
        setStatus(key + " = " + nv);
      });
    })
    .growX()
    .height(30);
  fieldTable.row();
}

function createProjectDlg() {
  const d = new BaseDialog("Новый мод");
  const name = new TextField("my-mod");
  const display = new TextField("My Mod");
  const author = new TextField(Vars.player != null ? Vars.player.name : "Author");
  d.cont.defaults().pad(3);
  d.cont.add("id папки (латиница)").left().row();
  d.cont.add(name).growX().row();
  d.cont.add("название").left().row();
  d.cont.add(display).growX().row();
  d.cont.add("автор").left().row();
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
      setStatus("Создан " + currentProject);
      d.hide();
      refreshHome();
    } catch (e) {
      setStatus("" + e);
    }
  }).size(130, 48);
  d.show();
}

function pickKindDlg() {
  const d = new BaseDialog("Тип контента");
  d.cont
    .pane(t => {
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
    })
    .grow();
  d.buttons.button("@back", () => d.hide()).size(140, 50);
  d.show();
}

function createFromForm() {
  if (!currentProject) return setStatus("Сначала выбери мод");
  const id = (state.__id || "").trim();
  if (!/^[a-z][a-z0-9-]*$/.test(id)) return setStatus("Плохой id");
  state.__kind = currentKind.id;
  const body = form.toHjson(state);
  try {
    const path = projects.writeContent(currentProject, currentKind.folder, id, body);
    if (currentKind.folder.indexOf("units") >= 0) {
      projects.writePlaceholderSprite(currentProject, "sprites/units/" + id + ".png", 64);
      projects.writePlaceholderSprite(currentProject, "sprites/units/" + id + "-preview.png", 64);
      projects.writePlaceholderSprite(currentProject, "sprites/units/" + id + "-gun.png", 32);
    } else if (currentKind.folder.indexOf("blocks") >= 0) {
      projects.writePlaceholderSprite(currentProject, "sprites/blocks/" + id + ".png", 64);
    } else if (currentKind.folder.indexOf("items") >= 0) {
      projects.writePlaceholderSprite(currentProject, "sprites/items/" + id + ".png", 32);
    }
    if (rawArea) rawArea.setText(body);
    rebuildFiles();
    setStatus("Записано " + path);
  } catch (e) {
    setStatus("" + e);
  }
}

function saveRaw() {
  if (!currentProject) return setStatus("Нет проекта");
  const d = new BaseDialog("Сохранить raw");
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
  if (Vars.state == null || Vars.player == null) {
    return setStatus("Зайди на карту (sandbox), потом Spawn");
  }
  const id = state.__id;
  const tries = [];
  if (currentProject) tries.push(currentProject + "-" + id);
  tries.push(id);
  let ut = null;
  for (var i = 0; i < tries.length; i++) {
    ut = Vars.content.unit(tries[i]);
    if (ut != null) break;
  }
  if (ut == null) return setStatus("Не загружен — включи мод и перезапусти. " + tries.join(" | "));
  ut.spawn(Vars.player.team(), Vars.player.x, Vars.player.y);
  setStatus("Spawn " + ut.name);
}

function showHelp() {
  const d = new BaseDialog("Как пользоваться");
  d.cont
    .pane(p => {
      p.margin(12);
      p.add(
        "[accent]Mod Studio — коротко[]\n\n" +
          "[accent]1. Новый мод[] — создаёт папку в saves/mods/\n" +
          "[accent]2. Создать юнит[] — мастер из 6 шагов:\n" +
          "   тип → id → статы → оружие (x/y) → спрайты → код → запись\n\n" +
          "[accent]Оружие[]\n" +
          "• name = имя PNG пушки (flame-crab-gun.png)\n" +
          "• x/y = где торчит относительно центра\n" +
          "• mirror=true → вторая пушка слева\n\n" +
          "[accent]Спрайты[]\n" +
          "• можно скопировать PNG с ванильного юнита из атласа\n" +
          "• или кинуть свои PNG в sprites/units/\n\n" +
          "[accent]Код[] — необязателен. HJSON уже делает юнит.\n" +
          "JS для shield/custom bullet/draw.\n\n" +
          "После записи: Mods → reload / рестарт → песочница.\n\n" +
          "[accent]Грабли[]\n" +
          "• Drill без -rotator/-top = oh-no\n" +
          "• weapon.name ≠ файл спрайта → пушка невидима\n" +
          "• В Rhino не делай hit()+super$hit\n"
      )
        .left()
        .wrap()
        .growX();
    })
    .grow();
  d.buttons.button("@ok", () => d.hide()).size(150, 50);
  d.show();
}

function showInspector() {
  const d = new BaseDialog("Inspect — модовые юниты");
  d.cont
    .pane(t => {
      t.defaults().growX().left().pad(2);
      t.add("[accent]Тап = заспавнить у игрока[]").row();
      Vars.content.units().each(u => {
        try {
          if (u.minfo != null && u.minfo.mod != null) {
            t.button(u.localizedName + " [" + u.name + "]", Styles.flatBordert, () => {
              if (Vars.player != null) u.spawn(Vars.player.team(), Vars.player.x, Vars.player.y);
            })
              .height(32)
              .row();
          }
        } catch (e) {}
      });
    })
    .grow();
  d.buttons.button("@ok", () => d.hide()).size(140, 50);
  d.show();
}

function pickProjectQuick(onPick) {
  const list = projects.listProjects();
  if (!list.length) {
    createProjectDlg();
    return;
  }
  const d = new BaseDialog("Выбери мод");
  d.cont
    .pane(t => {
      t.defaults().growX().height(42).pad(2);
      list.forEach(n => {
        t.button(n, Styles.flatBordert, () => {
          currentProject = n;
          d.hide();
          onPick(n);
        }).row();
      });
      t.button("+ Новый мод", Styles.flatBordert, () => {
        d.hide();
        createProjectDlg();
      }).row();
    })
    .grow();
  d.buttons.button("@back", () => d.hide()).size(140, 50);
  d.show();
}

var homeStatus;

function refreshHome() {
  if (homeStatus == null) return;
  const list = projects.listProjects();
  const cur = currentProject || (list.length ? list[0] : "—");
  if (!currentProject && list.length) currentProject = list[0];
  homeStatus.setText(
    "Текущий мод: [accent]" +
      (currentProject || "нет") +
      "[]\n" +
      tipLine("Сначала мод, потом «Создать юнит». Всё пишется в папку mods/")
  );
}

function tipLine(s) {
  return "[lightgray]" + s + "[]";
}

function buildHome() {
  homeDialog = new BaseDialog("Mod Studio");
  homeDialog.addCloseButton();

  const root = homeDialog.cont;
  root.top().pad(8);

  root.add("[accent]Что сделать?[]").left().padBottom(4).row();
  homeStatus = root.add("…").left().wrap().growX().padBottom(10).get();
  root.row();

  const actions = root.table().growX().get();
  actions.defaults().growX().height(52).pad(3);

  actions
    .button("1. Новый мод", Styles.flatBordert, () => createProjectDlg())
    .row();
  actions
    .button("2. Создать юнит (мастер)", Styles.flatBordert, () => {
      pickProjectQuick(p => {
        wizard.startUnitWizard(p, () => refreshHome());
      });
    })
    .row();
  actions
    .button("3. Создать блок", Styles.flatBordert, () => {
      pickProjectQuick(p => wizard.startBlockWizard(p, () => refreshHome()));
    })
    .row();
  actions
    .button("4. Создать предмет", Styles.flatBordert, () => {
      pickProjectQuick(p => wizard.startItemWizard(p, () => refreshHome()));
    })
    .row();
  actions
    .button("5. Открыть папку мода", Styles.flatBordert, () => {
      pickProjectQuick(p => projects.openFolder(p));
    })
    .row();
  actions
    .button("6. Скопировать ванильный юнит (Magic Clone)", Styles.flatBordert, () => {
      pickProjectQuick(p => {
        clone.browseAndClone(p, r => {
          if (r) Vars.ui.showInfoToast("Клон: " + r.id, 3);
          refreshHome();
        });
      });
    })
    .row();
  actions
    .button("7. Inspect / Spawn модовых юнитов", Styles.flatBordert, () => showInspector())
    .row();
  actions
    .button("8. Продвинутый редактор (HJSON)", Styles.flatBordert, () => showEditor())
    .row();
  actions
    .button("? Справка", Styles.flatBordert, () => showHelp())
    .row();

  root.row();
  root.add(projects.reloadHint()).left().padTop(8).row();
  refreshHome();
}

function buildEditor() {
  editorDialog = new BaseDialog("Продвинутый редактор");
  editorDialog.addCloseButton();
  const root = editorDialog.cont;
  root.top();

  let bar;
  try {
    bar = root.table(Styles.black3).growX().get();
  } catch (e) {
    bar = root.table().growX().get();
  }
  bar.left().defaults().pad(2);
  bar.button("New", () => createProjectDlg()).size(70, 40);
  bar.button("Folder", () => {
    if (currentProject) projects.openFolder(currentProject);
  }).size(80, 40);
  bar.button("Clone", () => {
    if (!currentProject) return setStatus("Сначала мод");
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
  bar.button("Мастер юнита", () => {
    wizard.startUnitWizard(currentProject, () => {
      rebuildFiles();
      refreshHome();
    });
  }).size(130, 40);
  root.row();

  const meta = root.table().growX().get();
  meta.left();
  meta.add("Мод").padRight(4);
  projectField = new TextField(currentProject || "");
  meta.add(projectField).width(160).height(36);
  meta
    .button("Use", () => {
      currentProject = ("" + projectField.getText()).trim();
      rebuildFiles();
    })
    .size(60, 36);
  kindLabel = meta.add(currentKind.label).width(110).padLeft(8).get();
  meta.button("Kind…", () => pickKindDlg()).size(80, 36);
  meta.add("id").padLeft(8).padRight(4);
  idField = new TextField("demo-unit");
  meta.add(idField).width(140).height(36);
  meta
    .button("Set id", () => {
      pushUndo();
      state.__id = ("" + idField.getText()).trim();
      rebuildFields();
      syncRaw();
    })
    .size(80, 36);
  root.row();

  const body = root.table().grow().get();

  const nav = new Table();
  nav.top();
  nav.add("[accent]Моды[]").left().pad(3).row();
  projectTable = new Table();
  nav.add(new ScrollPane(projectTable)).width(170).height(180).row();
  nav.add("[accent]Файлы[]").left().pad(3).row();
  fileTable = new Table();
  nav.add(new ScrollPane(fileTable)).width(170).growY();
  body.add(nav).width(180).growY().pad(2);

  const mid = new Table();
  mid.top();
  mid.add("[accent]Поля[] (имя=подсказка, значение=выбор)").left().pad(3).row();
  fieldTable = new Table();
  mid.add(new ScrollPane(fieldTable)).grow().row();
  noteLabel = mid.add("Тап по имени поля — подсказка.").growX().height(70).left().wrap().pad(4).get();
  body.add(mid).grow().pad(2);

  const right = new Table();
  right.top();
  right.add("[accent]Raw HJSON[]").left().pad(3).row();
  rawArea = new TextArea("// форма → HJSON\n");
  right.add(rawArea).grow();
  right.row();
  right
    .button("Form ← Raw", () => {
      pushUndo();
      form.applyFlatHjson(state, rawArea.getText());
      rebuildFields();
      setStatus("Применено из raw");
    })
    .growX()
    .height(36)
    .pad(2);
  body.add(right).width(320).growY().pad(2);

  root.row();
  statusLabel = root.add("Продвинутый режим").growX().left().pad(6).get();

  state = form.newState(currentKind.id, "demo-unit");
  rebuildProjects();
  rebuildFiles();
  rebuildFields();
  syncRaw();
}

function showEditor() {
  if (editorDialog == null) buildEditor();
  rebuildProjects();
  rebuildFiles();
  editorDialog.show();
}

exports.show = function () {
  try {
    if (homeDialog == null) buildHome();
    refreshHome();
    homeDialog.show();
  } catch (e) {
    Log.err("[Studio] " + e);
    try {
      Vars.ui.showException(e);
    } catch (e2) {
      Vars.ui.showInfo("Studio: " + e);
    }
  }
};
