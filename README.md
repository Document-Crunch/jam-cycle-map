# Jam Cycle Map

Visual reference for the Jam product delivery framework: the eight-week cycle by function, cross-functional milestones, and the documents that progress through it.

Live page: https://document-crunch.github.io/jam-cycle-map/

## How it works

- `jam-framework.json` is the framework. Lanes, weekly activities, milestones, documents, notes. Edit this.
- `template.html` renders the data. Only touch it to change the look or add a view.
- `build.sh` inlines the JSON into the template and writes `index.html`, which GitHub Pages serves.

## Making a change

1. Edit `jam-framework.json`.
2. Run `./build.sh` (needs python3).
3. Commit and push `jam-framework.json` and `index.html`. Pages updates within a minute or two.

Owner: Program Management. Source docs live in Notion under Program Management Home / Jam! Delivery Framework.

## Promoting in-page edits to the company page

Ryan edits inside the Claude artifact (Edit toggle). To publish those edits here: save the artifact HTML, run `python3 promote.py that.html`, then `./build.sh`, commit and push.
