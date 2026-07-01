---
id: gba-idioms-multiply-q4
title: "MultiplyQ4: Fixed-Point Rounding"
difficulty: 3
concepts:
  - fixed-point
  - arithmetic
  - rounding
symbol: MultiplyQ4
hints:
  - This is 4.4 fixed-point — multiply the two values, then shift the product
    right by four.
  - The product is signed, so bias the negative case before the shift, exactly
    like signed division by a power of two.
---

# A real fixed-point multiply

This is `MultiplyQ4` from **Klonoa: Empire of Dreams** — a 4.4 fixed-point signed
multiply. It multiplies two `s16` values and shifts the product right by four to
drop the fractional bits.

The catch is the one you met with signed division: the product can be negative,
and an arithmetic shift would round it the wrong way, so the negative case is
biased before the shift. Here is the analogous **Q8** multiply (shifting by
eight) for contrast:

```asm
lsl	r0, r0, #0x10
asr	r0, r0, #0x10
lsl	r1, r1, #0x10
asr	r1, r1, #0x10
mul	r0, r0, r1
cmp	r0, #0
bge	.L3
add	r0, r0, #0xff
lsl	r0, r0, #0x8
asr	r0, r0, #0x10
bx	lr
```

The opening `lsl`/`asr` pairs sign-extend the 16-bit arguments. After the `mul`,
the `bge` skips the bias for non-negative products; negatives get `2^n - 1`
added first. The closing `lsl`/`asr` shift the result down and re-truncate it
back to `s16`.

Your exercise is the **Q4** version — shifting by four — with the rounding
written out as an explicit `if`. Read the target for the shift amount and the
exact bias constant.

## Your task

Write `MultiplyQ4`, taking two `s16`s, to reproduce the target assembly.

<!-- context -->
```c
typedef signed short s16;
typedef signed int s32;
```

<!-- starter -->
```c
s16 MultiplyQ4(s16 num1, s16 num2) {
    return 0;
}
```

<!-- solution -->
```c
s16 MultiplyQ4(s16 num1, s16 num2) {
    s32 product;
    s32 rounded;

    product = num1 * num2;
    rounded = product;
    if (rounded < 0) {
        rounded += 0xF;
    }
    product = rounded >> 4;
    return product;
}
```
