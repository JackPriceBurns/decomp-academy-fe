---
id: 2fee65af-636f-4003-bae7-b00f38cab041
slug: gba-int64-truncate
title: Throwing the High Half Away
difficulty: 3
concepts:
  - int64
  - types
  - calls
symbol: func_083a1cec
hints:
  - The `bl` returns a pair in `r0:r1`. Count how many of those two registers
    the code after the call ever reads.
  - It takes two `s32` parameters and returns an `s32`. The second parameter is
    the value that has to survive the call in `r4`.
---

# Truncation has no instruction

Cutting a 64-bit value down to 32 bits costs nothing. The low half is already in
a register of its own, so to truncate, the compiler leaves out the code that
would have used the high half. There is no instruction to look for. Instead, you
look for what is **missing**: an `adc`, a sign fill, or a second load that never
appears.

You can see this when a function returns 64 bits. Its result arrives as a pair
in `r0:r1`, and the caller can use only one of the two registers:

```asm
0        push      {r4, lr}
2        mov       r4, r0
4        bl        nextTick-4
8        str       r0, [r4, #0]
10       pop       {r4}
12       pop       {r0}
14       bx        r0
```

The call returns two registers, and this function stores one of them. `r1`
never appears again, and no instruction is spent discarding it. The pointer has
to survive the call, so it is kept in `r4`, and that is why the function needs
`push {r4, lr}`. The frame is the cost of keeping a value across a call. The
truncation itself costs nothing.

Selecting the other half costs almost nothing extra:

```asm
0        push      {lr}
2        bl        nextTick-4
6        mov       r0, r1
8        pop       {r1}
10       bx        r1
```

`mov r0, r1` is the whole body. A 64-bit right shift by 32 followed by a
truncation to 32 bits is one register copy, because the bits that are kept were
already in a register of their own.

Compare the two epilogues. The first pops the saved link register into `r0`,
and the second pops it into `r1`. Both called the same function, which returns
64 bits. The scratch register in the last two instructions depends on the width
that **this** function returns, and the width it got back from the call does not
matter.

Your target keeps a second value alive across the call. Read what the code after
the `bl` actually uses.

## Your task

Write `func_083a1cec` to reproduce the target assembly.

<!-- context -->
```c
extern s64 readClock(s32 ch);
```

<!-- solution -->
```c
s32 func_083a1cec(s32 ch, s32 k) {
    return (s32)readClock(ch) + k;
}
```
