---
id: 5d5359b1-ee3f-4570-9fff-1e4c8fe0e4e4
slug: opt-level-o1
title: "Reading a Different Dialect: -O1"
difficulty: 3
concepts:
  - optimizer
  - debug-level
  - loops
  - stack
opt: O1
symbol: func_80354d64
hints:
  - "Two locals live on the stack. The slot that gets scaled by 4 is the index; the slot that accumulates is the sum — and which offset each sits at follows your declaration order."
  - "The guard is `blez` before the loop, and the bottom test is `slt` against `n`. It's still a plain three-line `for` loop."
---

# Same C, different world

Not every file in a real game ships at `-O2`. Some are built at **`-O1`**, and
you must be able to *recognize* the dialect before you can match it. Here's
`sum16(p)` — the exact function whose ×4-unrolled `-O2` form you read a few
lessons ago — compiled at `-O1`:

```asm
 0:  addiu  sp, sp, -8        # a frame… in a leaf function?
 4:  sw     zero, 0(sp)       # sum = 0 — the locals live ON THE STACK
 8:  sw     zero, 4(sp)       # i = 0
 c:  lw     t7, 4(sp)         # ── loop: load i…
10:  lw     t2, 4(sp)         # …and load i AGAIN (yes, really)
14:  lw     t6, 0(sp)         # load sum
18:  sll    t8, t7, 2
1c:  addu   t9, a0, t8
20:  lw     t0, 0(t9)         # p[i]
24:  addiu  t3, t2, 1         # i + 1
28:  slti   at, t3, 16        # still more to do?
2c:  addu   t1, t6, t0        # sum + p[i]
30:  sw     t1, 0(sp)         # sum written back every trip
34:  bnez   at, 0xc
38:  sw     t3, 4(sp)         # i written back every trip (slot)
3c:  lw     v0, 0(sp)
40:  jr     ra
44:  addiu  sp, sp, 8
```

The fingerprint of `-O1` is unmissable: **locals are not promoted to
registers.** `i` and `sum` each own a stack slot; every trip loads them,
computes, and stores them back — it even loads `i` twice rather than reuse
the register. No unrolling, no clever scheduling, a leaf function paying for
a frame. Twenty instructions where `-O2` used a tight dozen.

Matching an `-O1` target is mostly *bookkeeping*, and one piece of it is
yours: each local's stack slot follows its position in your declarations.
If the diff shows your two locals swapped between `0(sp)` and `4(sp)`,
swap their declaration order — the code is right, the slots aren't.

For this exercise the grader compiles your C at `-O1`, matching the target.
The function sums the first `n` words of an array — same job as the worked
example but with a runtime count, so watch how the loop guards and tests `n`.

## Your task

Write `func_80354d64` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80354d64(s32 *p, s32 n) {
    s32 s = 0;
    s32 i;

    for (i = 0; i < n; i++) {
        s += p[i];
    }
    return s;
}
```
