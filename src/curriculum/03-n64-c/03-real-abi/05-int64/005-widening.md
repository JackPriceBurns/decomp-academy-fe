---
id: c592d7f4-aa45-41ab-b1eb-adf55553416c
slug: int64-widening
title: "Widening: Building the High Half"
difficulty: 2
concepts:
  - int64
  - casts
  - sign-extension
symbol: func_80164b5c
hints:
  - "The low half is a plain copy. The only question is what fills the high half, and the target does not fill it with zero."
  - "A `sra` by 31 copies bit 31 into every bit of the register. Which source type needs its sign kept?"
---

# 32 bits in, 64 bits out

Going from a 32-bit value to a 64-bit one costs very little, because the low
half already exists. The only work is *creating a high half*, and there are
exactly two patterns for it. Here is `stretch(x)`, which returns a `u32` as a
`u64`:

```asm
or     v1, a0, zero    # low half: the value, untouched
addiu  v0, zero, 0     # high half: zero, since nothing is above bit 31
jr     ra
nop
```

For an **unsigned** source, the upper 32 bits are zero. Two moves and the
function is done. Notice what is *missing*: there are no homing stores. The
argument is 32-bit, so it stays in its register. The 64-bit value only exists
at the end, in the `v0`:`v1` pair.

A **signed** source needs more. A negative `s32` has its sign in bit 31, and
the 64-bit version must copy that sign into *all 32* upper bits. The high half
is `0xFFFFFFFF` for negative values and zero for positive values. One
instruction produces exactly that: `sra` by 31, an arithmetic shift that
copies the sign bit into every bit of the register. You have seen
`sra reg, reg, 31` before in the division fix-ups. Here it appears on its own,
to produce the sign.

So you can tell the two patterns apart at a glance:

- high half built by `addiu …, zero, 0` → the source was **unsigned**
- high half built by `sra …, …, 31` → the source was **signed**

Remember this pair. From now on, the optimizer will put a lone `sra` by 31 in
the middle of larger 64-bit code whenever a narrow signed value is involved,
and you will need to recognize it there.

The target uses the other pattern. The C is one line, and the *signature* is
the answer.

## Your task

Write `func_80164b5c` to reproduce the target assembly.

<!-- solution -->
```c
s64 func_80164b5c(s32 x) {
    return x;
}
```
