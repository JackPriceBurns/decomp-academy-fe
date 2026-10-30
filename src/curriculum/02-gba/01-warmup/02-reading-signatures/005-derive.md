---
id: 77638038-dbaf-49d8-a844-de2441d299ec
slug: gba-signatures-derive
title: Derive the Whole Function
difficulty: 2
concepts:
  - calling-convention
  - arguments
  - arithmetic
symbol: func_08023b1c
hints:
  - The subtract reads the fourth argument register and the second one. Count up
    to the highest one, and declare the parameters you skip over.
  - "Four `s32` parameters in and an `s32` out. Only two of the parameters are used, in the order that the three-operand `sub` reads them."
---

# The three questions together

You now know the whole method. When all you have is a listing, work through it
in this order:

1. **Does it return anything?** Check what is in `r0` at `bx lr`. A computed
   value means the function has a return type. A store through a register means
   `void`.
2. **How many parameters?** Find the highest argument register that the body
   reads. Its position is the count, and the count includes any registers the
   body skips.
3. **What does it do?** Read the arithmetic. Remember that the two-operand forms
   overwrite their destination, and the three-operand forms do not.

Here is the method applied to a listing you have not seen:

```asm
0        add       r2, r3
2        str       r2, [r0, #0]
4        bx        lr
```

No result is left in `r0`, because the `str` uses it as an address. So this
function returns `void`. The highest argument register it reads is `r3`, so
there are four parameters. The arithmetic is `r2 = r2 + r3`, stored through
`r0`. That is the third parameter plus the fourth, written to the address in the
first:

```c
void addIntoSlot(s32 *p, s32 a, s32 b, s32 c) {
    *p = b + c;
}
```

The second parameter is never used. You only know it exists because the sum
reads a register as high as `r3`.

Each question is one pass through the listing, and together they give you the
signature without guessing. Ask the same three questions about your target.

## Your task

Write `func_08023b1c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08023b1c(s32 a, s32 b, s32 c, s32 d) {
    return d - b;
}
```
