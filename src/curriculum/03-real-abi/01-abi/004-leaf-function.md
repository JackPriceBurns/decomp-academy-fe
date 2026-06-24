---
id: abi-leaf-function
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

A **leaf** function is one that calls nothing. Because it makes no calls, it
never has to preserve the **link register** (the return address) and it needs no
scratch storage that outlives a call — so MWCC gives it **no stack frame at
all**. There is no prologue and no epilogue; the body runs and returns.

For example, `leaf_ex(s32 a, s32 b) { return a - b * 3; }` compiles to:

```asm
mulli  r0,r4,3
subf   r3,r0,r3
blr
```

No `stwu r1,...`, no `mflr`, no `mtlr` — just the arithmetic and `blr`. The
complete absence of frame setup is the signature of a leaf: everything happens
in volatile registers (`r0`, `r3`–`r12`, `f0`–`f13`) that a function may freely
clobber, then `blr`. (`r0` is volatile too — it's caller-saved, which is why
non-leaf prologues can use it as scratch to shuffle the link register without
ever preserving `r0` itself.)

Compare this to what you'll see next lesson, where a call forces a full frame.

Now look at the target assembly for `leaf`. It is also a leaf — no `stwu`,
no `mflr`. Identify the two integer instructions and work out what arithmetic
on two `int` parameters they encode.

## Your task

Write `leaf`, taking two `int`s, to match the target assembly. It calls nothing, so
expect no stack frame.

<!-- starter -->
```c
int leaf(int a, int b) {
    return 0;
}
```

<!-- solution -->
```c
int leaf(int a, int b) {
    return a * b + 1;
}
```
