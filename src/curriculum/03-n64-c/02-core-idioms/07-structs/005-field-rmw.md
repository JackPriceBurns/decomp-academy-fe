---
id: c9dabe1a-5ab1-4319-b39e-e74563b4944f
slug: structs-field-rmw
title: "Updating a Field in Place"
difficulty: 2
concepts:
  - structs
  - rmw
  - shifts
symbol: func_80276af8
hints:
  - "Load and store share one offset — a single field updated in place. The two instructions between them compute the new value."
  - "The `sll` doubles the argument before it joins the field — a compound assignment whose right side is a small multiply idiom."
---

# The sandwich gets a field name

The read-modify-write sandwich from the pointers chapter —
load, operate, store, all on one `offset(base)` — is really a *struct*
idiom in the wild, because the memory games update in place is nearly
always somebody's field. Ammo, timers, scores:

```c
typedef struct {
    s32 ammo;     // offset 0
    s32 clips;    // offset 4
} Gun;

void fire(Gun *g) {
    g->ammo -= 1;
}
```

```asm
lw    t6, 0(a0)     # read g->ammo
addiu t7, t6, -1    # …minus one
sw    t7, 0(a0)     # write it back
jr    ra
nop
```

Same offset on the `lw` and the `sw`, so it's one field round-tripping.
With the struct in scope the decompiled line names it: `g->ammo -= 1;`
(or `g->ammo--;` — identical output, pick what reads best).

The middle of the sandwich can be any idiom you've learned. A constant
`addiu`, a register `addu`, an `ori` — or a whole shift-built multiply
from the arithmetic chapter, because the amount being applied is itself
computed. Read the middle as its own tiny expression, with the loaded
field flowing in and the stored value flowing out.

That's the target: one field of the `Run` below updated in place, and
the second argument passes through one shift on its way into the
update.

## Your task

Write `func_80276af8` to reproduce the target assembly.

<!-- solution -->
```c
void func_80276af8(Run *r, s32 pts) {
    r->score += pts * 2;
}
```

<!-- context -->
```c
typedef struct {
    s32 score;
    s32 lives;
    s32 combo;
} Run;
```
