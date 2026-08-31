---
id: 0a87e675-5a53-41dd-81d8-f23b789e3aa2
slug: arithmetic-mul-add-form
title: "Shift Chains: The Add Form"
difficulty: 2
concepts:
  - arithmetic
  - strength-reduction
  - shifts
symbol: func_802a1f98
hints:
  - "`sll` by k makes 2^k times the input; the `addu` folds one more copy of the
    original input on top."
  - "Work out what multiple the register holds after each line — the final constant is the single multiplier your C needs."
---

# 2^k plus one

Warmup showed you IDO's favorite trick: constant multiplies become shift chains,
because a real multiply is slow. Now let's get systematic about the shapes those
chains take, because you'll be decoding them for the rest of your matching
career.

The simplest family: constants one *above* a power of two. Shift to get the
power of two, then add the original input back on. Here's ×5:

```asm
sll  v0, a0, 2     # v0 = x * 4
addu v0, v0, a0    # v0 = x*4 + x  =  x * 5
jr   ra
nop
```

The fingerprint is `sll` by `k` followed by `addu` with the *original argument
register* as the second operand. That combination always means
"2^k + 1 times the input": shift by 2 then add is ×5, shift by 4 then add is
×17, and so on.

The one thing to keep straight is *which* register the `addu` folds in. If it's
the untouched argument, you're adding 1× the input. Later chains re-add shifted
copies instead, and the arithmetic changes — so always check.

The target below is the same two-instruction shape with a different shift. Run
the algebra.

## Your task

Write `func_802a1f98` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_802a1f98(s32 x) {
    return x * 9;
}
```
