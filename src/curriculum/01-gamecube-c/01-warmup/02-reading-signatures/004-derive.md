---
id: 00c2f2bc-1d29-4c90-b1c2-b5486cdde015
slug: signatures-derive
title: Count Them Yourself
difficulty: 1
concepts:
  - calling-convention
  - arguments
  - arithmetic
symbol: func_80030bc8
hints:
  - The two source registers of the `add` are the 1st and 3rd argument registers.
  - One argument in the middle is never touched, but you must still declare it so
    the later argument lands in the right register.
---

# Mind the gap

Same idea, but now the function actually *does* something with its arguments
instead of handing one straight back. The counting rule doesn't change: find the
highest argument register named in the instruction, and that's how many parameters
there are — gaps and all.

Say an `add` takes its two sources from `r3` and `r6`:

```asm
add   r3, r3, r6
blr
```

`r3` is the 1st argument and `r6` is the 4th, so there are four parameters. The
two in between, `r4` and `r5`, arrive and are ignored — but you still have to
declare them, or the value you need would never land in `r6` to begin with:

```c
int edge(int a, int b, int c, int d) {
    return a + d;
}
```

Read your target, find its two source registers, and count from `r3`.

## Your task

Write `func_80030bc8` to reproduce the assembly above.

<!-- solution -->
```c
int func_80030bc8(int a, int b, int c) {
    return a + c;
}
```
