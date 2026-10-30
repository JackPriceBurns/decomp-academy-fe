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
  - "`sb` at 1, `sh` at 2, `sw` at 4: three fields of three widths, written in declaration order. One field is left alone."
  - "The two argument registers are stored without any change. No masking is needed, because the narrow store truncates for you. The word field gets `zero`."
---

# The store picks the field's width

To write a narrow field, the compiler uses a narrow store at the field's
offset: `sb` for byte fields and `sh` for halfword fields. As the Types & Width
chapter showed, a narrow store is the one place where truncation costs
nothing. The store keeps the low bits and drops the rest, so there is no
`andi` and no shift pair. Storing an `s32` into a `u8` field takes a single
`sb`:

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
sb    a1, 1(a0)      # u->level = lv (sb truncates the s32 for free)
sh    t6, 2(a0)      # u->hp = 100
jr    ra
nop
```

Look at the order of the instructions. IDO tends to build constants *before*
the run of stores, so the `addiu` moves to the top even though `hp` is
assigned second in the C. Match stores to statements by their **offsets**,
never by their order in the listing.

Take the inventory as before. `sb … 1(…)` writes the byte field at offset 1,
and `sh … 2(…)` writes the halfword at 2. Each store's source register is
the right-hand side of the assignment: an argument, a built constant, or
`zero`.

The target sets three of the `Walker`'s fields. Argument values go into the
two narrow fields, and a zero goes into the word field. Work out the offsets
and widths first. After that, it is three assignment lines.

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
