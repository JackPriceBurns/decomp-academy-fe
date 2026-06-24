---
id: abi-stack-args
title: When Arguments Spill to the Stack
difficulty: 4
concepts:
  - calling-convention
  - stack-frame
  - arguments
symbol: ninth
hints:
  - Only the first 8 integer arguments get registers (r3-r10); the 9th spills to
    the stack.
  - "`return i;` loads the spilled argument: `lwz r3, 8(r1)`."
---

# The ninth argument has no register

Only the first **eight** integer arguments get registers (`r3`–`r10`). A
**ninth** argument has nowhere left to go, so the caller places it on the
**stack**, and the callee reads it back from there. The EABI lays out the
caller's frame as `0(r1)` = back-chain, `4(r1)` = LR save slot, and `8(r1)`
onward = the outgoing parameter area. Because `ninth` is a leaf and never
allocates its own frame, its `r1` on entry still points at the caller's frame —
so the ninth argument is right there at `8(r1)`:

```asm
lwz  r3, 8(r1)    # load the 9th argument from the caller's frame
blr
```

This function is still a leaf — it makes no call, so it needs no frame of its
own — yet it touches `r1` to fetch an argument that never fit in a register.
A lone `lwz` from a small positive `r1` offset at the very top of a function is
the classic tell that a parameter spilled to the stack. Arguments one through
eight (`a`–`h`) arrived in `r3`–`r10` and, being unused, produce no code.

## Your task

Write `ninth`, taking nine `int`s and returning the **ninth** one (`i`). It
should load `i` from the stack with `lwz r3, 8(r1)`.

<!-- starter -->
```c
int ninth(int a, int b, int c, int d, int e, int f, int g, int h, int i) {
    return 0;
}
```

<!-- solution -->
```c
int ninth(int a, int b, int c, int d, int e, int f, int g, int h, int i) {
    return i;
}
```
