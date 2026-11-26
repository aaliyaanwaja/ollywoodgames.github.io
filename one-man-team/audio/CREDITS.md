# Sound credits

Every recorded sound in the game is public domain (CC0 1.0 Universal). No attribution is required; it is given here so
that anyone can check where each file came from. The interface clicks, the whistle and every sound below when its file
fails to load are synthesised in `js/audio.js` and need no credit.

The files in this folder are the edited versions the game plays. `tools/make-sounds.py` packs them into
`js/sounds.js` (base64), which is what the game actually loads, so that the sounds work from a single HTML file, from
`file://` and inside the app without any network request.

| File | Used for | Source | Original file | Licence | Edit (ffmpeg) |
|---|---|---|---|---|---|
| `boot-light.mp3` | a pass | Kenney, Impact Sounds pack, via github.com/Boyquotes/kenney-impact-sounds-for-godot | `impact_punch_medium_001.ogg` | CC0 1.0 (LICENSE in that repository; Kenney releases all his packs under CC0) | mono, first 0.32 s, 0.12 s fade, loudness -16 LUFS |
| `boot-heavy.mp3` | a shot | Kenney, Impact Sounds, as above | `impact_punch_heavy_002.ogg` | CC0 1.0 | mono, 0.42 s, fade, -14 LUFS |
| `touch.mp3` | first touch | Kenney, Impact Sounds, as above | `impact_soft_medium_001.ogg` | CC0 1.0 | mono, 0.18 s, fade, -18 LUFS |
| `glove.mp3` | a keeper's save | Kenney, Impact Sounds, as above | `impact_soft_heavy_000.ogg` | CC0 1.0 | mono, 0.4 s, fade, -16 LUFS |
| `thud.mp3` | a tackle, a collision | Kenney, Impact Sounds, as above | `impact_punch_heavy_000.ogg` | CC0 1.0 | mono, 0.5 s, low-pass 900 Hz, fade, -15 LUFS |
| `net.mp3` | the ball hitting the net | SoundKit by Soundza, github.com/soundza/soundkit | "Crisp Punch Swish" (`registry/soundza/sounds/punch-swish.ts`) | CC0 1.0 (LICENSE-AUDIO in that repository) | mono, high-pass 700 Hz, fade, -18 LUFS |
| `crowd-roar.mp3` | the crowd after a goal | SoundKit by Soundza, as above | "Stadium Crowd Applause" (`stadium-crowd-applause.ts`) | CC0 1.0 | mono, 5.8 s, fades, -16 LUFS |
| `crowd-bed.mp3` | the crowd under play (looped, swells on the decisive shot) | SoundKit by Soundza, as above | "Stadium Crowd Applause" | CC0 1.0 | mono, 0.6-5.6 s, band 120-700 Hz, fades, -26 LUFS |
| `goal-sting.mp3` | the brass sting on a goal | SoundKit by Soundza, as above | "Brass Fanfare Stinger" (`brass-fanfare-stinger.ts`) | CC0 1.0 | mono, first 2.8 s, 0.8 s fade, -16 LUFS |
| `paper.mp3` | the round-start card folding away | SoundKit by Soundza, as above | "Paper 3" (`paper-3.ts`) | CC0 1.0 | mono, 0.4 s, fade, -22 LUFS |
| `ambience.mp3` | the quiet crowd on the home screen (looped) | SoundKit by Soundza, as above | "Crowd Clapping Crisp" (`crowd-clapping.ts`) | CC0 1.0 | mono, low-pass 1.2 kHz, fades, -30 LUFS |

Sourced on 26 November 2026. SoundKit's audio is CC0 per its `LICENSE-AUDIO` ("Each sound was released under CC0 1.0
Universal by its creator, and Soundza dedicates its own edits to the public domain under CC0 1.0 Universal as well").
Kenney's Impact Sounds pack is CC0 per the `LICENSE` file of the repository it was taken from and Kenney's own
licence for the pack.

Not found under a free licence in the time available, so still synthesised or left out: a referee's whistle (the
synthesised one is kept, the review found it convincing), a tea urn and rain on a tin roof for the home ambience (the
plan's suggestion; the home screen uses a distant crowd only). If the owner buys a sports pack later, replace the files
of the same name and rerun `python3 tools/make-sounds.py`.
