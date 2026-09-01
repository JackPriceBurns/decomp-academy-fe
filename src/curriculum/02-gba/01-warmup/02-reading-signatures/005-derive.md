---
id: 77638038-dbaf-49d8-a844-de2441d299ec
slug: gba-signatures-derive
title: Derive the Whole Thing
difficulty: 2
concepts:
  - calling-convention
  - arguments
  - arithmetic
symbol: func_08023b1c
hints:
  - The subtract reads the fourth argument register and the second one, so count
    up to the highest and declare the ones you skip over.
  - "Four `s32` parameters in, an `s32` out, and only two of them are used — in the order the three-operand `sub` reads them."
---

# All three questions at once

You now have the whole method. Given nothing but a listing, work through it in
this order:

1. **Does it return anything?** Check what is in `r0` at `bx lr`. A computed
   value means a return type; a store through a register means `void`.
2. **How many parameters?** Find the highest argument register the body reads.
   That position is the count, including any it skips over.
3. **What does it do?** Read the arithmetic, remembering that the two-operand
   forms overwrite their destination and the three-operand forms do not.

Here is the method run on a listing you have not seen:

```asm
0        add       r2, r3
2        str       r2, [r0, #0]
4        bx        lr
```

Nothing lands in `r0` — it is used as an address by the `str` — so this returns
`void`. The highest argument register read is `r3`, so there are four
parameters. And the arithmetic is `r2 = r2 + r3` stored through `r0`, which is
the third parameter plus the fourth, written to the address in the first:

```c
void addIntoSlot(s32 *p, s32 a, s32 b, s32 c) {
    *p = b + c;
}
```

The second parameter is never touched, and you know it is there only because the
sum reached as high as `r3`.

Three passes, one signature, no guessing. Run the same three questions against
your target.

## Your task

Write `func_08023b1c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08023b1c(s32 a, s32 b, s32 c, s32 d) {
    return d - b;
}
```
