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
  - "There are three loads, each with a different mnemonic. Each load gives you the type of one pointer parameter. After the loads come an add, a subtract, and a final shift."
  - "The shift is `sra`, so the value being halved is signed, as it always is once a subtraction is involved. The body is one `return` expression."
---

# Using every type oracle at once

This is the capstone for the chapter. The target reads three values of three
different types, and its expression uses ideas from the whole chapter. First,
here is a warm-up example to decode. `blend2` returns the average of two
unsigned bytes:

```c
s32 blend2(u8 *p, u8 *q) {
    return (*p + *q) >> 1;
}
```

```asm
lbu   t6, 0(a1)     # *q (u8)
lbu   t7, 0(a0)     # *p (u8)
addu  v0, t6, t7    # the sum, full 32-bit width
sra   t8, v0, 1     # >> 1, a signed shift on the s32 sum
or    v0, t8, zero
jr    ra
nop
```

Look at the `sra`. Both inputs are unsigned bytes, so you might expect `srl`.
The compiler uses `sra` because C promotes narrow values to **`int`** before it
does arithmetic. `*p + *q` is an `s32` sum of two small numbers, and `>>` on a
signed value compiles to `sra`.

The loads tell you the types of the *pointers*. The arithmetic itself runs at
full width, using signed rules. Narrow sizes only matter at the edges: loads,
stores, casts and narrow return values. Because of this promotion rule, code
that works mostly on bytes still looks like ordinary integer code in the middle.

Now look at the target. First, list its loads. Each one uses a different
mnemonic, so each has its own width and signedness, and each one gives you a
pointer declaration. Then read the arithmetic as ordinary `s32` work. Work out
what is added, what is subtracted and what is halved, and in what order. The
operand order of the `subu`, and the register that feeds the `sra`, fix the
shape of the expression. A single `return` line covers everything after the
loads.

So the mnemonics give you the declarations, and the dataflow gives you the
expression. Those are the two skills this chapter teaches, and you will use
them in most functions you match.

## Your task

Write `func_803a4904` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_803a4904(u8 *a, s16 *b, s8 *c) {
    return (*a + *b - *c) >> 1;
}
```
