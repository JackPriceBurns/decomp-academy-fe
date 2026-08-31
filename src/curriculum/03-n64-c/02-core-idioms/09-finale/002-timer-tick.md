---
id: 25ce5acb-8956-4259-90ba-4564c978ab93
slug: finale-timer-tick
title: "A Timer Ticks Down"
difficulty: 3
concepts:
  - structs
  - control-flow
  - types
  - capstone
symbol: func_80173968
hints:
  - "Offset 0 gates everything — `beqz` on a `lbu` is \"do nothing unless this byte is set\". Then the middle is a decrement RMW on offset 2 with a re-read and an equality test."
  - "On the expiry path, offset 0 is zeroed and offset 1 is incremented. Match each store to a field of `Timer`."
---

# Guard, decrement, expire

Every game object owns a few of these: a counter that steps toward
zero each frame and does something when it lands. Here's `coolGun`,
which bleeds heat out of a weapon and re-arms it at zero:

```c
typedef struct {
    u8 ready;    // offset 0
    u8 ammo;     // offset 1
    s16 heat;    // offset 2
} Gun;

void coolGun(Gun *g) {
    if (g->heat > 0) {
        g->heat -= 2;
        if (g->heat <= 0) {
            g->heat = 0;
            g->ready = 1;
        }
    }
}
```

```asm
 0:  lh    v0, 2(a0)        # heat
 4:  blez  v0, 0x28         # not hot? nothing to do
 8:  addiu t6, v0, -2       #   (slot) heat - 2 — computed either way
 c:  sh    t6, 2(a0)        # store it
10:  lh    t7, 2(a0)        # the narrow-field re-read
14:  addiu t8, zero, 1
18:  bgtz  t7, 0x28         # still warm? done
1c:  nop
20:  sh    zero, 2(a0)      # floor it
24:  sb    t8, 0(a0)        # ready = 1
28:  jr    ra
2c:  nop
```

Two readings worth pausing on:

- **The guard's delay slot computes the decrement** — even when the
  branch is taken and the result gets thrown away. Harmless
  speculative work in a slot is cheaper than a `nop`; don't let it
  trick you into thinking the subtraction is unconditional in C.
- **Nested `if`s flatten into two forward branches to the same exit.**
  Both `blez` and `bgtz` aim at `0x28` — the function's one true
  exit. Reconstructing the nesting is a matter of seeing that the
  second test only runs on the first's fall-through.

The target is a sibling: a countdown gated by an *enable byte*
rather than by its own value, decrementing by one, and doing two
things on expiry. Lay the offsets against the `Timer` layout below,
un-flip the branches, and the nesting writes itself.

## Your task

Write `func_80173968` to reproduce the target assembly.

<!-- solution -->
```c
void func_80173968(Timer *t) {
    if (t->active != 0) {
        t->count--;
        if (t->count == 0) {
            t->active = 0;
            t->fired++;
        }
    }
}
```

<!-- context -->
```c
typedef struct {
    u8 active;
    u8 fired;
    s16 count;
} Timer;
```
