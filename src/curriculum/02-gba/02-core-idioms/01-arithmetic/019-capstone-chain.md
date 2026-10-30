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
  - Two kinds of `lsl` appear here. One reads an argument register and scales
    it. The other comes after a `mov` of a `#` immediate, and builds a constant
    without reading any register.
  - The function takes two `s32` parameters and returns an `s32`. The first is
    multiplied by 40, the second is subtracted from the product, and then 512 is
    added.
---

# Putting it all together

A long arithmetic listing is much clearer if you first sort the instructions
into jobs, before you try to read them as one expression.

Here is `z * 7 + y * 2 + 500`, which takes eight instructions:

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

Sorted into jobs, it has exactly three phases:

- **0 to 2** scale `z`. Shift by 3 for eight times `z`, then subtract the
  original for seven times.
- **4 to 6** scale `y` by two in place, and add it to the running total.
- **8 to 12** build 500 as 250 << 1 and add it.

Look at what happens to `r1`. It arrives holding `y`, is doubled in place, and
is added into `r0`. As soon as it is no longer needed, gcc reuses it as the
scratch register for the constant. The same register does two unrelated jobs
eight bytes apart. So a register's *name* alone never tells you what it holds.
You have to read its uses in order.

Two patterns tell the phases apart:

- An `lsl rD, rM, #n` that reads an argument register starts a **scale**.
- A `mov rD, #k` followed by `lsl rD, #n` builds a **constant**. No register
  was read, and the value came from the immediate.

Your target does all three jobs, with one extra detail. Its running total is
not in `r0`, so `r0` is free. gcc uses `r0` for something else and moves the
answer into it at the end. Before you read anything else, work out which
register holds the running total. Then check every instruction against it.

## Your task

Write `func_08085d9c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08085d9c(s32 a, s32 b) {
    return a * 40 - b + 512;
}
```
