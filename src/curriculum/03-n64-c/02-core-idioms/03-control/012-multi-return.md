---
id: 8f8d713e-31e3-4093-a61b-9bc304e25d26
slug: control-multi-return
title: Three Ways Out
difficulty: 3
concepts:
  - control-flow
  - branches
  - delay-slots
symbol: func_803e35c4
hints:
  - "Three `jr ra`s = three returns = two `if`s falling through to a third. Read the two `slti` constants for the two thresholds."
  - "The `slti` in the likely slot is the SECOND test computed early — in C it's just the second `if`. Write the ladder plainly."
---

# Count the exits first

Real functions bail out early and often, and IDO compiles each `return` as
its own `jr ra`. Before decoding any conditions, scan for the exits — the
count alone sketches the C. Here's a three-exit function,
`if (x < 0) return -1; if (x > 0) return 1; return 0;`:

```asm
 0:  bgez  a0, 0x10        # x >= 0? move on to the next test
 4:  nop                   # nothing useful to park here
 8:  jr    ra
 c:  addiu v0, zero, -1    # exit 1: the -1
10:  blez  a0, 0x20        # x <= 0? fall to the last resort
14:  or    v0, zero, zero  # (delay slot) the 0, preloaded
18:  jr    ra
1c:  addiu v0, zero, 1     # exit 2: the 1
20:  jr    ra              # exit 3: the preloaded 0
24:  nop
```

The structure is a **ladder**: test, maybe exit, test, maybe exit, final
exit. Each rung's branch is the C condition flipped (the `if (x < 0)` became
`bgez`), each exit's value rides a delay slot, and when a slot has nothing
useful to hold, there's the honest `nop`.

Reading recipe for any ladder: find the `jr ra`s bottom-up, attach each to
the value in its slot (or a slot above), then walk the branches top-down
flipping conditions. The C falls out as a sequence of early returns — resist
any urge to build nested `else`s; flat ladders match, and flat is what game
programmers wrote.

The target is the same ladder with threshold tests instead of sign tests —
you'll recognize `slti` doing the comparing, and one rung uses a likely
branch whose slot computes the *next* rung's test early (IDO loves this
trick — an instruction the taken path was about to need anyway is a
perfect thing to park in a likely slot). None of it changes the C: two
`if`-returns and a final return.

## Your task

Write `func_803e35c4` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_803e35c4(s32 x) {
    if (x < 10) {
        return 0;
    }
    if (x < 100) {
        return 1;
    }
    return 2;
}
```
