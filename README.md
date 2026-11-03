# Mindustry Mod Studio 1.1

In-game студия модов в духе **PatchEditor**, но для полноценных HJSON/JS модов.

## Открыть
- Чат: `/studio`
- Sandbox: блок **Studio Terminal** → Configure

## Как PatchEditor
| PatchEditor | Mod Studio |
|---|---|
| Дерево полей + notes | Field tree: имя = note, значение = picker |
| Color / Sound / Content selectors | Color, Sound, Effect, Content, Texture, Bool, BulletType |
| Magic Export | **Clone** — юнит/блок/предмет → файлы проекта |
| Undo / Redo | Undo / Redo в тулбаре |
| Export HJSON | **Create** / **Save** raw HJSON в `saves/mods/<project>/` |
| Stay in game | Spawn + Inspect без выхода |

## Workflow
1. **New** → проект в `Mindustry/saves/mods/`
2. **Kind…** + id → правь поля пикерами
3. **Create** → HJSON + `.SPRITE.txt` подсказки
4. Положи PNG рядом с подсказками
5. Mods → enable → restart
6. **Spawn** / **Inspect**

## Установка
`mindustry-mod-studio.zip` → `saves/mods/` (уже в Steam mods).
