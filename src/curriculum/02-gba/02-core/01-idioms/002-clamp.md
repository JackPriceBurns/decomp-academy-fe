---
id: gba-idioms-clamp
title: Clamping with a Conditional Skip
difficulty: 2
concepts:
  - control-flow
  - comparison
symbol: clampTop
hints:
  - Compare against the limit, then branch over the assignment when the value is
    already within range.
  - The ceiling constant is moved straight into the register on the clamp path.
---

# Capping a value

Clamping is a compare and a conditional skip. Say a function **floors** its
argument at ten — anything below becomes ten:

```asm
cmp	r0, #0x9
bgt	.L3
mov	r0, #0xa
bx	lr
```

It compares against `#0x9`, and when the value is already greater (`bgt`) it
skips straight to the return. Otherwise it moves the floor `#0xa` into place and
returns that. A **ceiling** clamp is the mirror image: the comparison value and
the branch condition flip, and the constant moved in is the upper limit instead.

Read the target's `cmp` and the constant it moves to recover the bound.

## Your task

Write `clampTop`, taking an `int x`, to reproduce the target assembly.

<!-- starter -->
```c
int clampTop(int x) {
    return 0;
}
```

<!-- solution -->
```c
int clampTop(int x) {
    if (x > 200) {
        x = 200;
    }
    return x;
}
```
