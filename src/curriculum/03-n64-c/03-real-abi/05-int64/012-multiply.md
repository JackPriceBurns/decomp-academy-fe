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
  - "Two 64-bit parameters fill `a0`–`a3` exactly; the reloads put each word straight back where it was homed from."
  - "Nothing after the call but the epilogue — the helper's result pair is already the answer."
---

# Multiplication joins the club

64-bit multiplication gets the same treatment as shifts: a millicode call.
The helper is `__ll_mul`, it takes two `s64` pairs in `a0`–`a3`, and it
returns the product in `v0`:`v1`. Here's `dozen(x)`, which returns an `s64`
times 12:

```asm
addiu  sp, sp, -24
sw     ra, 20(sp)
sw     a0, 24(sp)
sw     a1, 28(sp)
lw     a0, 24(sp)
lw     a1, 28(sp)
addiu  a2, zero, 0     # the 12, widened into a register pair —
jal    __ll_mul        # 64 × 64 multiply, by library call
addiu  a3, zero, 12    # (slot) low word of the constant
lw     ra, 20(sp)
addiu  sp, sp, 24
jr     ra
nop
```

Worth noticing what the optimizer *didn't* do: multiply by 12 on a 32-bit
value would have been strength-reduced to shifts and adds — you watched
that happen in the optimizer chapter. On 64 bits, at this debug level, no
such cleverness: the constant is built as a pair and `__ll_mul` is called
like any other. A `jal __ll_mul` with two `addiu`-from-`zero` feeding
`a2`:`a3` reads as *"times a small constant"*; read the constant off the
delay slot.

When **both** operands are variables, the setup is even plainer: four
homing stores, four reloads sending every word back to the register it
came from — and, as ever, the last reload rides the `jal`'s delay slot.
No widening `sra` this time; both operands already own two words.

Either way the tail is silent: product in `v0`:`v1`, epilogue, out. One
`*` in C.

That plainer, both-variables shape is the target.

## Your task

Write `func_801a6fec` to reproduce the target assembly.

<!-- solution -->
```c
s64 func_801a6fec(s64 a, s64 b) {
    return a * b;
}
```
