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
  - "Map every offset to the `Unit` layout first — the `lh`/`sh` at 2 is one field, the `lbu`/`sb` at 0 another. Then read the branch as the skip-over-the-body shape."
  - "The `sh zero` stores a constant without building it, and the `andi` mask has exactly one bit OFF — it's a flag being cleared, inside the `if`."
---

# Everything at once

A real struct function reads a field, changes it, tests it, and
touches a neighbor on one path — every idiom from this chapter in ten
lines. Here's `charge`, which feeds energy into a cell and latches a
flag when it tops out:

```c
typedef struct {
    u8 state;     // offset 0
    u8 flags;     // offset 1 — bit 3 = "charged"
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

Walk it idiom by idiom:

- **The RMW sandwich** opens: `lh`/`addu`/`sh` at offset 2 is
  `energy += amt`, width and signedness read straight off the `lh`.
- **The re-read at `0xc`** is the narrow-field tax: `energy` lives in
  memory as 16 bits, so testing its post-store value means loading it
  again — `sh` then `lh` at the same offset. The compiler will not
  reuse `t7`, because the store just truncated it.
- **`slti` + `bnez` is the flipped guard**: the C says `>= 100`, the
  branch jumps *away* on `< 100`. Un-flip it to recover the source.
- **Inside the body**, a constant store and a flag-set interleave —
  the scheduler shuffled them, but offset 2 lines are `energy` and
  offset 1 lines are `flags`, so sorting them back into C is just
  reading offsets.

The target is the same anatomy pointed the other way: a stat gets
*drained*, floored rather than capped, and a flag *cleared* rather
than set when it bottoms out. The `Unit` layout below names every
offset you'll meet — let the widths, the branch, and the mask dictate
the C.

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
