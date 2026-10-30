---
id: 7538faaf-b42e-4e6e-b15a-939fb15d1a56
slug: structs-capstone-damage
title: "Capstone: Damage Control"
difficulty: 4
concepts:
  - structs
  - flags
  - rmw
  - control-flow
  - capstone
symbol: func_8014e3e8
hints:
  - "First match every offset to the `Unit` layout. The `lh`/`sh` at 2 is one field, and the `lbu`/`sb` at 0 is another. Then read the branch as the shape that skips over the if-body."
  - "The `sh zero` stores a constant without building it first. The `andi` mask has exactly one bit OFF, so a flag is cleared inside the `if`."
---

# Everything at once

A real struct function often reads a field, changes it, tests it, and on one
path also updates another field. That brings the idioms of this chapter
together in ten lines. Here is `charge`, which adds energy to a cell and sets
a flag that stays set once the energy reaches its limit:

```c
typedef struct {
    u8 state;     // offset 0
    u8 flags;     // offset 1, bit 3 = "charged"
    s16 energy;   // offset 2
} Cell;

void charge(Cell *c, s32 amt) {
    c->energy += amt;
    if (c->energy >= 100) {
        c->energy = 100;
        c->flags |= 8;
    }
}
```

```asm
 0:  lh    t6, 2(a0)          # read energy
 4:  addu  t7, t6, a1         # + amt
 8:  sh    t7, 2(a0)          # write it back
 c:  lh    t8, 2(a0)          # re-read it for the test
10:  slti  at, t8, 100        # energy < 100 ?
14:  bnez  at, 0x30           # yes → skip the whole if-body
18:  nop
1c:  lbu   t0, 1(a0)          # read flags…
20:  addiu t9, zero, 100
24:  sh    t9, 2(a0)          # energy = 100
28:  ori   t1, t0, 0x8        # …set bit 3…
2c:  sb    t1, 1(a0)          # …write flags back
30:  jr    ra
34:  nop
```

Go through it one idiom at a time:

- **The RMW sandwich** comes first. `lh`/`addu`/`sh` at offset 2 is
  `energy += amt`. The `lh` tells you the width and the signedness.
- **The re-read at `0xc`** is the extra cost of a narrow field. `energy` is
  stored in memory as 16 bits, so to test its value after the store, the
  compiler loads it again: `sh` then `lh` at the same offset. The compiler
  does not reuse `t7`, because the store truncated the value and `t7` still
  holds the untruncated sum.
- **`slti` + `bnez` is the flipped guard.** The C says `>= 100`, and the
  branch jumps *away* on `< 100`. Flip the condition back to recover the
  source.
- **Inside the body**, a constant store and a flag set are mixed together,
  because the scheduler reordered them. The lines at offset 2 are `energy`
  and the lines at offset 1 are `flags`. To sort them back into C, you only
  need to read the offsets.

The target has the same structure, working in the other direction. A stat is
*reduced*, and it has a lower limit (a floor) instead of an upper limit (a
cap). When it reaches the bottom, a flag is *cleared* instead of set. The
`Unit` layout below names every offset you will see. Let the widths, the
branch and the mask tell you the C.

## Your task

Write `func_8014e3e8` to reproduce the target assembly.

<!-- solution -->
```c
void func_8014e3e8(Unit *u, s32 dmg) {
    u->hp -= dmg;
    if (u->hp <= 0) {
        u->hp = 0;
        u->flags &= ~1;
    }
}
```

<!-- context -->
```c
typedef struct {
    u8 flags;
    u8 pad;
    s16 hp;
    s32 score;
} Unit;
```
