---
id: 1ee8cc80-56ae-4b6a-aa79-dd25b8b2a4e5
slug: structs-mixed-widths
title: "Narrow Fields and the Gaps Between"
difficulty: 2
concepts:
  - structs
  - types
  - alignment
symbol: func_803ba330
hints:
  - "Offsets 0 and 1 with `lb` are the two signed bytes; offset 4 with `lw` is the word. One field of the struct never gets touched."
  - "Three loads folded together with two `addu`s — a single return expression adding three fields."
---

# Offset math with real structs

Real game structs mix widths — a byte of flags here, a halfword of HP
there — and the offsets follow two rules:

1. **Each field is aligned to its own size.** Bytes go anywhere,
   halfwords on even offsets, words on multiples of 4. The compiler
   inserts invisible padding to make that true.
2. Fields otherwise pack in declaration order.

Run the rules over this struct and check each comment:

```c
typedef struct {
    u8  kind;    // offset 0
    u8  level;   // offset 1
    s16 hp;      // offset 2  (even — no padding needed)
    s32 score;   // offset 4
} Unit;

s32 unit_power(Unit *u) {
    return u->hp + u->level;
}
```

```asm
lh    t6, 2(a0)     # u->hp    — halfword at 2
lbu   t7, 1(a0)     # u->level — byte at 1
addu  v0, t6, t7
jr    ra
nop
```

The mnemonics and offsets now cross-check each other *twice over*: the
load width must match the field's declared width, and its
sign must match the field's signedness — `lh` for the `s16`, `lbu` for
the `u8`, exactly as the type-oracle rules from the width chapter
demand. When you reconstruct an unknown struct in a real project, this
is the evidence you work from: every `lbu 3(…)` pins a `u8` at offset
3, and the gaps no load ever touches are padding — or fields this
function just doesn't use.

The target adds three fields of the `Mover` below and skips one
entirely. Compute the offsets, match the mnemonics, and mind the signs.

## Your task

Write `func_803ba330` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_803ba330(Mover *m) {
    return m->dx + m->dy + m->ticks;
}
```

<!-- context -->
```c
typedef struct {
    s8  dx;
    s8  dy;
    u16 speed;
    s32 ticks;
} Mover;
```
