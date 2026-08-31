---
id: 86d9c48e-c0c9-4647-b304-bdaa2b0cfb96
slug: arithmetic-capstone-chain
title: "Capstone: Chain Within a Chain"
difficulty: 3
concepts:
  - arithmetic
  - strength-reduction
  - shifts
  - capstone
symbol: func_801b6710
hints:
  - "Split the listing at the register boundary — the instruction that starts the `t7` chain marks where the multiply begins, and its source register is what's being multiplied."
  - "The shift chain touches its own intermediate, never a lone argument — so the ×1 add/sub steps use the *parenthesized value*, not `a0`."
---

# Assembling the pieces

Time to read a whole expression cold. When a multiply chain's *input* is
itself a computed value, the decode has two layers: figure out what value the
chain is feeding on, then run the margin math. Here's `(p - q) * 10 + 3`:

```asm
subu  v0, a0, a1    # v0 = p - q          — the value being multiplied
sll   t6, v0, 2     # t6 = (p-q) * 4
addu  t6, t6, v0    # t6 = (p-q) * 5      — note: adds v0, NOT a0!
sll   t6, t6, 1     # t6 = (p-q) * 10
addiu v0, t6, 3     # v0 = (p-q)*10 + 3
jr    ra
nop
```

The read that matters is on line three. In a bare `× 5` the `addu` folds in the
argument register; here it folds in **`v0`, the subtraction's result** —
because the thing being quintupled is `(p − q)`, not `p`. The chain's ±1 steps
always reference *the chain's own input*, whatever register that lives in.
Spot that register once, at the first `sll`, and carry it through.

So the general decode for compound arithmetic:

1. Find the sub-expression: the instructions before the first `sll`, and the
   register they leave their result in.
2. Run margin math on the chain, reading "the input" as that register.
3. Attach whatever trails the chain — here a constant, in the target below
   something else you've seen.

## Your task

Write `func_801b6710` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_801b6710(s32 a, s32 b, s32 c) {
    return (a + b) * 12 - c;
}
```
