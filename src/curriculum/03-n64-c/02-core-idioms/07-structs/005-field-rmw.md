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
  - "The load and the store use the same offset, so a single field is updated in place. The two instructions between them compute the new value."
  - "The `sll` doubles the argument before it is combined with the field. This is a compound assignment, and its right side is a small multiply idiom."
---

# The RMW sandwich on a struct field

In the pointers chapter you saw the read-modify-write (RMW) sandwich: a load,
an operation and a store, all on the same `offset(base)`. In real game code
this is mostly a *struct* idiom. The memory that games update in place is
nearly always a field of some struct, such as ammo, a timer or a score:

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

The `lw` and the `sw` use the same offset, so one field is read and then
written back. With the struct in scope, the decompiled line names the field:
`g->ammo -= 1;`. You could also write `g->ammo--;`. Both give identical
output, so use whichever reads best.

The middle of the sandwich can be any idiom you have learned. It can be a
constant `addiu`, a register `addu` or an `ori`. When the amount being applied
is itself computed, it can also be a whole multiply built from shifts, as in
the arithmetic chapter. Read the middle as its own small expression. The
loaded field goes in, and the value to store comes out.

The target does this. It updates one field of the `Run` below in place, and
the second argument goes through one shift before it is used in the update.

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
