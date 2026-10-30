---
id: 63d7ecb0-3f65-4fe8-a78f-a7947cc0d0f0
slug: arithmetic-neg-sum
title: "The (-K) - x Fingerprint"
difficulty: 2
concepts:
  - arithmetic
  - fingerprints
  - registers
symbol: func_800f5fb0
hints:
  - "This is a constant minus a register, with a negative constant. Negate the immediate to get K, then put a minus in front of the sum."
  - "No `negu` will appear in your output. The compiler's algebra has already removed it."
---

# The compiler does the algebra first

If you negate a sum that contains a constant, such as `-(x + K)`, you might
expect an add followed by a `negu`. IDO rewrites the algebra *first*.
`-(x + K)` is the same as `(-K) - x`, which is a subtraction from a constant,
so no negation instruction is needed. Here's `-(x + 6)`:

```asm
addiu t6, zero, -6   # -K, loaded directly
subu  v0, t6, a0     # (-6) - x  ==  -(x + 6)
jr    ra
nop
```

Look at the shape: a small *negative* constant is loaded into a register, then
a `subu` has the **constant on the left** and the variable on the right. That
operand order is the sign to look for. A variable minus a constant would be a
single `addiu` with a negative immediate (the warmup taught you that one).
This is the other way around, and it means the source was a negated sum.

To decode it, negate the immediate to get K, then write the sum, negated.
Notice what is *missing*: there is no `negu` anywhere, even though the C
clearly says "negative". When an instruction you expected is missing, suspect
re-association. The compiler did the algebra at compile time and emitted the
simpler form. You will see this again with more complex expressions. This
two-instruction version is the simplest example.

## Your task

Write `func_800f5fb0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_800f5fb0(s32 a) {
    return -(a + 25);
}
```
