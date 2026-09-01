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
  - The `bl` hands back a pair in `r0:r1`. Count how many of those two registers
    anything after the call ever reads.
  - Two `s32` parameters and an `s32` result. The second parameter is the value
    that has to survive the call in `r4`.
---

# Truncation is not an instruction

Cutting a 64-bit value down to 32 bits costs nothing at all. The low half is
already in a register on its own, so a truncation is the compiler simply never
emitting the code that would have touched the high half. There is no instruction
to look for. What you look for instead is **absence**: a missing `adc`, a
missing sign fill, a missing second load.

A function that hands back 64 bits makes that visible, because its result
arrives as a pair in `r0:r1` and the caller is free to care about only one of
them:

```asm
0        push      {r4, lr}
2        mov       r4, r0
4        bl        nextTick-4
8        str       r0, [r4, #0]
10       pop       {r4}
12       pop       {r0}
14       bx        r0
```

The call returns two registers and this function stores one. `r1` is never
mentioned again, and not a single instruction is spent discarding it. The
pointer had to survive the call, so it lives in `r4` and pays for the
`push {r4, lr}`. The frame is the price of holding a value across a call; the
truncation itself costs nothing.

Selecting the other half is barely more expensive:

```asm
0        push      {lr}
2        bl        nextTick-4
6        mov       r0, r1
8        pop       {r1}
10       bx        r1
```

`mov r0, r1` is the entire body. A 64-bit right shift by 32 followed by a
truncation to 32 bits is one register rename, because the bits that survive were
already sitting in a register by themselves.

Compare the two epilogues. The first pops the saved link register into `r0` and
the second into `r1`, even though both called the same 64-bit-returning
function - the scratch register in the last two instructions describes the width
**this** function returns, not the width it received.

Your target keeps a second value alive across the call, so read what the code
after the `bl` actually consumes.

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
