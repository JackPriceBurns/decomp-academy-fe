---
id: c592d7f4-aa45-41ab-b1eb-adf55553416c
slug: int64-widening
title: "Widening: Making a High Half from Nothing"
difficulty: 2
concepts:
  - int64
  - casts
  - sign-extension
symbol: func_80164b5c
hints:
  - "The low half is a plain copy. The question is only what fills the high half — and the target doesn't fill it with zero."
  - "A `sra` by 31 smears bit 31 across a whole register. Which source type needs its sign preserved?"
---

# 32 bits in, 64 bits out

Going from a 32-bit value to a 64-bit one costs almost nothing — the low
half already exists. The whole job is *inventing a high half*, and there are
exactly two recipes. Here's `stretch(x)`, which returns a `u32` as a `u64`:

```asm
or     v1, a0, zero    # low half: the value, untouched
addiu  v0, zero, 0     # high half: zero — nothing lives above bit 31
jr     ra
nop
```

For an **unsigned** source the upper 32 bits are simply zero. Two moves,
done. Notice what's *missing*: no homing stores. The argument is 32-bit, so
it stays in its register — the 64-bit value only exists on the way out, in
the `v0`:`v1` pair.

A **signed** source can't get away with that. A negative `s32` has its sign
in bit 31, and the 64-bit version must carry that sign in *all 32* upper
bits — a high half of `0xFFFFFFFF` for negatives, zero for positives. One
instruction manufactures exactly that: `sra` by 31, arithmetic-shifting the
sign bit down through the entire register. You've seen `sra reg, reg, 31`
before in division fix-ups; here it stands alone, as a sign factory.

So the two recipes read at a glance:

- high half built by `addiu …, zero, 0` → the source was **unsigned**
- high half built by `sra …, …, 31` → the source was **signed**

File that pair away — from now on the optimizer will drop a lone `sra` by 31
into the middle of larger 64-bit code whenever a narrow signed value joins
the party, and you'll need to recognize it mid-stream.

The target is the other recipe. The C is one line; the *signature* is the
answer.

## Your task

Write `func_80164b5c` to reproduce the target assembly.

<!-- solution -->
```c
s64 func_80164b5c(s32 x) {
    return x;
}
```
