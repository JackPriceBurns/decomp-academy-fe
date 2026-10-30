---
id: 96c37633-b37c-44d7-bac0-d62fc061625e
slug: gba-abi-caller-stack-args
title: Pushing Arguments for a Call
difficulty: 4
concepts:
  - abi
  - arguments
  - stack
symbol: func_082f3c40
hints:
  - "Twelve bytes of outgoing block means three arguments beyond the four in registers. That makes seven in total, so read `[sp, #0]`, `[sp, #4]` and `[sp, #8]` as arguments five, six and seven."
  - "The function takes two `s32` parameters and returns an `s32`, and the call's result is returned unchanged. Watch the `mov r4, r0` and `mov r0, r1` pair at the top: it swaps the two parameters before the argument list is built."
---

# The outgoing block

From the caller's side, arguments after the fourth are memory that the callee
will read. gcc reserves that memory once, in the prologue, with a `sub sp, #N`.
The size is chosen for the *largest* call anywhere in the function. gcc
releases the memory once, in the epilogue, with a matching `add sp, #N`. It does
not push each argument separately, and it does not adjust `sp` between calls.

The block sits at the bottom of the frame. So argument five is written to
`[sp, #0]`, argument six to `[sp, #4]`, and argument seven to `[sp, #8]`. Here
is a call with five arguments:

```asm
0        push      {r4, lr}
2        sub       sp, #4
4        lsl       r2, r0, #2
6        add       r3, r1, #3
8        mov       r4, r0
10       mul       r4, r1
12       str       r4, [sp, #0]
14       bl        five-4
18       add       sp, #4
20       pop       {r4}
22       pop       {r1}
24       bx        r1
```

The block is four bytes, for one stack argument. Arguments one and two were
already in `r0` and `r1`, so gcc did not need to do anything for them.
Arguments three and four were computed straight into `r2` and `r3`. The fifth
argument had no register left to be built in, so gcc borrows `r4`. That is why
a function that makes only one call still saves a callee-saved register.

The order of these steps is worth learning well. A stack word must be built in
a register before it can be stored. By the time gcc reaches the fifth argument,
the registers it would build in already hold arguments one to four. Here
nothing was spare: `r0` and `r1` still held arguments one and two, and `r2` and
`r3` had already been written. So gcc borrowed `r4` for two instructions of
work. When a low register *is* still spare, gcc builds the stack words in that
register, and fills it with its own argument last, after every `str` is done.
In both cases, reading a call site from top to bottom will not give you the
argument list in order. gcc orders the `str`s and the `mov`s into `r0` to `r3`
by which registers are still free, and that is often different from the
argument order.

Your target reserves a bigger block than this one. One of the values it stores
there is a plain constant.

## Your task

`extern s32 emitRun(s32 a, s32 b, s32 c, s32 d, s32 e, s32 f, s32 g);` is
declared for you. Write `func_082f3c40` to reproduce the target assembly.

<!-- context -->
```c
extern s32 emitRun(s32 a, s32 b, s32 c, s32 d, s32 e, s32 f, s32 g);
```

<!-- solution -->
```c
s32 func_082f3c40(s32 base, s32 n) {
    return emitRun(n, base, base * 2, base + n, 1, n - 1, base);
}
```
