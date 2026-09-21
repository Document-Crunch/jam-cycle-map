# Functional meetings on the Jam Cycle Map

Date: 2026-09-21
Status: approved, ready for implementation planning

## Problem

The cycle map draws six audience types of cross-functional moment but only ever
shows four of them: whole company, Build Org, leadership, CS & Sales. Team and
pod sessions sit in the data, hidden. Two gaps follow from that.

First, the function-level rhythm is invisible. Product, Design and Engineering
each run their own sessions through the cycle — refinements, share-outs,
delivery checks, proposals, intake — and none of them appear. A reader cannot
see what week 1 actually looks like for an engineer.

Second, the audience dot does not survive stacking. Chips at the same week
boundary render as a column under a single dot taken from the first chip in the
list, so Portfolio Review and Enablement Session 1 — different audiences at the
same moment — look identical.

## Approach

Three changes, in the data model, the controls, and the chip.

The audience type becomes a first-class, toggleable group. Seven groups are
visible, the existing four plus Product, Design and Engineering. Each group can
be switched on and off the way the cycle filters already work.

Every chip carries its own dot and a short audience label, so a stack of chips
at one boundary is readable.

Milestones can sit mid-week, because several of the new sessions do.

Nothing about Product Marketing or Program & Enablement changes. Their lanes
stay; they get no group and no meetings. That is deliberate — only the three
Build Org functions are being added.

## Data model

### `meta.groups`

A new ordered array, replacing the hardcoded `KIND_LABEL` map in the template
and the hand-written legend markup. Each entry carries `id`, `name`, `short`
(the chip label), `color`, `shape` and `default` (whether its toggle starts on).

| id | chip label | name | colour | shape |
|---|---|---|---|---|
| `org` | WHOLE CO | Whole company | `--org` | filled circle |
| `build` | BUILD ORG | Build Org | `--build` (new) | rounded square |
| `leadership` | LEADERSHIP | Leadership | `--org` | square |
| `gtm` | CS & SALES | CS & Sales | `--program` | filled circle |
| `product` | PRODUCT | Product | `--product` | filled circle |
| `design` | DESIGN | Design | `--design` | filled circle |
| `engineering` | ENG | Engineering | `--engineering` | filled circle |

Build Org currently borrows `--product` for its dot. It moves to a new
`--build` teal so Product can own `--product`, matching its lane.

`team` and `gate` remain defined for the milestones that still use them but are
not listed as groups, which is how they are hidden today. `meta.visibleKinds`
is superseded by the `default` flag on each group.

### Fractional `at`

Milestone `at` accepts half-week steps. `0.5` means the middle of week 1, `1`
the end of week 1 / start of week 2. Integer semantics are unchanged.

`boundaryName()` gains a mid-week case: "Middle of week N".

Week boundary lines stay on integers. A mid-week chip gets a short dashed tick
rather than a full-height line, so it does not read as mis-aligned against the
week grid.

### `repeats`

An optional string on a milestone — `"per opportunity"`, `"per pod"`,
`"weekly, weeks 3-4"`. It renders as a small badge on the chip and reads in
full in the detail panel. It is how a session that happens several times a
cycle stays one chip without claiming to be one meeting.

## Controls

A second row of toggles under the three cycle filters: one checkbox per group,
in the same `.toggle` pill style, using the group's own dot as the swatch. An
"All" and "None" pair, because seven checkboxes is a lot of clicking.

The two rows behave differently, on purpose:

- Cycle toggles **fade** blocks. They are about emphasis across a dense lane
  grid where the blocks' positions carry meaning.
- Audience toggles **remove** chips and re-lay out the milestone track. They
  are about crowding, and leaving faded chips in place would not relieve it.
  Removing means re-running `sizeMsRows()` after each change.

The standalone legend goes away. The dot on each toggle pill is the legend.

## Chip

Each chip renders as `[dot] SHORT · Name (+1) [× per opportunity]`.

The dot moves out of `.ms-group`, where it currently renders once per boundary
from `list[0].kind`, into every chip. This is the fix for the stacking problem.

`sizeMsRows()` already sizes each row to its tallest group, so taller stacks
need no change.

## Sessions

Nine new sessions, two changed, one split.

| Session | Group | When | Repeats |
|---|---|---|---|
| Refinement 1 | Product | mid wk 1 | per opportunity |
| Engineering Leader Planning | Engineering | end wk 1 | — |
| Refinement 2 | Product | mid wk 2 | per opportunity |
| Engineering Pitch-back | Engineering | end wk 2 | per pod |
| Design Share-out (design team) | Design | mid wk 3 | — |
| Design Share-out (pod & stakeholders) | Design | end wk 3 | per opportunity |
| Opportunity Proposals | Product | end wk 4 | weekly, weeks 3-4 |
| Pitch Discovery | Product | mid wk 5 | per opportunity |
| Portfolio Review Dry Run | Product | end wk 5 | — |
| Delivery Check | Engineering | end wk 5 | per pod |
| Delivery Check | Engineering | end wk 6 | per pod |
| Opportunity Intake | Product | end wk 7 | per opportunity |

Changes to existing milestones:

- `brp` — "Engineering Big Room Planning" is renamed **Engineering Leader
  Planning**. It is the same session: all engineering leaders, end of week 1.
- `pitchback` — moves from the hidden `team` group to `engineering`, and gains
  `repeats: "per pod"`.
- `shareouts` — splits into the two design share-outs. The design team share-out
  comes first, then the share-out with the pod and its stakeholders.

Each new milestone gets `audience` prose, `inputs` and `outcomes` for the detail
panel, drawn from what Ryan described and from the Jam Ceremonies page in Notion
(Program Management Home / Jam! Delivery Framework), which is the canonical
source for Pitch Discovery, Pod Opportunity Refinements and Engineering
Pitch-back.

Notes on the content:

- Refinements are between the PM and the pod, for a given opportunity, so there
  are several per cycle. Refinement 1 mid-week 1, Refinement 2 mid-week 2.
- Delivery Checks sit one week before each Enablement Session, which puts them
  at the end of weeks 5 and 6. Participants are the pod, the PM or PMs, and
  program management. The purpose is a read on how the work is shaping up and
  which enablement session each project slots into.
- Opportunity Intake is product, engineering and design leaders taking a first
  pass at what the pods forecast they will pick up: high-level understanding and
  sense-checking, in the last two weeks.
- Pitch Discovery exists to get opportunities informed by internal stakeholders.
  It is kept even though the practice has thinned out, because it is still in
  the framework documents.

### Inferred timings

Two placements are inferences, not documented facts. They are drawn plainly,
with no "provisional" or "needs attention" language on the page — if we don't
know more, we don't say more. They are recorded here so they are easy to move.

- **Design share-outs.** The sequence is documented (design team, then pod and
  stakeholders, then Design Demo Day) but the timings are not. Mid-week 3 and
  end-week 3, ahead of Design Demo Day at end-week 4.
- **Opportunity Proposals.** Described as two weeks of the product team working
  through opportunities together, which is closer to an activity than a moment.
  Drawn as one chip at end-week 4 marked "weekly, weeks 3-4" rather than
  inventing specific dates.

## Implementation notes

`template.html` carries the rendering changes; `jam-framework.json` carries the
data. Existing build flow applies: `./build.sh`, then `node verify.js`, then
republish to the Claude artifact so the in-page Edit toggle keeps working.

Edit mode needs three extensions:

- the `at` dropdown (`boundaryOpts`) gains half steps
- the `kind` dropdown is driven by `meta.groups` instead of a literal list
- a `repeats` field is added to the milestone form and to the save handler

One gotcha: `byAt` groups milestones into an object keyed by `at`, and relies on
`Object.entries` returning integer-like keys in ascending order. Once `"0.5"`
keys exist that ordering no longer holds, so the grouping needs an explicit
numeric sort before rendering.

The `isMs` test in the boundary-line loop compares `m.at === b` against integer
`b`, so mid-week milestones will correctly not promote a week line; they get the
dashed tick instead.

## Out of scope

- Product Marketing and Program & Enablement meeting groups.
- Programming and enablement sessions as function groups.
- Any change to the "This week" or "By function" views beyond what falls out of
  the shared data model.
- Promoting `jam-cycle-map.html` in the repo root. It is a stale draft-2 export,
  older than the current data, and is not touched.
