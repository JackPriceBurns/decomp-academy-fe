---
id: 193285f0-b0f9-4497-aa09-01b21144e39c
slug: structs-narrow-store
title: "Storing Into Narrow Fields"
difficulty: 2
concepts:
  - structs
  - stores
  - types
symbol: func_8024ca14
hints:
  - "`sb` at 1, `sh` at 2, `sw` at 4 — three fields of three widths,
    written in declaration order. One field is left alone."
  - "The two argument registers go through stores untouched — no masking needed, the narrow store truncates for you. The word field gets `zero`."
---

# The store picks the field's width

Writing a narrow field uses the narrow store — `sb` for byte fields,
`sh` for halfword fields — at the field's offset. And as the width
chapter taught, narrow stores are the one place truncation is free: the
store keeps the low bits and drops the rest, no `andi`, no shift pair.
Passing an `s32` into a `u8` field is just an `sb`:

```c
typedef struct {
    u8  kind;    // offset 0
    u8  level;   // offset 1
    s16 hp;      // offset 2
} Unit;

void promote(Unit *u, s32 lv) {
    u->level = lv;
    u->hp = 100;
}
```

```asm
addiu t6, zero, 100  # the constant for hp, built first
sb    a1, 1(a0)      # u->level = lv — sb truncates the s32 for free
sh    t6, 2(a0)      # u->hp = 100
jr    ra
nop
```

Note the schedule: IDO likes to build constants *before* the store run,
so the `addiu` floats to the top even though `hp` is assigned second in
the C. Match stores to statements by their **offsets**, never by their
order on the page.

Reading inventory, as always: `sb … 1(…)` writes the byte field at
offset 1, `sh … 2(…)` the halfword at 2, and each store's source
register is the right-hand side — an argument, a built constant, or
`zero`.

The target sets three of the `Walker`'s fields — value arguments into
the two narrow fields, and a zero into the word field. Offsets and
widths first, then it's three assignment lines.

## Your task

Write `func_8024ca14` to reproduce the target assembly.

<!-- solution -->
```c
void func_8024ca14(Walker *w, s32 sp, s32 t) {
    w->speed = sp;
    w->timer = t;
    w->dist = 0;
}
```

<!-- context -->
```c
typedef struct {
    s8  dir;
    u8  speed;
    u16 timer;
    s32 dist;
} Walker;
```
