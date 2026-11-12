# <img src="icon.svg" alt="" width="32" height="32"> Eurhythmics Lab

A study tool for CMU Eurhythmics I rhythm lists. It generates, plays and
visualizes rhythms built from the binary and ternary lists, with tools for practice,
dictation, composing rhythms and simple melodies.

**Author:** Bruno Gracia

## Running it

It's a static site (`index.html`, `styles.css`, `app.js`). Serve the folder:

```bash
python3 -m http.server 8000
```

then visit http://localhost:8000. An internet connection is needed for the
notation library (VexFlow, from jsDelivr) and the web fonts.

## Pages

- **Practice** — random rhythms from the selected lists, meter (2/4–5/4, or compound
  6/8–15/8) and
  number of bars. Optional melody mode adds pitches in a major or minor key with
  a harmony plan that cadences on the right bars (half cadence mid-way,
  authentic cadence at the end).
- **Dictation** — a hidden rhythm behind one tile per beat; tap a beat to check
  it. Bar-by-bar playback and an exam mode (set number of plays with a gap,
  metronome muted, playhead hidden).
- **Compose** — drag cells from the palette onto the staff (or tap to add),
  remove, undo, play.
- **Assemble** — place notes and rests on a grid of the beat's subdivision (8ths, 16ths
  or triplets in x/4; 8ths or 16ths in x/8) and see it in standard notation, rewritten beat by beat
  with the list rhythms and the fewest ties. Every list for the meter is used unless
  Selected lists only is on. Send to Practice makes it the Practice score.
- **Glossary** — every cell in the lists, playable.

## Rhythm lists

| List | Cells |
|---|---|
| Binary List 1 | quarter, two eighths, eighth triplet, four sixteenths, half |
| Binary List 2 | dotted quarter + eighth, eighth + dotted quarter, eighth–quarter–eighth |
| Binary List 2 (Alternate) | Binary List 2 with each eighth replaced by two sixteenths |
| Binary List 3 | eighth + two sixteenths, two sixteenths + eighth, sixteenth–eighth–sixteenth, dotted eighth + sixteenth, sixteenth + dotted eighth |
| Ternary List 1 | dotted quarter, three eighths, quarter + eighth, eighth + quarter, 16-16-8-8, 8-16-16-8, 8-8-16-16, 16-16-16-16-8, 16-16-8-16-16, 8-16-16-16-16, six sixteenths, dotted half |

Binary lists are used in x/4 meters and ternary lists in compound meters (6/8,
9/8, 12/8, 15/8), where the beat is a dotted quarter: the tempo is given per
dotted quarter, the metronome clicks 1, 3 or 6 times per beat, and the counting
row reads 1 & a on the eighths and 1 ta & ta a ta on the sixteenths.

## Features

- Even (proportional) spacing: every sixteenth has the same width, across barlines.
- 1 e & a counting row with circled struck syllables, underlines for held
  notes, pulse circles and optional beat lines.
- Playback visuals: playhead, bouncing balls (notes / metronome), note and
  grid highlights that fade with the playhead, a conducting-pattern minimap
  (left, right or both hands; two to five beats per bar).
- Display modes for the practice score: show, semi-reveal, hidden,
  reveal as played, window.
- Sound: Web Audio instruments (piano, marimba, synth, woodblock, snare, clap),
  metronome sounds and subdivisions, velocity by beat strength, legato for
  melodies, count-in with an on-screen countdown.
- Light and dark mode, phone layout, a first-visit walkthrough.
- Settings and the Compose page's rhythm are saved in the browser (localStorage).
- A visit counter kept by [Abacus](https://jasoncameron.dev/abacus/) (total page loads
  and first-time visitors; no cookies). It isn't shown on the page; read the numbers at
  https://abacus.jasoncameron.dev/get/bgracia-cmu-eur-lab/visits and
  https://abacus.jasoncameron.dev/get/bgracia-cmu-eur-lab/visitors

## Code layout

`index.html` holds the markup, `styles.css` the styles, and `app.js` one script
organized in sections — rhythm data, settings, generation, melody (pitch
layer), notation (VexFlow), the shared renderer, playback visuals, audio,
and one controller per page.

The melody is stored as a pitch layer (`model.voices[0].pitch`) aligned with
the rhythm (`model.flat`), so further voices (e.g. a canon) can be added
without changing the rhythm code.

## License

Copyright © 2026 Bruno Gracia. All rights reserved — see [LICENSE](LICENSE).
VexFlow (MIT) and the Manrope and DM Mono fonts (SIL Open Font License) are
loaded from their CDNs and keep their own licenses.
