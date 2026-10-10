# Test & QA checklist — THE LAST BIRTHDAY

## Static automation performed
- [x] `node --check script.js`
- [x] `node --check viewer.js`
- [x] Eight GLB files built and decoded as valid trimesh scenes.
- [x] GLB files contain 15 joints, skin attributes and animation clips (see package validation script).
- [x] Original prohibited researcher storyline removed from playable script.
- [x] 1973 archival voice distinct from entirely mute 1983 antagonist.

## Manual playtest still required
- [ ] GitHub Pages loads Three.js, GLTFLoader and eight character GLB models in Chrome/Edge.
- [ ] Start screen → Enter the Palace → prologue choices; pointer lock / click to resume.
- [ ] WASD movement, colliding with room walls and props; drag-to-look on mobile.
- [ ] Recover party tape, Ruth recording, Edwin ledger/key.
- [ ] Interact with photograph: 1973 models become visible; put photo away hides them.
- [ ] Fuse → generator → music-box track; 1983 Morrow wakes and animates.
- [ ] Chase, hiding, camera-flash stun, jump scare, retry after two catches.
- [ ] Third catch triggers Never Found ending.
- [ ] Open Backstage with all requirements and reach final 5 choices.
- [ ] Front exit gives The Guest Who Left ending.
- [ ] Endings save in localStorage; archive reveals discovered endings after replay.
- [ ] Sound mute button, journal, map, pause, resize, touch HUD usability.
- [ ] GLB model viewer allows each model and clip to be selected, rotated and zoomed.

If the screen is black, first check browser console for blocked CDN, disabled WebGL, script errors, or GLB 404 paths. Launch from a static HTTP server, not by double-clicking `index.html`.
