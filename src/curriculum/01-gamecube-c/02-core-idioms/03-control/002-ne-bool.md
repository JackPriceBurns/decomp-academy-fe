---
id: f009265c-f7e9-52b4-964b-ec41e7f0708f
slug: control-ne-bool
title: Not-Equal Is Its Own Idiom
difficulty: 2
concepts:
  - comparison
  - boolean
  - idiom
symbol: func_80002498
hints:
  - Inequality uses two subtractions ORed together.
  - The sign bit is harvested with `srwi r3, r0, 31`.
---

# Inequality flips the recipe

Last lesson, equality used `cntlzw` to spot a zero result. Inequality wants the
opposite — a non-zero result — and needs its own trick to get there. MWCC
subtracts the two inputs *both ways round*, ORs the pair, then keeps only the
top bit of what comes out.

```asm
subf r5, r3, r4    # one direction
subf r0, r4, r3    # the other direction
or   r0, r5, r0    # combine
srwi r3, r0, 31    # pull bit 31 down to 0/1
blr
```

Why both directions? Because the pair guarantees bit 31 is set the moment the
inputs differ — at least one of the two subtractions will overflow into that
bit. When the inputs match, both differences are zero and so is the OR. The
closing `srwi r3, r0, 31` drags bit 31 down to a tidy `0` or `1`. A corner case
still behaves: if one difference wraps to `INT_MIN`, the other wraps to
`INT_MIN` too, the OR stays `INT_MIN`, bit 31 stays lit, and the answer holds.

## Your task

Write `func_80002498` to reproduce the assembly above.

<!-- solution -->
```c
int func_80002498(int a, int b) {
    return a != b;
}
```
