---
id: dc74a2e8-c360-45bb-ba67-b201b7dae209
slug: foundations-mul-const
title: Multiply Without a Multiplier
difficulty: 2
concepts:
  - arithmetic
  - strength-reduction
  - shifts
symbol: mulConst
hints:
  - "Each `sll k` multiplies by 2^k, and a `subu` right after a shift gives patterns such as 4x − x = 3x. Work through the chain from top to bottom."
  - "Multiply together the factors from every line. The chain computes one constant multiplier, so write that single multiply in C."
---

# The compiler would rather shift

This is the first big habit of this compiler: when it multiplies by a small
constant, it almost never uses the multiply unit. On the N64's CPU a real
multiply is slow, so IDO *builds* the product out of shifts, additions and
subtractions instead. `sll rd, rt, k` (**s**hift **l**eft **l**ogical) moves the
bits left by `k` places, and each place doubles the value: `sll` by 2 is ×4,
and `sll` by 3 is ×8.

So a single `sll` means a multiply by a power of two. For any other constant,
IDO chains shifts with subtractions and additions. Here it builds ×6:

```asm
sll  v0, a0, 2     # v0 = n * 4
subu v0, v0, a0    # v0 = n*4 - n   = n * 3
sll  v0, v0, 1     # v0 = n*3 * 2   = n * 6
jr   ra
nop
```

There is no multiply instruction anywhere, only (4n − n) × 2. To decode a chain
like this, go through it line by line and track which multiple of the input each
register holds, as the comments above do. By the last line, the register holds
one constant times the input, and *that* constant is what the C multiplies by.

The target below uses the same method with a different ending. Work the algebra
through to the last line.

## Your task

Write `mulConst`, taking an `s32 x`, to reproduce the shift chain in the target
assembly.

<!-- starter -->
```c
s32 mulConst(s32 x) {
    return 0;
}
```

<!-- solution -->
```c
s32 mulConst(s32 x) {
    return x * 12;
}
```
