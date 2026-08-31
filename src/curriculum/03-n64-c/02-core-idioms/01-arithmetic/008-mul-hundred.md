---
id: 070d3b7e-d74b-4cb2-8c9d-fe1f15259b9f
slug: arithmetic-mul-hundred
title: The Compiler Never Gives Up
difficulty: 3
concepts:
  - arithmetic
  - strength-reduction
  - fingerprints
symbol: func_801c34ec
hints:
  - "Five instructions, one constant. Decode in the margin like always — watch whether each `sll`/`addu`/`subu` touches the argument or the running result."
  - "The first four lines build an odd multiple; the final `sll` scales it by a power of two. Multiply through."
---

# Five instructions, one multiply

You might expect that past some size, IDO would shrug and use the actual
multiply unit. It doesn't. Watch it build ×25 — four instructions, no
multiplier in sight:

```asm
sll  v0, a0, 2     # v0 = x * 4
subu v0, v0, a0    # v0 = x * 3
sll  v0, v0, 3     # v0 = x*3 * 8  =  x * 24
addu v0, v0, a0    # v0 = x*24 + x =  x * 25
jr   ra
nop
```

Every move is one you know: ×3 by the subtract form, ×8 by shifting the
result, then one more copy of the original argument on top. (Check that last
`addu`'s second operand — `a0`, the untouched input, so it's +1×, not a
doubling.)

And it doesn't stop there. Multiply by 1000? A chain. By 12345? A chain of
*eight*. For constant multiplies of an `s32`, this compiler emits shift
chains, period — so when you finally do see a real multiply instruction in a
target, it's a loud signal that *both* operands are runtime values. That
instruction is next lesson's business.

For now, decode the five-op target below. It's the longest chain yet, but your
margin math doesn't care how long it goes.

## Your task

Write `func_801c34ec` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_801c34ec(s32 x) {
    return x * 100;
}
```
