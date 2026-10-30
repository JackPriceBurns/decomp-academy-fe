---
id: 4448af52-24d3-568d-b435-4c22716aece1
slug: gba-foundations-identity
title: Arguments Arrive in r0 Too
difficulty: 1
concepts:
  - registers
  - calling-convention
symbol: identity
hints:
  - The first argument arrives in r0, and r0 is also the return register.
  - If the value you want to return is already in the register it must be
    returned in, there is no work left to do.
---

# Where arguments come from

The rule for arguments is short. The first four arguments arrive in **`r0`,
`r1`, `r2`, `r3`**, from left to right. Any arguments after the fourth go on the
stack, which a later chapter covers.

The *first* argument register and the *return* register are the same register.
This has a consequence that is worth seeing now. Here are two functions that
each return one of their two arguments:

```asm
0        mov       r0, r1
2        bx        lr
```

This one returns its **second** argument. The value is in `r1` and has to end
up in `r0`, so one `mov` copies it across. The other function returns its
**first** argument, and its whole body is this:

```asm
0        bx        lr
```

There is nothing else. The value was already in the register it had to be
returned in, so the compiler emitted no other instructions. A bare `bx lr` is a
complete, valid function. When you see one, ask what the input and output must
be for the function to have no work to do.

## Your task

Write `identity`, taking an `s32 x`, to reproduce the target assembly.

<!-- starter -->
```c
s32 identity(s32 x) {
    return 0;
}
```

<!-- solution -->
```c
s32 identity(s32 x) {
    return x;
}
```
