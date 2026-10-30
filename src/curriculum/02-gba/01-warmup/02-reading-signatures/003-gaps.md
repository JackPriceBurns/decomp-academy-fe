---
id: 259d0902-8f2c-46db-ad07-916d128a08c6
slug: gba-signatures-gaps
title: A Gap in the Argument Registers
difficulty: 2
concepts:
  - calling-convention
  - arguments
symbol: func_08014e60
hints:
  - The two registers that the body reads are not next to each other, so there
    is a parameter between them that the body never uses.
  - "Three `s32` parameters in and an `s32` out. The middle parameter is declared but never used."
---

# An unused argument in the middle

The example in the last lesson ignored two of its four arguments, but you could
still count them because `r3` was used in the arithmetic. Now look at what
happens when the gap is in the middle:

```asm
0        add       r0, r2
2        bx        lr
```

This function reads `r0` and `r2`, the first and third argument registers.
Nothing reads `r1`. On some machines an unused argument still shows up in the
assembly, because the compiler saves it to a stack slot when the function
starts. This ABI does not do that. An unused argument stays in its register and
no instruction mentions it, so a skipped parameter is **completely invisible**.

You can still find it from the gap. `r2` is used, so there are at least three
parameters. `r1` is not used, so the second parameter exists but the function
ignores it:

```c
s32 midGap(s32 a, s32 b, s32 c) {
    return a + c;
}
```

You must declare `b`. If you delete it, `c` becomes the second parameter and
arrives in `r1`, so the `add` reads the wrong register.

## Unused arguments you cannot see

This method has a limit, and it is useful to know it early. A **trailing**
unused argument (one at the end of the list) leaves no trace and creates no
gap:

```c
s32 trailingUnused(s32 a, s32 b) {
    return a;
}
```

compiles to a bare `bx lr`, which is exactly what a version with one parameter
compiles to. The original function could have had five unused arguments after
`a`, and the assembly would look the same.

That is not a problem. A match means the instructions are the same, so if two
signatures produce the same instructions, either one matches. Declare the
parameters that the assembly requires, and no more.

## Your task

Write `func_08014e60` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08014e60(s32 a, s32 b, s32 c) {
    return c - a;
}
```
