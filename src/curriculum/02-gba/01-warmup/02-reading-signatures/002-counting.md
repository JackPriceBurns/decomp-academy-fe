---
id: 9ccea6a3-1bbf-4275-868a-bca8edb4c4ea
slug: gba-signatures-counting
title: Count the Argument Registers
difficulty: 1
concepts:
  - calling-convention
  - arguments
symbol: func_0800c1a4
hints:
  - Every argument register that the body reads is a parameter. The highest one
    it reads tells you how many there are.
  - "It reads `r0`, `r1` and `r2` and returns a sum, so it takes three `s32` arguments and returns an `s32`."
---

# Each argument register is a parameter

When there is no signature, the first thing to work out is how many parameters
the function has. The ABI turns this into counting. Arguments arrive in `r0`,
`r1`, `r2`, `r3`, in the order they appear in the source. So **every argument
register that the body reads is a parameter**, and the highest one it reads
tells you how many there are.

Here is a function that reads `r0` and `r3`:

```asm
0        add       r0, r3
2        bx        lr
```

`r3` is the fourth argument register, so this function has **four** parameters,
even though it only uses two of them. `r0` also holds a value at `bx lr`, so the
function returns something. The C is:

```c
s32 useFirstAndFourth(s32 a, s32 b, s32 c, s32 d) {
    return a + d;
}
```

The function never uses `b` or `c`, but you must still declare them. If you
leave one out, `d` arrives in `r2` instead of `r3`, and the assembly no longer
matches. A parameter's position in the list decides which register it arrives
in.

So look through the body for argument registers and find the highest one. That
gives you the count. Then work out what the arithmetic does with them.

## Your task

Write `func_0800c1a4` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0800c1a4(s32 a, s32 b, s32 c) {
    return a + b + c;
}
```
