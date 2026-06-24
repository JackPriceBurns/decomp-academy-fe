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
all**. There is no prologue and no epilogue; the body runs and returns:

```asm
mullw r3, r3, r4   # a * b
addi  r3, r3, 1    # + 1
blr                # return — no stack adjustment anywhere
```

Compare this to what you'll see next lesson. The complete absence of
`stwu r1,...` / `mflr` / `mtlr` is the signature of a leaf: everything happens
in volatile registers (`r0`, `r3`–`r12`, `f0`–`f13`) that a function may freely
clobber, then `blr`. (`r0` is volatile too — it's caller-saved, which is why
non-leaf prologues can use it as scratch to shuffle the link register without
ever preserving `r0` itself.)

## Your task

Write `leaf`, taking two `int`s, to reproduce the assembly above. It calls nothing, so
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
