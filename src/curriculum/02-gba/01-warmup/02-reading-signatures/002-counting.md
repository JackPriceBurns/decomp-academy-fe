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
  - Every argument register the body reads is a parameter, and the highest one
    used sets how many there are.
  - "It reads r0, r1 and r2 and returns a sum, so the signature is three `s32`s in and an `s32` out."
---

# The registers are the roster

With no signature given, the first thing to recover is how many parameters the
function has. The ABI makes that a counting exercise: arguments arrive in `r0`,
`r1`, `r2`, `r3`, in source order, so **every argument register the body reads is
a parameter**, and the highest one it reads tells you how many there are.

Here is a function that reads `r0` and `r3`:

```asm
0        add       r0, r3
2        bx        lr
```

`r3` is the fourth argument register, so this function has **four** parameters
even though only two of them do any work. And `r0` holds a value at `bx lr`, so
it returns something. The C is:

```c
s32 useFirstAndFourth(s32 a, s32 b, s32 c, s32 d) {
    return a + d;
}
```

`b` and `c` are never touched, but they must still be declared — leave one out
and `d` would arrive in `r2` instead of `r3`, and the assembly would not match.
Parameters are positional; the position is the register.

So: scan the body for argument registers, take the highest, and that is your
count. Then work out what the arithmetic does with them.

## Your task

Write `func_0800c1a4` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0800c1a4(s32 a, s32 b, s32 c) {
    return a + b + c;
}
```
