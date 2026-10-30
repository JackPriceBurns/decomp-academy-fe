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
  - "The `slti` in the likely slot is the SECOND test, computed early. In C it is just the second `if`. Write the ladder plainly."
---

# Count the exits first

Real functions often return early, and IDO compiles each `return` as its own
`jr ra`. Before you decode any conditions, scan for the exits. The count alone
gives you a rough outline of the C. Here is a function with three exits,
`if (x < 0) return -1; if (x > 0) return 1; return 0;`:

```asm
 0:  bgez  a0, 0x10        # x >= 0? move on to the next test
 4:  nop                   # nothing useful to put here
 8:  jr    ra
 c:  addiu v0, zero, -1    # exit 1: the -1
10:  blez  a0, 0x20        # x <= 0? go to the final return
14:  or    v0, zero, zero  # (delay slot) the 0, preloaded
18:  jr    ra
1c:  addiu v0, zero, 1     # exit 2: the 1
20:  jr    ra              # exit 3: the preloaded 0
24:  nop
```

The structure is a **ladder**: test, maybe exit, test, maybe exit, final exit.
Each step's branch is the C condition flipped (the `if (x < 0)` became
`bgez`). Each exit's value is in a delay slot. When a slot has nothing useful
to hold, it gets a `nop`.

How to read any ladder: find the `jr ra`s from the bottom up, and match each
one to the value in its slot (or in a slot above it). Then walk the branches
from the top down, flipping the conditions. The C comes out as a sequence of
early returns. Don't build nested `else`s. Flat ladders match, and flat code is
what game programmers wrote.

The target is the same ladder with threshold tests instead of sign tests. You
will see `slti` doing the comparing. One step uses a likely branch whose slot
computes the *next* step's test early. IDO does this often: an instruction
that the taken path needs next anyway is a good thing to put in a likely slot.
None of this changes the C: two `if`-returns and a final return.

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
