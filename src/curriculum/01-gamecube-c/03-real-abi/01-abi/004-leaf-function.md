---
id: dcf373d6-e792-538d-abd3-d00d59cf2463
slug: abi-leaf-function
title: A Leaf Has No Stack Frame
difficulty: 2
concepts:
  - stack-frame
  - leaf
  - prologue
symbol: leaf
hints:
  - This function calls nothing, so it is a leaf with no stack frame.
  - Expect just `mullw`, `addi`, `blr` — no prologue or epilogue.
---

# The cheapest function shape

A leaf function is one that calls nothing else. Since it never makes a call, it
never has to save the link register (your return address), and it has no need for
scratch that has to survive across a call. So MWCC hands it the cheapest shape
there is, with no stack frame whatsoever. No prologue, no epilogue. The body runs,
and it returns.

Here's `leaf_ex(s32 a, s32 b) { return a - b * 3; }`, which compiles to:

```asm
mulli  r0,r4,3
subf   r3,r0,r3
blr
```

Notice what's missing. No `stwu r1,...`, no `mflr`, no `mtlr` — only the
arithmetic and a `blr`. That empty space where the frame setup would go is exactly
how you spot a leaf. Everything happens in volatile registers (`r0`, `r3`–`r12`,
`f0`–`f13`), the ones a function is free to trample, and then it branches back.
(`r0` counts as volatile as well, being caller-saved, which is why a non-leaf
prologue can borrow it to shuffle the link register around without ever saving
`r0` itself.)

Next lesson flips this around, when a call drags a full frame back in.

The target for `leaf` is another one of these — no `stwu`, no `mflr`. Pick out its
two integer instructions and work out what arithmetic on two `int` parameters they
encode.

## Your task

Write `leaf` to match the target assembly. It calls nothing, so
expect no stack frame.

<!-- solution -->
```c
int leaf(int a, int b) {
    return a * b + 1;
}
```
