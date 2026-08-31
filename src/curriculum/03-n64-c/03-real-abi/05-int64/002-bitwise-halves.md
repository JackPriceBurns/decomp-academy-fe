---
id: 3baf8882-cbfa-44b7-9130-e50b940d9bc8
slug: int64-bitwise-halves
title: Two Halves, No Crosstalk
difficulty: 2
concepts:
  - int64
  - bitwise
  - register-pairing
symbol: func_802ebe20
hints:
  - "Same skeleton as the worked example — only the pairwise operation differs. Read its mnemonic."
  - "Label the four loaded registers as a-high, a-low, b-high, b-low first; the two combining instructions then read themselves."
---

# The easy 64-bit operations

Start with the 64-bit operations that barely notice they're 64-bit. A bitwise
operation treats every bit independently — no carries, no crossings — so on a
split value it's simply *the same instruction twice*: once for the high
words, once for the low. Here's `mask64(a, b)`, which returns `a & b` for two
`s64`s:

```asm
sw     a0, 0(sp)      # ── the homing ritual: two s64s, four words ──
sw     a1, 4(sp)
sw     a2, 8(sp)
sw     a3, 12(sp)
lw     t6, 0(sp)      # a-high
lw     t7, 4(sp)      # a-low
lw     t8, 8(sp)      # b-high
lw     t9, 12(sp)     # b-low
and    v0, t6, t8     # high halves meet…
and    v1, t7, t9     # …low halves meet
jr     ra
nop
```

Ten instructions of ceremony, two of substance. Practice the labeling drill
from last lesson: offsets 0/4 are the first argument's high and low, 8/12
the second's. Once the four `lw`s wear names, the payload is transparent —
high-with-high into `v0`, low-with-low into `v1`, and the pairs never
exchange a bit.

This "same op, twice" shape covers `&`, `|`, and `^` on 64-bit values. When
you see it — four homing stores, four loads, two identical mnemonics writing
`v0` and `v1` — the C is one operator between two `s64` arguments. The only
question left is *which* operator, and the mnemonic answers it.

The target swaps in a different bitwise instruction. Same drill.

## Your task

Write `func_802ebe20` to reproduce the target assembly.

<!-- solution -->
```c
s64 func_802ebe20(s64 a, s64 b) {
    return a | b;
}
```
