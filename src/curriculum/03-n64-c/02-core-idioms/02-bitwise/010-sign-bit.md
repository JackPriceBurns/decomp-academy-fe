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
  - "Something is computed first; the shift-by-31 then reads that result's sign. Work out the first instruction, then wrap it."
  - "`srl` needs the shifted thing to be unsigned in C — a cast on the
    computed value, then the shift."
---

# Bit 31 is the sign

For a signed 32-bit value, the top bit *is* the sign — 1 means negative. Shift
right by 31 and that single bit is all that's left, which makes "is this
negative?" a one-instruction question. But *which* right shift you use changes
the answer's shape. Signed first:

```asm
sra  v0, a0, 31    # 0 if x >= 0, else 0xffffffff
jr   ra
nop
```

`sra` drags copies of the sign bit down the whole register: the result is
**0 or all-ones** — a *mask*, ready to AND with something. That's `x >> 31` on
a signed `x`. Now the unsigned shift:

```asm
srl  v0, a0, 31    # 0 if x >= 0, else 1
jr   ra
nop
```

`srl` pours in zeros instead, leaving just **0 or 1** — a *boolean*: "the sign
bit, as a flag". Since `srl` is the unsigned shift, the C has to shift an
unsigned value — a cast, `(u32)x >> 31`, on an `x` that's otherwise signed.

Both shapes are all over compiled code, and the mnemonic tells you instantly
which one you're looking at: `sra 31` builds a sign *mask*, `srl 31` builds a
sign *flag*.

The target below computes something from its arguments first, *then*
takes the sign flag of the result — a two-step read: decode the arithmetic,
then hang the cast-and-shift off it.

## Your task

Write `func_801bd184` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_801bd184(s32 a, s32 b) {
    return (u32)(a - b) >> 31;
}
```
