---
id: 56f461be-8013-4f03-afe5-36dff5aef027
slug: bitwise-sign-bit
title: The Sign Bit, Two Ways
difficulty: 2
concepts:
  - bitwise
  - shifts
  - types
  - fingerprints
symbol: func_801bd184
hints:
  - "Something is computed first. The shift by 31 then reads the sign of that result. Work out the first instruction, then put the shift around it."
  - "`srl` needs the shifted value to be unsigned in C. Cast the computed value,
    then shift it."
---

# Bit 31 is the sign

For a signed 32-bit value, the top bit *is* the sign. A 1 there means the
value is negative. If you shift right by 31, only that one bit is left, so "is
this negative?" takes a single instruction. The right shift you choose changes
the form of the answer. Here is the signed shift first:

```asm
sra  v0, a0, 31    # 0 if x >= 0, else 0xffffffff
jr   ra
nop
```

`sra` copies the sign bit into every bit of the register. The result is **0 or
all ones**, which is a *mask* you can AND with something else. This is
`x >> 31` on a signed `x`. Now the unsigned shift:

```asm
srl  v0, a0, 31    # 0 if x >= 0, else 1
jr   ra
nop
```

`srl` fills in zeros instead, which leaves only **0 or 1**. That is a
*boolean*: "the sign bit, as a flag". Because `srl` is the unsigned shift, the
C has to shift an unsigned value. If `x` is signed, that means a cast:
`(u32)x >> 31`.

Both forms are common in compiled code, and the mnemonic tells you at once
which one you are looking at. `sra 31` builds a sign *mask*, and `srl 31`
builds a sign *flag*.

The target below computes a value first, *then* takes the sign flag of the
result. Read it in two steps: decode the arithmetic, then apply the cast and
the shift to it.

## Your task

Write `func_801bd184` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_801bd184(s32 a, s32 b) {
    return (u32)(a - b) >> 31;
}
```
