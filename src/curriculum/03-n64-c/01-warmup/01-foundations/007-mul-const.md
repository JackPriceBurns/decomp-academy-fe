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
  - "Each `sll k` multiplies by 2^k, and a `subu` right after a shift makes shapes like 4x - x = 3x. Work the chain top to bottom."
  - "Multiply the factor of every line together — the chain computes one constant multiplier; write that single multiply in C."
---

# The compiler would rather shift

Here's the first big personality trait of this compiler: for a multiplication by
a small constant, it essentially never uses the multiply unit. On the N64's CPU
a real multiply is slow, so IDO *builds* the product out of shifts and
adds/subtracts instead. `sll rd, rt, k` — **s**hift **l**eft **l**ogical — moves
the bits left by `k` places, and every place doubles the value: `sll` by 2 is
×4, by 3 is ×8.

A single `sll` therefore means a power of two. For anything else, IDO chains
shifts with subtractions and additions. Watch it build ×6:

```asm
sll  v0, a0, 2     # v0 = n * 4
subu v0, v0, a0    # v0 = n*4 - n   = n * 3
sll  v0, v0, 1     # v0 = n*3 * 2   = n * 6
jr   ra
nop
```

No multiply instruction anywhere — just (4n − n) × 2. To decode a chain like
this, walk it line by line and track what multiple of the input each register
holds, exactly like the comments above. By the last line the register holds one
clean constant times the input, and *that* constant is what the C multiplies by.

The target below is the same trick with a different ending. Run the algebra all
the way down.

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
