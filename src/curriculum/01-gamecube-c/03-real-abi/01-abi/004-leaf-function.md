---
id: dcf373d6-e792-538d-abd3-d00d59cf2463
slug: abi-leaf-function
title: A Leaf Has No Stack Frame
difficulty: 2
concepts:
  - stack-frame
  - leaf
  - prologue
symbol: func_8033cdcc
hints:
  - This function calls nothing, so it is a leaf with no stack frame.
  - Expect just `mullw`, `addi`, `blr` — no prologue or epilogue.
---

# The cheapest function shape

A leaf function calls nothing else. Since it never makes a call, it never has to
save the link register, and it has no scratch that must survive across a call. So
MWCC gives it the cheapest shape: no stack frame, no prologue, no epilogue. The
body runs, then it returns.

Here's `leaf_ex(s32 a, s32 b) { return a - b * 3; }`:

```asm
mulli  r0,r4,3
subf   r3,r0,r3
blr
```

Notice what's missing: no `stwu r1,...`, no `mflr`, no `mtlr` — only arithmetic
and a `blr`. That empty space where frame setup would go is how you spot a leaf.
Everything happens in volatile registers (`r0`, `r3`–`r12`, `f0`–`f13`), the ones a
function is free to trample, then it branches back. (`r0` is caller-saved too,
which is why a non-leaf prologue can borrow it to shuffle the link register without
saving `r0`.)

Next lesson flips this around, when a call drags a full frame back in.

The target for `func_8033cdcc` is another one of these — no `stwu`, no `mflr`.
Pick out its two integer instructions and work out what arithmetic on two `int`
parameters they encode.

## Your task

Write `func_8033cdcc` to match the target assembly. It calls nothing, so expect no
stack frame.

<!-- solution -->
```c
int func_8033cdcc(int a, int b) {
    return a * b + 1;
}
```
