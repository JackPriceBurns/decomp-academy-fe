---
id: 00e460e9-db15-4171-880c-72cf5d85f926
slug: control-slt-bool
title: "slt: A Comparison as a Value"
difficulty: 2
concepts:
  - compare
  - booleans
symbol: func_80039180
hints:
  - "Two `slt`s on the same pair of registers, in opposite orders. Decode each one literally (first source < second source), then see what the `subu` does with the two results."
  - "The result is 1, 0, or -1 depending on how a and b relate. Two comparisons and one subtraction, all in one C expression."
---

# The comparison as a value

A branch uses a comparison to decide where to jump. Sometimes C wants to
*keep* the result instead: return it, store it, or give it to a caller. The
instruction for this is **`slt`**, "set on less than". It is the signed
version of the `sltu` you met when testing bits. It writes 1 to its
destination if the first source is strictly less than the second, and 0
otherwise:

```asm
slt  v0, a0, a1    # v0 = (a < b) ? 1 : 0
jr   ra
nop
```

That one instruction is the whole function `return a < b;`. There is no branch
anywhere. One detail means you must read `slt` carefully every time: **MIPS
has no "set on greater than" instruction**. When C says `a > b`, the compiler
uses the same `slt` with the operands swapped, because "b < a" means the same
as "a > b":

```asm
slt  v0, a1, a0    # v0 = (b < a) ? 1 : 0, which is a > b
jr   ra
nop
```

Both versions use the same mnemonic and the same registers. Only the operand
order differs, and it reverses the meaning. So the reading rule is mechanical:

> `slt d, x, y` always means exactly `x < y`. Decode it literally, in operand
> order. *Then* decide whether the C writes it as `<` or as a flipped `>`.

The target below uses both directions in one function. It has two `slt`s that
compare the same registers, one in each order, and a `subu` that combines the
two booleans into one result. Decode each compare literally. Then work out
what value the subtraction gives when `a` is bigger, smaller, or equal, and
you will recognize a classic comparator. Write it as one expression: two
comparisons in parentheses and an arithmetic operator.

## Your task

Write `func_80039180` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80039180(s32 a, s32 b) {
    return (a > b) - (a < b);
}
```
