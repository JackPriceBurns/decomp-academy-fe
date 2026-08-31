---
id: 7e92417b-c1b4-4462-9459-9ac6eb8f0de3
slug: types-capstone-mixed
title: "Capstone: Three Widths, One Expression"
difficulty: 4
concepts:
  - types
  - loads
  - shifts
  - capstone
symbol: func_803a4904
hints:
  - "Three loads, three different mnemonics — each one declares its own pointer parameter. Then an add, a subtract, and a final shift."
  - "The shift is `sra`, so the value being halved is signed — which it is, the moment a subtraction is involved. One return expression."
---

# Every oracle at once

Capstone time. One function, three pointers of three different types, and
an expression that leans on the whole chapter. First, a warm-up decode —
`blend2`, the average of two unsigned bytes:

```c
s32 blend2(u8 *p, u8 *q) {
    return (*p + *q) >> 1;
}
```

```asm
lbu   t6, 0(a1)     # *q — u8
lbu   t7, 0(a0)     # *p — u8
addu  v0, t6, t7    # the sum, full 32-bit width
sra   t8, v0, 1     # >> 1 — signed shift on the s32 sum
or    v0, t8, zero
jr    ra
nop
```

The subtlety is the `sra`. Both inputs are unsigned bytes — so why not
`srl`? Because C promotes narrow values to **`int`** before arithmetic:
`*p + *q` is an `s32` sum of two small numbers, and `>>` on a signed value
is `sra`. The loads tell you the *pointers'* types; the arithmetic runs at
full width under signed rules; only edges (loads, stores, casts, narrow
returns) ever narrow anything. That promotion rule is why byte-heavy code
still reads like ordinary integer code in the middle.

Now the target. Inventory its loads — three mnemonics, three widths and
signedness, three pointer declarations handed to you. Then read the
arithmetic as plain `s32` work: what's added, what's subtracted, what's
halved, in what order. The operand order on the `subu` and the register
feeding the `sra` pin the expression's shape. One `return` line covers
everything after the loads.

Declarations from mnemonics, expression from dataflow — the two halves of
this chapter, and of most functions you'll ever match.

## Your task

Write `func_803a4904` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_803a4904(u8 *a, s16 *b, s8 *c) {
    return (*a + *b - *c) >> 1;
}
```
