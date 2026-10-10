# THE LAST BIRTHDAY 🎈🐰🩸
### A GitHub Pages–ready first-person 3D horror game prototype

**Play as June Mercer** on October 27, 1983, ten years after a fire at an abandoned children’s party venue killed her seven-year-old brother. Find archival evidence, hide from the completely silent Mr. Morrow, confront Edwin Candlewick's wrongdoing, and uncover one of six endings.

## 🎮 Launch it

1. Extract the ZIP so `index.html` and `script.js` are at the **root of the GitHub repository** alongside `models/` and `assets/`.
2. In GitHub, open repository **Settings → Pages → Build and deployment → Deploy from a branch → main → /(root)** and save.
3. Open the GitHub Pages URL GitHub generates. **Requires internet** to load Three.js r160 from jsDelivr. WebGL-capable browser required.
4. On a computer, you can test locally by running `python -m http.server 8000` in the project folder and visiting `http://localhost:8000` (do not double-click the HTML file; browser modules and assets require an HTTP server).

Open **`model-viewer.html`** in the same published folder to rotate and inspect each animated GLB character and its clips.

## ⌨️ Game controls

| Action | Desktop | Touch |
|---|---|---|
| Move / look | WASD + mouse | Left joystick + drag the right side of screen |
| Interact | E | USE |
| Run | Shift | Hold RUN |
| Flashlight | F | LIGHT |
| Camera flash stun | P (three flashbulbs) | FLASH |
| Journal / evidence | J | NOTES |
| Floor plan | M | MAP |
| Pause / resume | Escape | Top-right pause |

Click the game canvas after choosing a dialogue option if mouse lock was lost.

## 🗺️ Suggested first playthrough

Entrance → explore left Party Room and its photo → right Arcade → rear-left Manager's Office → rear-right Maintenance (ceramic fuse + generator) → rear Backstage Door (brass key + two recordings + power) → Birthday Stage → final choice.

The exit is available from the beginning, for the *The Guest Who Left* ending. Restoring the power activates Mr. Morrow; flashbulbs briefly stun him if aimed at him. The prize locker in the arcade provides temporary hiding. After three captures, the game-over ending occurs.

## 🐰 Character files included

Actual `glTF 2.0` binary models in `/models/`, **skinned meshes** with 15 skeletal joints and rigid procedural skin weights, fully generated and rigged for this prototype. An animation mixer and clips run them in Three.js. Each model is viewable independently:

| GLB | Animation clips | Role |
|---|---|---|
| `mr_morrow_1983.glb` | Idle, Walk, Run, Chase, Jumpscare | Mute main antagonist |
| `mr_morrow_1973.glb` | Idle, Walk, Run, Chase, Jumpscare, Wave | Original friendly mascot flashback |
| `june_1983.glb` | Idle, Walk, Run, Gesture | Protagonist reference; first-person game view |
| `june_1973.glb` | Idle, Walk, Run, Gesture | 14-year-old June, flashback |
| `robin_1973.glb` | Idle, Walk, Run, Gesture | Robin, age 7, archival flashback only |
| `edwin_1973.glb` | Idle, Walk, Run, Gesture | Owner, archival flashback |
| `ruth_1973.glb` | Idle, Walk, Run, Gesture | Technician, archival flashback only |
| `ivy_1973.glb` | Idle, Walk, Run, Gesture | Survivor, archival flashback |

**Transparency:** These are stylized low/medium-poly procedural rigs; they are functional game prototypes, **not** the photorealistic production meshes depicted by your concept art. For professional AAA results, replace them with detailed modeled/sculpted, UV-textured and professionally animated GLBs using Blender/Maya. The `build_characters.py` script regenerates the model assets.

## 📁 Repository structure

```
index.html            — main game screen and menus
style.css             — responsive horror HUD, menus and effects
script.js             — 3D scene, gameplay, branching story and animations
model-viewer.html     — standalone GLB model and animation inspector
viewer.js             — model inspector logic
viewer.css            — inspector design
models/*.glb          — 8 skinned, animated glTF character assets
assets/*.jpg          — optimized visuals derived from provided concept sheets
build_characters.py   — procedural GLB generation script
STORY_BIBLE.md        — characters, story, chronology, endings
GAME_DESIGN_DOCUMENT.md — scene design, puzzles, enemy behavior, sound plan
TEST_CHECKLIST.md     — manual playtest cases
```

## 🎧 Audio and visual notes

The prototype uses Web Audio synthesized dark drones, sound effects, and a music-box motif. **No voice actor files are bundled.** All original 1973 spoken Mr. Morrow lines appear in the cassette UI as archival transcripts; the present-day stalker remains completely silent. The playable environment is geometrically modeled and uses procedural textures, real-time lights, fog, shadow maps and an atmospheric UI. It is **not** a photoreal cinematic renderer. A polished future release would need recorded dialogue (archives only), sound design, custom high-detail textures, motion-capture polish, baked lights and extensive QA.

## ⚠️ Testing and technical limits

- `node --check` used for script syntax, files and GLB glTF structure inspected programmatically.
- Full in-browser visual playtesting was **not possible** in the creation environment because opening local pages in Chromium was blocked by the sandbox. Please test on GitHub Pages and report any console errors.
- Uses a public CDN for Three.js and Google Fonts; no build tooling or API keys. The game itself stores only unlocked ending IDs in local browser storage.
- Best on desktop Chrome/Edge with hardware-accelerated WebGL; mobile touch support is a prototype feature and may need further tuning depending on the phone.
- This is a **playable prototype**, not a packaged downloadable native PC executable or a complete commercial-scale title.

---
**The fire ended in 1973. The birthday never did.**
