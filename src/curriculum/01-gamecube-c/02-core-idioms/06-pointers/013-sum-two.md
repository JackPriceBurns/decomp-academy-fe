---
id: 26ba6fc4-3705-5c5a-ada7-31e73a641721
slug: pointers-sum-two
title: Reading Two Elements and Combining Them
difficulty: 2
concepts:
  - loads
  - arrays
  - chaining
symbol: combine_two
hints:
  - Each element is its own load; the two loaded values then feed one arithmetic
    instruction.
  - Two `lwz` at different displacements, then a single combine into r3.
---

# Two loads feed one operation

Up to now each lesson poked one location. Real code isn't that tidy. It pulls a
handful of values from an array and mashes them into a result. No new trick is
involved, only the earlier lessons stacked. You load every element on its own,
each from its own constant displacement, then run a single arithmetic instruction
across the loaded registers.

The loads have to come first. A combine can't fire until both of its inputs are
already in registers. The displacements tell you which elements were read, so
divide each by the element size, same move as the constant-index lesson.

Here's `diff_two(q)`, reading two `int`s and subtracting the first from the third.

```asm
lwz  r4, 0(r3)    # q[0]
lwz  r0, 8(r3)    # q[2]   (displacement 8 / 4 = index 2)
subf r3, r4, r0   # r0 - r4  =  q[2] - q[0]
blr
```

Two separate loads, one `subf` (and `subf rD, rA, rB` gives `rB − rA`). The `0`
and `8` say which elements got read, while the `subf` says what's done with them.
Your target wears the same two-loads-then-combine shape. Read its displacements
and its combining instruction and they'll point you at the elements and the
operation.

## Your task

Write `combine_two` to reproduce the assembly above.

<!-- solution -->
```c
int combine_two(int* p) {
    return p[0] + p[1];
}
```
