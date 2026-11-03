/**
 * Понятный пошаговый мастер: юнит / блок / предмет.
 * Шаги: тип → имя → статы → оружие → спрайты → код → сохранить.
 */
const templates = require("templates");
const projects = require("projects");
const form = require("form");
const schema = require("schema");
const pickers = require("pickers");

function tip(text) {
  return "[lightgray]" + text + "[]";
}

function exportAtlasPng(regionName, outFi) {
  try {
    const region = Core.atlas.find(regionName);
    if (region == null || !region.found) return false;
    const pr = Core.atlas.getPixmap(region);
    if (pr == null) return false;
    const pm = pr.crop();
    outFi.parent().mkdirs();
    PixmapIO.writePng(outFi, pm);
    pm.dispose();
    return true;
  } catch (e) {
    Log.warn("[Studio] exportAtlasPng " + regionName + ": " + e);
    return false;
  }
}

function defaultWeapon(id, kindId) {
  const flying = ("" + kindId).indexOf("flying") >= 0;
  return {
    name: id + "-gun",
    x: flying ? "0" : "5",
    y: flying ? "2" : "0",
    reload: "20",
    rotate: "true",
    mirror: flying ? "false" : "true",
    shootSound: "shoot",
    "bullet.type": "BasicBulletType",
    "bullet.damage": "20",
    "bullet.speed": "3.2",
    "bullet.lifetime": "40",
    "bullet.width": "7",
    "bullet.height": "9",
    "bullet.splashDamage": "0",
    "bullet.splashDamageRadius": "0",
    "bullet.status": "",
    "bullet.statusDuration": "60",
    "bullet.frontColor": "ddeeff",
    "bullet.backColor": "445566"
  };
}

function kindById(id) {
  for (var i = 0; i < templates.kinds.length; i++) {
    if (templates.kinds[i].id === id) return templates.kinds[i];
  }
  return templates.kinds[2];
}

function ensureProject(projectName, onReady) {
  if (projectName && projects.listProjects().indexOf(projectName) >= 0) {
    onReady(projectName);
    return;
  }
  const d = new BaseDialog("1. Сначала мод");
  d.cont.add("У тебя ещё нет выбранного мода.\nСоздадим папку в mods/ — туда лягут юниты и спрайты.").left().wrap().growX().pad(8).row();
  const name = new TextField("my-mod");
  const display = new TextField("My Mod");
  d.cont.add("id папки (латиница)").left().row();
  d.cont.add(name).growX().pad(4).row();
  d.cont.add("название").left().row();
  d.cont.add(display).growX().pad(4).row();
  d.buttons.button("@back", () => d.hide()).size(130, 48);
  d.buttons.button("Создать мод", () => {
    try {
      const dir = projects.createProject({
        name: name.getText(),
        display: display.getText(),
        author: Vars.player != null ? Vars.player.name : "Author",
        version: "1.0.0"
      });
      const n = dir.name();
      d.hide();
      onReady(n);
    } catch (e) {
      Vars.ui.showInfo("" + e);
    }
  }).size(180, 48);
  d.show();
}

function askId(title, def, onOk) {
  const d = new BaseDialog(title);
  d.cont.add(tip("Только a-z, цифры и дефис. Пример: flame-crab")).left().pad(6).row();
  const f = new TextField(def || "my-unit");
  d.cont.add(f).growX().pad(8).row();
  d.buttons.button("@back", () => d.hide()).size(120, 48);
  d.buttons.button("Далее", () => {
    const id = ("" + f.getText()).trim().toLowerCase();
    if (!/^[a-z][a-z0-9-]*$/.test(id)) {
      Vars.ui.showInfo("Плохой id. Нужно: my-unit (латиница, без пробелов)");
      return;
    }
    d.hide();
    onOk(id);
  }).size(140, 48);
  d.show();
}

function editNumberRow(table, label, help, obj, key) {
  const row = table.table().growX().height(40).get();
  row.left();
  row.add(label).width(160).left();
  const tf = new TextField(obj[key] == null ? "" : "" + obj[key]);
  row.add(tf).width(90).height(34);
  row.button("?", () => Vars.ui.showInfo(help)).size(36, 34);
  tf.changed(() => {
    obj[key] = tf.getText();
  });
  table.row();
  return tf;
}

function editBoolRow(table, label, help, obj, key) {
  const row = table.table().growX().height(40).get();
  row.left();
  row.add(label).width(160).left();
  const btn = row.button("" + obj[key], Styles.flatBordert, () => {
    obj[key] = obj[key] === "true" || obj[key] === true ? "false" : "true";
    btn.setText("" + obj[key]);
  }).width(90).height(34).get();
  row.button("?", () => Vars.ui.showInfo(help)).size(36, 34);
  table.row();
}

function buildStateFromWizard(ctx) {
  const state = form.newState(ctx.kind.id, ctx.id);
  Object.keys(ctx.stats).forEach(k => {
    state[k] = ctx.stats[k];
  });
  state.__weapons = ctx.weapons;
  // keep first weapon in flat keys for compatibility
  if (ctx.weapons.length) {
    const w = ctx.weapons[0];
    Object.keys(w).forEach(k => {
      state["weapon." + k] = w[k];
    });
  }
  return state;
}

function writeSprites(project, kind, id, copyFrom) {
  const paths = [];
  const isUnit = kind.folder.indexOf("units") >= 0;
  const isBlock = kind.folder.indexOf("blocks") >= 0;
  const isItem = kind.folder.indexOf("items") >= 0;
  const isStatus = kind.folder.indexOf("status") >= 0;

  function need(rel, size, vanillaName) {
    const fi = projects.projectDir(project).child(rel);
    let ok = false;
    if (copyFrom && vanillaName) {
      ok = exportAtlasPng(vanillaName, fi);
    }
    if (!ok && !fi.exists()) {
      projects.writePlaceholderSprite(project, rel, size);
    }
    paths.push({ rel: rel, size: size, exists: fi.exists() });
  }

  if (isUnit) {
    const base = copyFrom || "dagger";
    need("sprites/units/" + id + ".png", 64, base);
    need("sprites/units/" + id + "-preview.png", 64, base + "-preview");
    need("sprites/units/" + id + "-gun.png", 32, base === "flare" ? "flare-weapon" : "dagger");
    if (kind.id === "unit-legs") {
      need("sprites/units/" + id + "-leg.png", 32, "atrax-leg");
      need("sprites/units/" + id + "-foot.png", 24, "atrax-leg");
    }
  } else if (isBlock) {
    const base = copyFrom || "duo";
    need("sprites/blocks/" + id + ".png", 64, base);
    if (kind.id === "drill") {
      need("sprites/blocks/" + id + "-rotator.png", 64, "pneumatic-drill-rotator");
      need("sprites/blocks/" + id + "-top.png", 64, "pneumatic-drill-top");
    }
  } else if (isItem) {
    need("sprites/items/" + id + ".png", 32, copyFrom || "copper");
  } else if (isStatus) {
    need("sprites/status/" + id + ".png", 32, copyFrom || "burning");
  }
  return paths;
}

function writeScript(project, id, kind, code) {
  if (!code || !("" + code).trim()) return null;
  const body =
    "// Auto from Mod Studio — " + id + "\n" +
    "const unit = Vars.content.unit(\"" + project + "-" + id + "\") || Vars.content.unit(\"" + id + "\");\n" +
    "if (unit == null) {\n" +
    "  Log.warn(\"[" + project + "] unit not found: " + id + "\");\n" +
    "} else {\n" +
    "  // --- твой код ниже ---\n" +
    code +
    "\n}\n";
  return projects.writeScript(project, id + ".js", body);
}

function showWeaponEditor(ctx, onDone) {
  const d = new BaseDialog("Оружие — куда вставить пушку");
  const list = new Table();

  function rebuild() {
    list.clearChildren();
    list.top().defaults().growX().pad(2);
    list.add(tip("name оружия = имя PNG спрайта пушки (без .png).\nПример: flame-crab-gun → sprites/units/flame-crab-gun.png")).left().wrap().growX().pad(4).row();
    list.add(tip("x/y — смещение от центра юнита. x>0 справа. mirror=true делает копию слева (−x).")).left().wrap().growX().pad(4).row();

    ctx.weapons.forEach((w, idx) => {
      list.add("[accent]Оружие #" + (idx + 1) + "[]").left().padTop(8).row();
      editNumberRow(list, "имя спрайта", "Имя файла пушки без пути. Должно совпадать с PNG.", w, "name");
      editNumberRow(list, "x (влево/вправо)", "Смещение по X. 5 = справа от центра.", w, "x");
      editNumberRow(list, "y (вперёд/назад)", "Смещение по Y. + вперёд/вверх.", w, "y");
      editNumberRow(list, "перезарядка", "Кадры между выстрелами. 20 ≈ 3 раза/сек.", w, "reload");
      editBoolRow(list, "вращать пушку", "rotate=true — ствол следит за целью.", w, "rotate");
      editBoolRow(list, "зеркало (пара)", "mirror=true — вторая пушка слева автоматически.", w, "mirror");

      list.add("Пуля").left().padTop(4).row();
      const brow = list.table().growX().get();
      brow.button("тип: " + w["bullet.type"], Styles.flatBordert, () => {
        pickers.pickBulletType(w["bullet.type"], v => {
          w["bullet.type"] = v;
          rebuild();
        });
      }).growX().height(34);
      list.row();
      editNumberRow(list, "урон", "Прямой урон пули.", w, "bullet.damage");
      editNumberRow(list, "скорость пули", "Как быстро летит.", w, "bullet.speed");
      editNumberRow(list, "время жизни", "Кадры до исчезновения. Дальность ≈ speed*lifetime.", w, "bullet.lifetime");
      editNumberRow(list, "splash урон", "AoE урон (0 = выкл).", w, "bullet.splashDamage");
      editNumberRow(list, "splash радиус", "Радиус взрыва.", w, "bullet.splashDamageRadius");

      list.button("Удалить оружие #" + (idx + 1), Styles.flatBordert, () => {
        if (ctx.weapons.length <= 1) {
          Vars.ui.showInfo("Нужно хотя бы одно оружие");
          return;
        }
        ctx.weapons.splice(idx, 1);
        rebuild();
      }).growX().height(36).padTop(4).row();
    });

    list.button("+ Добавить ещё оружие", Styles.flatBordert, () => {
      const w = defaultWeapon(ctx.id, ctx.kind.id);
      w.name = ctx.id + "-gun" + (ctx.weapons.length + 1);
      w.x = "" + (5 + ctx.weapons.length * 2);
      ctx.weapons.push(w);
      rebuild();
    }).growX().height(40).padTop(8).row();
  }

  d.cont.pane(list).grow();
  rebuild();
  d.buttons.button("@back", () => d.hide()).size(120, 48);
  d.buttons.button("Готово", () => {
    d.hide();
    onDone();
  }).size(140, 48);
  d.show();
}

function showStatsEditor(ctx, onDone) {
  const d = new BaseDialog("Характеристики юнита");
  const t = new Table();
  t.top().defaults().growX();
  t.add(tip("Жизнь, броня, скорость — базовые статы. Не гонись за огромными числами сразу.")).left().wrap().pad(6).row();

  const fields = schema.schemasFor(ctx.kind.id);
  // seed stats from defaults if empty
  fields.forEach(f => {
    if (ctx.stats[f[0]] == null) ctx.stats[f[0]] = f[2];
  });

  const labels = {
    type: "тип движения",
    health: "жизни (HP)",
    armor: "броня",
    speed: "скорость",
    hitSize: "размер hitbox",
    rotateSpeed: "поворот корпуса",
    range: "дальность атаки",
    outlines: "авто-обводка",
    legCount: "число ног",
    legLength: "длина ног",
    legSpeed: "скорость ног",
    lockLegBase: "фиксировать базу ног",
    allowLegStep: "шагать на блоки",
    flying: "летает",
    engineOffset: "сдвиг двигателя",
    engineSize: "размер двигателя"
  };

  fields.forEach(f => {
    const key = f[0];
    const type = f[1];
    const label = labels[key] || key;
    const help = schema.notes[key] || key;
    if (type === "bool") editBoolRow(t, label, help, ctx.stats, key);
    else editNumberRow(t, label, help, ctx.stats, key);
  });

  d.cont.pane(t).grow();
  d.buttons.button("@back", () => d.hide()).size(120, 48);
  d.buttons.button("Далее → оружие", () => {
    d.hide();
    onDone();
  }).size(200, 48);
  d.show();
}

function showSpritesStep(ctx, onDone) {
  const d = new BaseDialog("Спрайты — картинки юнита");
  const box = new Table();
  let copyFrom = ctx.copyFrom || (ctx.kind.id === "unit-flying" ? "flare" : ctx.kind.id === "unit-legs" ? "atrax" : "dagger");

  function refresh() {
    box.clearChildren();
    box.top().defaults().growX().pad(3);
    box.add("[accent]Что это[]").left().row();
    box.add(
      tip(
        "Mindustry ищет PNG по имени:\n" +
          "• sprites/units/" +
          ctx.id +
          ".png — корпус\n" +
          "• " +
          ctx.id +
          "-preview.png — иконка\n" +
          "• имя оружия.png — пушка (должно = weapon.name)\n\n" +
          "Можно скопировать ванильный спрайт как старт, потом перекрась в любом редакторе."
      )
    )
      .left()
      .wrap()
      .growX()
      .pad(4)
      .row();

    box.add("Скопировать вид с юнита: [accent]" + copyFrom + "[]").left().padTop(6).row();
    box.button("Выбрать ванильный юнит…", Styles.flatBordert, () => {
      pickers.pickContent("unit", copyFrom, v => {
        copyFrom = v;
        ctx.copyFrom = v;
        refresh();
      });
    }).growX().height(40).row();

    box.button("Сгенерировать PNG из атласа", Styles.flatBordert, () => {
      ctx.spritePaths = writeSprites(ctx.project, ctx.kind, ctx.id, copyFrom);
      Vars.ui.showInfoToast("Спрайты записаны (или .SPRITE.txt если регион не найден)", 3);
      refresh();
    }).growX().height(44).padTop(4).row();

    box.button("Открыть папку спрайтов", Styles.flatBordert, () => {
      try {
        const dir = projects.projectDir(ctx.project).child("sprites/units");
        dir.mkdirs();
        Core.app.openFolder(dir.absolutePath());
      } catch (e) {
        Vars.ui.showInfo("" + e);
      }
    }).growX().height(40).row();

    const needed = [
      "sprites/units/" + ctx.id + ".png",
      "sprites/units/" + ctx.id + "-preview.png"
    ];
    ctx.weapons.forEach(w => {
      needed.push("sprites/units/" + w.name + ".png");
    });
    if (ctx.kind.id === "unit-legs") {
      needed.push("sprites/units/" + ctx.id + "-leg.png");
      needed.push("sprites/units/" + ctx.id + "-foot.png");
    }

    box.add("[accent]Нужные файлы[]").left().padTop(8).row();
    needed.forEach(rel => {
      const fi = projects.projectDir(ctx.project).child(rel);
      const mark = fi.exists() ? "[accent]OK[]" : "[red]нет[]";
      box.add(mark + "  " + rel).left().pad(2).row();
    });
  }

  d.cont.pane(box).grow();
  refresh();
  d.buttons.button("@back", () => d.hide()).size(120, 48);
  d.buttons.button("Далее → код", () => {
    d.hide();
    onDone();
  }).size(180, 48);
  d.show();
}

function showCodeStep(ctx, onDone) {
  const d = new BaseDialog("Код (необязательно)");
  d.cont.add(
    tip(
      "HJSON уже задаёт юнит и пушку. JS нужен для особой логики:\n" +
        "кастомные пули, abilities, draw(). Можно пропустить."
    )
  )
    .left()
    .wrap()
    .growX()
    .pad(8)
    .row();

  const presets = d.cont.table().growX().get();
  presets.defaults().pad(2);
  presets.button("Пусто", Styles.flatBordert, () => {
    area.setText("");
  }).height(36);
  presets.button("Лог при загрузке", Styles.flatBordert, () => {
    area.setText('  Log.info("[studio] ' + ctx.id + ' ready, health=" + unit.health);\n');
  }).height(36);
  presets.button("Ability shield", Styles.flatBordert, () => {
    area.setText(
      "  unit.abilities.add(new ForceFieldAbility(40, 40, 300, 240));\n" +
        '  Log.info("[studio] shield on ' +
        ctx.id +
        '");\n'
    );
  }).height(36);
  d.cont.row();

  const area = new TextArea(
    ctx.code ||
      "  // unit — уже найденный UnitType\n" +
        "  // Пример: unit.health = 900;\n"
  );
  d.cont.add(area).grow().pad(6).row();

  d.buttons.button("Пропустить", () => {
    ctx.code = "";
    d.hide();
    onDone();
  }).size(140, 48);
  d.buttons.button("Сохранить с кодом", () => {
    ctx.code = area.getText();
    d.hide();
    onDone();
  }).size(200, 48);
  d.show();
}

function showReviewSave(ctx, onSaved) {
  const state = buildStateFromWizard(ctx);
  const hjson = form.toHjson(state);

  const d = new BaseDialog("Готово — сохранить");
  d.cont.add("[accent]" + ctx.kind.label + "[]  id=[accent]" + ctx.id + "[]  мод=[accent]" + ctx.project + "[]")
    .left()
    .pad(6)
    .row();
  d.cont.add(tip("После сохранения: Mods → выключи/включи мод или перезапусти игру.")).left().wrap().growX().pad(4).row();

  const area = new TextArea(hjson);
  d.cont.add(area).grow().pad(4).row();

  d.buttons.button("@back", () => d.hide()).size(120, 48);
  d.buttons.button("ЗАПИСАТЬ В МОД", () => {
    try {
      const body = area.getText();
      const path = projects.writeContent(ctx.project, ctx.kind.folder, ctx.id, body);
      if (!ctx.spritePaths) {
        ctx.spritePaths = writeSprites(ctx.project, ctx.kind, ctx.id, ctx.copyFrom);
      }
      // ensure weapon sprite notes
      ctx.weapons.forEach(w => {
        const rel = "sprites/units/" + w.name + ".png";
        const fi = projects.projectDir(ctx.project).child(rel);
        if (!fi.exists()) projects.writePlaceholderSprite(ctx.project, rel, 32);
      });
      let scriptPath = null;
      if (ctx.code && ("" + ctx.code).trim()) {
        scriptPath = writeScript(ctx.project, ctx.id, ctx.kind, ctx.code);
        // append require to main.js if missing
        try {
          const main = projects.projectDir(ctx.project).child("scripts/main.js");
          let m = main.exists() ? main.readString() : "";
          const req = 'require("' + ctx.id + '");';
          if (m.indexOf(req) < 0) {
            m = req + "\n" + m;
            main.writeString(m, false);
          }
        } catch (e2) {}
      }
      d.hide();
      Vars.ui.showInfo(
        "Сохранено!\n\n" +
          path +
          (scriptPath ? "\n" + scriptPath : "") +
          "\n\n1) Открой папку мода и дорисуй PNG если нужно\n" +
          "2) Mods → Reload / перезапуск\n" +
          "3) Песочница → Spawn / Inspect"
      );
      if (onSaved) onSaved(ctx);
    } catch (e) {
      Vars.ui.showInfo("Ошибка: " + e);
    }
  }).size(220, 48);
  d.show();
}

/** Главный мастер создания юнита */
exports.startUnitWizard = function (projectName, onSaved) {
  ensureProject(projectName, project => {
    const pick = new BaseDialog("Создать юнит — шаг 1/6: тип");
    pick.cont.add(tip("Выбери, как юнит двигается. От этого зависят ноги/двигатель и шаблон.")).left().wrap().growX().pad(8).row();
    pick.cont.pane(t => {
      t.defaults().growX().height(48).pad(3);
      const unitKinds = templates.kinds.filter(k => ("" + k.id).indexOf("unit") === 0);
      const desc = {
        "unit-legs": "Паук / ноги (atrax-like) — legCount, lockLegBase",
        "unit-mech": "Ходок на «ногах-меха» (dagger-like)",
        "unit-flying": "Самолёт / дрон (flare-like)",
        "unit-naval": "Корабль (risso-like)"
      };
      unitKinds.forEach(k => {
        t.button(k.label + "\n[lightgray]" + (desc[k.id] || "") + "[]", Styles.flatBordert, () => {
          pick.hide();
          askId("Шаг 2/6: id юнита", "my-unit", id => {
            const ctx = {
              project: project,
              kind: k,
              id: id,
              stats: {},
              weapons: [defaultWeapon(id, k.id)],
              code: "",
              copyFrom: k.id === "unit-flying" ? "flare" : k.id === "unit-legs" ? "atrax" : k.id === "unit-naval" ? "risso" : "dagger"
            };
            // seed type field
            const st = form.newState(k.id, id);
            Object.keys(st).forEach(key => {
              if (key.indexOf("__") === 0 || key.indexOf("weapon.") === 0) return;
              ctx.stats[key] = st[key];
            });
            showStatsEditor(ctx, () => {
              showWeaponEditor(ctx, () => {
                showSpritesStep(ctx, () => {
                  showCodeStep(ctx, () => {
                    showReviewSave(ctx, onSaved);
                  });
                });
              });
            });
          });
        }).row();
      });
    }).grow();
    pick.buttons.button("@back", () => pick.hide()).size(140, 50);
    pick.show();
  });
};

exports.startBlockWizard = function (projectName, onSaved) {
  ensureProject(projectName, project => {
    const pick = new BaseDialog("Создать блок");
    pick.cont.pane(t => {
      t.defaults().growX().height(44).pad(2);
      templates.kinds
        .filter(k => k.folder.indexOf("blocks") >= 0)
        .forEach(k => {
          t.button(k.label, Styles.flatBordert, () => {
            pick.hide();
            askId("id блока", "my-block", id => {
              const state = form.newState(k.id, id);
              const body = form.toHjson(state);
              try {
                const path = projects.writeContent(project, k.folder, id, body);
                writeSprites(project, k, id, k.id === "drill" ? "pneumatic-drill" : k.id === "turret" ? "duo" : "graphite-press");
                Vars.ui.showInfo("Блок записан:\n" + path + "\nОткрой папку и замени PNG.");
                if (onSaved) onSaved({ project: project, id: id, kind: k });
              } catch (e) {
                Vars.ui.showInfo("" + e);
              }
            });
          }).row();
        });
    }).grow();
    pick.buttons.button("@back", () => pick.hide()).size(140, 50);
    pick.show();
  });
};

exports.startItemWizard = function (projectName, onSaved) {
  ensureProject(projectName, project => {
    askId("id предмета", "my-item", id => {
      const state = form.newState("item", id);
      try {
        const path = projects.writeContent(project, "content/items", id, form.toHjson(state));
        writeSprites(project, { folder: "content/items", id: "item" }, id, "copper");
        Vars.ui.showInfo("Предмет:\n" + path);
        if (onSaved) onSaved({ project: project, id: id });
      } catch (e) {
        Vars.ui.showInfo("" + e);
      }
    });
  });
};

exports.exportAtlasPng = exportAtlasPng;
