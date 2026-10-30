---
id: 070d3b7e-d74b-4cb2-8c9d-fe1f15259b9f
slug: arithmetic-mul-hundred
title: Shift Chains for Any Constant
difficulty: 3
concepts:
  - arithmetic
  - strength-reduction
  - fingerprints
symbol: func_801c34ec
hints:
  - "The chain has five instructions and one constant. Track the running multiplier as before, and check whether each `sll`/`addu`/`subu` uses the argument or the running result."
  - "The first four lines build an odd multiple. The final `sll` multiplies it by a power of two. Multiply the factors together."
---

# Five instructions for one multiply

You might expect IDO to switch to the real multiply unit once the constant is
large enough. It does not. Here it builds ×25 with four instructions and no
multiply:

```asm
sll  v0, a0, 2     # v0 = x * 4
subu v0, v0, a0    # v0 = x * 3
sll  v0, v0, 3     # v0 = x*3 * 8  =  x * 24
addu v0, v0, a0    # v0 = x*24 + x =  x * 25
jr   ra
nop
```

You know every step already: ×3 with the subtract form, ×8 by shifting the
result, then one more copy of the original argument. (Check the second operand
of that last `addu`. It is `a0`, the unchanged input, so it adds 1× the input
and does not double the result.)

Larger constants work the same way. A multiply by 1000 is a chain, and a
multiply by 12345 is a chain of *eight*. For constant multiplies of an `s32`,
this compiler always emits shift chains. So when you do see a real multiply
instruction in a target, it is a clear sign that *both* operands are runtime
values. You will meet that instruction soon.

For now, decode the target below, which has five instructions. It is the
longest chain so far, but the running multiplier works the same way at any
length.

## Your task

Write `func_801c34ec` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_801c34ec(s32 x) {
    return x * 100;
}
```
