# Jam Cycle Map

Visual reference for the Jam product delivery framework: the eight-week cycle by function, cross-functional milestones, and the documents that progress through it.

Live page: https://document-crunch.github.io/jam-cycle-map/

## How it works

- `jam-framework.json` is the framework. Lanes, weekly activities, milestones, documents, notes. Edit this.
- `template.html` renders the data. Only touch it to change the look or add a view.
- `build.sh` inlines the JSON into the template and writes `index.html`, which GitHub Pages serves.
- `meta.groups` in the JSON defines the audience groups a reader can toggle on the cycle
  view. A milestone whose `kind` is not a listed group (`team`, `gate`) stays in the data
  and is never drawn. Dot colour and shape live in `template.html`'s CSS, keyed on the
  group id.
- Milestone `at` is a half-week step from 0 to 8. Whole numbers are week boundaries;
  halves are mid-week.

## Making a change

Run `./ship.sh "commit message"` after editing `jam-framework.json`. It builds, runs the
checks, commits, pushes, and then polls the live page until it actually serves the version
in the JSON. It exits non-zero if the page never catches up, so a green run means the
company page is current. Nothing is "done" before that.

The steps it wraps, if you need them individually:

1. Edit `jam-framework.json`.
2. Run `./build.sh` (needs python3).
3. Run `node verify.js`. It checks the data invariants and that `index.html` matches its
   sources. Non-zero exit means do not push.
4. Commit and push `jam-framework.json` and `index.html`. Pages updates within a minute or two.

GitHub Pages serves the HTML with `cache-control: max-age=600`, so your own browser can
show a stale copy for up to ten minutes after a good deploy. Hard-reload before concluding
the page did not update.

Owner: Program Management. Source docs live in Notion under Program Management Home / Jam! Delivery Framework.

## Promoting in-page edits to the company page

Ryan edits inside the Claude artifact (Edit toggle). To publish those edits here: save the artifact HTML, run `python3 promote.py that.html`, then `./build.sh`, commit and push.
