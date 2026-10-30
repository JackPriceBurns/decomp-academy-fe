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
  - "Split the listing where the registers change. The instruction that starts the `t7` chain marks where the multiply begins, and its source register holds the value being multiplied."
  - "The shift chain works on its own intermediate value, never on a single argument. So the ×1 add or subtract steps use the *value in parentheses*, not `a0`."
---

# Assembling the pieces

Now you will read a whole expression with no help. When the *input* of a
multiply chain is itself a computed value, decoding has two steps. First, find
the value the chain works on. Then track the running multiplier through the
chain. Here's `(p - q) * 10 + 3`:

```asm
subu  v0, a0, a1    # v0 = p - q          (the value being multiplied)
sll   t6, v0, 2     # t6 = (p-q) * 4
addu  t6, t6, v0    # t6 = (p-q) * 5      (note: adds v0, NOT a0!)
sll   t6, t6, 1     # t6 = (p-q) * 10
addiu v0, t6, 3     # v0 = (p-q)*10 + 3
jr    ra
nop
```

The important line is line three. In a plain `× 5`, the `addu` adds the
argument register. Here it adds **`v0`, the result of the subtraction**,
because the value being multiplied is `(p − q)`, not `p`. The ±1 steps of a
chain always use *the chain's own input*, whatever register holds it. Find
that register once, at the first `sll`, and use it all the way through.

So the general method for compound arithmetic is:

1. Find the sub-expression: the instructions before the first `sll`, and the
   register that holds their result.
2. Track the running multiplier through the chain, reading "the input" as that
   register.
3. Apply whatever comes after the chain. Here that is a constant. In the
   target below, it is something else you have seen.

## Your task

Write `func_801b6710` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_801b6710(s32 a, s32 b, s32 c) {
    return (a + b) * 12 - c;
}
```
