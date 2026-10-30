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
  - "Offset 0 controls everything. A `beqz` on a `lbu` means \"do nothing unless this byte is set\". The middle part is a decrement RMW on offset 2, followed by a re-read and an equality test."
  - "On the expiry path, offset 0 is zeroed and offset 1 is incremented. Match each store to a field of `Timer`."
---

# A guarded countdown

Most game objects have a few counters like this. Each one moves toward
zero every frame and does something when it reaches zero. Here is
`coolGun`, which lowers a weapon's heat and makes the weapon ready again
when the heat reaches zero:

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
 8:  addiu t6, v0, -2       #   (slot) heat - 2, computed either way
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

Two details here are worth a closer look:

- **The guard's delay slot computes the decrement.** It does this even
  when the branch is taken and the result is thrown away. Putting
  harmless work in a slot, even work that may be wasted, is cheaper than
  a `nop`. Don't let it make you think the subtraction is unconditional
  in C.
- **Nested `if`s become two forward branches to the same exit.** Both
  `blez` and `bgtz` jump to `0x28`, which is the function's only exit.
  To rebuild the nesting, notice that the second test only runs when the
  first branch falls through.

The target is a similar function. Its countdown is controlled by an
*enable byte* instead of by the counter's own value. It decrements by
one, and it does two things when the counter expires. Match the offsets
against the `Timer` layout below, and flip each branch back to its C
condition. The nesting then follows directly.

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
