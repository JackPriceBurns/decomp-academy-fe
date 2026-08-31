---
id: c7367995-be99-46bc-a4d3-997c25cd92b3
slug: int64-add-constant
title: Carrying a Constant
difficulty: 2
concepts:
  - int64
  - arithmetic
  - carry
  - immediates
symbol: func_801cd9e4
hints:
  - "The `sltiu` repeats the `addiu`'s immediate — that's the wrap check, aimed at the constant that was just added."
  - "Three arithmetic instructions, one `+` in C. Read the constant off the `addiu`."
---

# The carry chain, immediate edition

Add a *constant* to an `s64` and the carry chain from last lesson slims
down: the constant's low word rides inside an `addiu`, its high word is zero
and vanishes entirely. Here's `raise(x)`, which returns `x + 40`:

```asm
sw     a0, 0(sp)      # homing: high…
sw     a1, 4(sp)      # …low
lw     v1, 4(sp)      # low half, straight into the result's low register
lw     v0, 0(sp)      # high half likewise
addiu  v1, v1, 40     # low + 40
sltiu  at, v1, 40     # wrapped? then the sum landed BELOW what was added
addu   v0, v0, at     # fold the carry into the high half
jr     ra
nop
```

The carry detection got a twist worth staring at. Adding 40 to an unsigned
word wraps *exactly when* the result comes out smaller than 40 — so instead
of comparing against an operand register, the compiler compares against
**the same immediate**, with `sltiu`. An `addiu`/`sltiu` pair sharing one
constant is the fingerprint of *64-bit add-a-constant*, every time.

And because the constant's high word is zero, the high side needs just one
`addu`: old high plus carry. No second operand ever appears. Compare that
with the four-instruction register chain from last lesson — same idea,
one participant lighter.

Notice also where the loads went: straight into `v0` and `v1`. When the
result of the chain *is* the return value, the compiler builds it in the
return pair from the start.

The target adds a different constant. Two instructions name it.

## Your task

Write `func_801cd9e4` to reproduce the target assembly.

<!-- solution -->
```c
s64 func_801cd9e4(s64 x) {
    return x + 1;
}
```
