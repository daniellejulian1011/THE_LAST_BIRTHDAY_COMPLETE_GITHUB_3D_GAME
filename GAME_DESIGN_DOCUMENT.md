# THE LAST BIRTHDAY — GAME DESIGN DOCUMENT

## Game pillar 1 — Remembered happiness becomes fear

The game should repeatedly contrast *1973 birthday marketing* with *1983 abandonment*. The same pink rabbit appears smiling in archival photos and stalking the player with no sound. Archival audio comes from equipment, never the present-day mascot.

## Game pillar 2 — Mystery grounded in human responsibility

The electrical fire came from neglected stage wiring. Chained exits and Edwin's failure to act killed Robin. Ruth's maintenance log and Edwin's confession can be pieced together into a credible account. Robin's death is confirmed. The supernatural element begins *after* the fire and is never used to absolve Edwin.

## Game pillar 3 — Player-made fear

The player chooses whether to investigate, preserve or broadcast archives, turn the generator on, hide, risk camera flashes, open the backstage door, or leave. Choices influence threat pressure and determine the outcome.

## Visual brief

- **Time:** Rainy evening, October 27, 1983; the location closed in 1973.
- **Palette:** almost-black navy, soot gray, mold green, aged warm cream, dull carnival red, faded pink, oxidized brass.
- **Materials:** chipped varnish, damp tile, moldy wall coverings, dusty CRT glass, discolored stage velvet, fire-blackened wood and cracked plaster.
- **Lighting:** moon spill from roof gaps, oscillating ceiling bulbs, flashlight cone, pale CRT bloom, intermittent red emergency fixtures.
- **Post:** scanlines, faint film grain, vignette, a quick red chromatic-like attack overlay (prototype), camera flash.
- **Mood:** empty hospitality, nostalgic dread, nearly silent threat; avoid jump scares in every room.

## Room-by-room experience

| Area | Narrative discovery | Interaction / danger | Audio anchor |
| --- | --- | --- | --- |
| Entrance | June's unmarked package | Letter, exit choice | Rain, distant fluorescent electrical hum |
| Main corridor | Corporate party posters | Key area linking all rooms | Metal shoes far away after generator |
| Party Room | Robin's last birthday | Cassette 01, family photo / animated memory reconstruction | 1973 show reel; fire alarm |
| Game Arcade | Ruth's testimony | Cassette 02, locker hide | Damaged CRT whines, token rattles |
| Manager's Office | Edwin's culpability | Ledger, brass backstage key | Clock ticks, paper shuffle |
| Maintenance | Electrical failures | Ceramic fuse, restore power | Generator rumble, PA static |
| Back Hall | Chained doors, three knocks | Gate unlock, chase line | Heavy thud, chain drag |
| Stage | Confession, empty chair, final proof | Five final choices | Sparse music-box notes, silence |

## Enemy AI — Mr. Morrow

**Sleeping:** hidden until generator power is restored.

**Patrolling:** scripted points down main corridor. Animates Walk. Creates distant thuds/clicks; watches and approaches.

**Chasing:** proximity is determined by distance; increased detection range after noisy archive playback. Animates Chase. Moves faster and may clip room partitions in this stylized prototype (production design should use a navmesh and doorway-aware pathfinding).

**Stunned:** camera-flash mechanic uses limited consumable flashbulbs. If the player is facing the rabbit in range, pauses AI for approximately three seconds.

**Hiding:** a prize locker suppresses player detection for a limited time, but the player cannot move.

**Caught:** a 3D face-to-face attack and red glitch overlay, then loss of nerve and return to foyer; three captures lead to GAME OVER.

**Finale:** stands mutely while the player chooses how to handle the evidence and strange knocks.

## Jumpscare library for a production version

1. **The Doorway:** rabbit appears at the edge of the flashlight and stands without motion, then moves as the player looks away.
2. **The Locker:** a huge eye appears just outside the crack; after a long pause, heavy shoes recede.
3. **Wrong-Side Wave:** archived 1973 photo shows a friendly wave; later the burnt mascot repeats it from a dark hallway.
4. **The Mechanical Lunge:** two long strides and a head-first close-up; no roar, no spoken line.
5. **Staged Birthday:** sudden single flash reveals a new paper party hat at an empty chair.
6. **Game Over:** quiet seating ritual, no dialogue from the rabbit.

## Puzzle chain (implemented in prototype)

- Recover party and arcade cassettes and office ledger (three required archives).
- Collect the brass backstage key from the office ledger.
- Find the ceramic fuse in maintenance.
- Decide to restore generator power; this wakes the rabbit.
- Unlock the backstage access, then approach the microphone/stage prop.
- Choose one of five narrative exits. Sixth ending occurs if the player is caught three times.

## Audio architecture

**Currently playable:** procedural Web Audio deep drone, room-hum oscillators, low-frequency steps, sting sweeps, flashlight clicks, a degraded musical motif. No licensed music or bundled voice actors.

**Planned:** foley for wet tiles, worn gloves, hydraulic servos, cloth brushes and rusted mechanical joint clicks; distinct 1973 cassette filter with clipping and tape flutter; binaural/spatial audio occlusion for footsteps through walls, chain scraping, distant collapsed structure; field recordings of Maine rain and highway wind. The 1983 Mr. Morrow vocal bus must be empty.

## Character asset pipeline

Eight `/models/*.glb` skinned 3D assets are generated by `build_characters.py` with a 15-bone hierarchy. They use glTF 2.0 materials and baked skeletal animation clips (Idle/Walk/Run plus role-specific actions). Skin weights are rigid (one driving bone per vertex), appropriate for a **prototype mechanical puppet**, not deformable AAA human skin.

A studio model inspector is supplied as `model-viewer.html`. The runtime loads with Three.js GLTFLoader and plays clips with AnimationMixer. The hero antagonist also has a low-fidelity primitive fallback if a model cannot load. For final commercial assets, refine and re-export from Blender with high quality UV texture sets, tangential normals, authored blendshapes, physically-based texturing, retargetable skeleton, IK rig and bespoke attack animations.

## Additional production milestones not yet delivered

- Replace procedural floor and geometry with custom Blender architecture and prop meshes.
- Implement proper navigation mesh and sightline/occlusion-driven AI.
- Record original 1973 voice acting and soundtrack, implement interactive spatial audio and occlusion.
- Create true in-engine interactive 1973 playable flashback sequences with accurate custom child rigs.
- Replace placeholder camera-flash mechanic with richer exposure/film inventory system.
- Add save slots, accessibility settings and difficulty levels, graphics options and subtitles/captioning.
- Profile Android and desktop GPUs; add mesh LOD/texture compression and QA across browsers.
