---
id: 169bfb10-0a98-4b92-909a-da94bb3ec43b
slug: int64-multiply
title: "__ll_mul: The 64-bit Multiply"
difficulty: 3
concepts:
  - int64
  - multiply
  - millicode
  - calls
symbol: func_801a6fec
hints:
  - "Two 64-bit parameters fill `a0` to `a3` exactly. The reloads put each word straight back in the register it was homed from."
  - "Nothing comes after the call except the epilogue, because the helper's result pair is already the answer."
---

# Multiplication also uses a helper

64-bit multiplication is handled the same way as shifts: with a millicode
call. The helper is `__ll_mul`. It takes two `s64` pairs in `a0` to `a3` and
returns the product in `v0`:`v1`. Here is `dozen(x)`, which returns an `s64`
times 12:

```asm
addiu  sp, sp, -24
sw     ra, 20(sp)
sw     a0, 24(sp)
sw     a1, 28(sp)
lw     a0, 24(sp)
lw     a1, 28(sp)
addiu  a2, zero, 0     # the 12, widened into a register pair: high word…
jal    __ll_mul        # 64 × 64 multiply, by library call
addiu  a3, zero, 12    # (slot) …low word of the constant
lw     ra, 20(sp)
addiu  sp, sp, 24
jr     ra
nop
```

Notice what the optimizer *did not* do. A multiply by 12 on a 32-bit value
would have been strength-reduced to shifts and adds, as you saw in the
optimizer chapter. On 64 bits, at this debug level, there is no such
optimization. The constant is built as a pair and `__ll_mul` is called like
any other function. A `jal __ll_mul` with two `addiu`s from `zero` setting up
`a2`:`a3` means *"times a small constant"*. Read the constant from the delay
slot.

When **both** operands are variables, the setup is even simpler: four homing
stores, and four reloads that send every word back to the register it came
from. As usual, the last reload is in the `jal`'s delay slot. There is no
widening `sra` this time, because both operands already have two words.

In both cases nothing happens after the call. The product is in `v0`:`v1`,
then the epilogue runs and the function returns. It is one `*` in C.

Look at the target's call setup to see which of these two shapes it uses.

## Your task

Write `func_801a6fec` to reproduce the target assembly.

<!-- solution -->
```c
s64 func_801a6fec(s64 a, s64 b) {
    return a * b;
}
```
