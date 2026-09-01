---
id: 4448af52-24d3-568d-b435-4c22716aece1
slug: gba-foundations-identity
title: Arguments Land in r0 Too
difficulty: 1
concepts:
  - registers
  - calling-convention
symbol: identity
hints:
  - The first argument arrives in r0, and r0 is also the return register.
  - When the value you want to return is already in the register it has to leave
    in, there is no work left to do.
---

# Where arguments come from

The rule for arguments is short: the first four arrive in **`r0`, `r1`, `r2`,
`r3`**, left to right. Anything past the fourth goes on the stack, which is a
later chapter's problem.

Notice that the *first* argument register and the *return* register are the same
one. That overlap has a consequence worth seeing straight away. Here are two
functions that each hand back one of their two arguments:

```asm
0        mov       r0, r1
2        bx        lr
```

That one returns its **second** argument: `r1` holds it, `r0` has to hold it, so
one `mov` copies it across. The other function returns its **first** argument
instead — and its entire body is this:

```asm
0        bx        lr
```

Nothing at all. The value was already sitting in the register it needed to leave
in, so the compiler emitted no instructions whatsoever. A bare `bx lr` is a
complete, valid function, and when you see one you should immediately ask what
the input and output would have to be for there to be no work to do.

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
