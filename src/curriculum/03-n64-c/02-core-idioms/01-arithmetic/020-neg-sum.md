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
  - "Constant-minus-register with a negative constant — recover K by negating the immediate, then wrap the sum in a minus."
  - "No `negu` will appear in your output; the algebra already absorbed it."
---

# Algebra before emission

Negate a sum with a constant in it — `-(x + K)` — and you might expect an add
followed by a `negu`. IDO is smarter: it rewrites the algebra *first*.
`-(x + K)` is `(-K) - x`, which is just a subtraction from a constant — no
negation instruction needed. Here's `-(x + 6)`:

```asm
addiu t6, zero, -6   # -K, materialized directly
subu  v0, t6, a0     # (-6) - x  ==  -(x + 6)
jr    ra
nop
```

Read the shape: a small *negative* constant loaded into a register, then a
`subu` with the **constant on the left** and the variable on the right. That
operand order is the tell. Variable-minus-constant would've been a single
`addiu` with a negative immediate (warmup taught you that one); this is the
other way around, and it means the source was a negated sum.

To decode: negate the immediate to recover K, then write the sum, negated.
The pleasant surprise is what's *absent* — no `negu` anywhere, even though
the C plainly says "negative". When an expected instruction is missing,
suspect re-association: the compiler did the algebra at compile time and
emitted the simplified form. You'll meet this move again with more complex
expressions; this two-liner is its cleanest specimen.

## Your task

Write `func_800f5fb0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_800f5fb0(s32 a) {
    return -(a + 25);
}
```
