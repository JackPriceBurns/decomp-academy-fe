---
id: c42c9691-4cba-426b-aede-95501a30ae31
slug: gba-arithmetic-capstone-chain
title: "Capstone: The Whole Chain"
difficulty: 5
concepts:
  - strength-reduction
  - constants
  - registers
symbol: func_08085d9c
hints:
  - Two kinds of `lsl` appear here. One reads an argument register and scales it;
    the other follows a `mov` of a `#` immediate and is building a constant out
    of nothing.
  - "Two `s32` parameters in, an `s32` out. The first is scaled by 40, the second
    is subtracted from the product, and 512 is added on."
---

# Everything at once

A long arithmetic listing decomposes cleanly if you sort the instructions into
jobs before you try to read them as one expression.

Here is `z * 7 + y * 2 + 500`, eight instructions of it:

```asm
0        lsl       r0, r2, #3
2        sub       r0, r2
4        lsl       r1, #1
6        add       r0, r1
8        mov       r1, #250
10       lsl       r1, #1
12       add       r0, r1
14       bx        lr
```

Sorted into jobs, it is three phases and nothing else:

- **0–2** scale `z`. Shift by 3 for eight copies, subtract the original for
  seven.
- **4–6** scale `y` by two, in place, and fold it into the accumulator.
- **8–12** build 500 as 250 << 1 and add it.

Note what happens to `r1`. It arrives holding `y`, gets doubled in place, and is
folded into `r0` — and the moment it is dead, gcc reuses it as the scratch
register for the constant. The same register does two unrelated jobs eight bytes
apart, so reading a register's *name* is never enough; you have to read it in
sequence.

Two shapes distinguish the phases:

- `lsl rD, rM, #n` reading an argument register starts a **scale**;
- `mov rD, #k` followed by `lsl rD, #n` builds a **constant** — nothing was read,
  the value came from the immediate.

Your target does all three jobs and adds a wrinkle: its accumulator is not `r0`,
so `r0` is free, and gcc uses it for something else entirely before moving the
answer in at the end. Work out which register holds the running total before you
read anything else, and check every instruction against it.

## Your task

Write `func_08085d9c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08085d9c(s32 a, s32 b) {
    return a * 40 - b + 512;
}
```
