---
id: 87d0dc48-db5d-52a2-adb6-70372aca8f2c
slug: gba-idioms-multiply-q4
title: "MultiplyQ4: Fixed-Point Rounding"
difficulty: 3
concepts:
  - fixed-point
  - arithmetic
  - rounding
symbol: MultiplyQ4
hints:
  - "The two `lsl`/`asr` pairs at the top sign-extend the parameters, so both
    inputs are 16 bits wide. The `mul` does the actual operation, and everything
    after it is scaling."
  - "Q4 means four fractional bits. A product of two Q4 values has eight, so it
    must be shifted down by four. The bias added before the shift is the same
    technique you used for signed division by a power of two."
  - "Two `s16` values go in and an `s16` comes out. The product needs a wider
    local variable to hold it while the bias is added."
---

# A real fixed-point multiply

This is `MultiplyQ4` from **Klonoa: Empire of Dreams**, released in 2001. The
game stores positions and speeds in 4.4 fixed point: four integer bits and four
fractional bits. This routine keeps values in that format when they are
multiplied.

When you multiply two Q4 values, the fractional bits add up, so the product is
Q8. To get back to Q4, the product must lose four bits from the bottom. This
causes a problem for signed values. On a negative number, `>>` rounds *down*,
toward negative infinity, but the rest of the game's arithmetic rounds toward
zero. Klonoa's programmer corrected this by hand. Before shifting, the code adds
`2^n - 1` to negative products, so they round in the same direction as the
positive ones.

Here is the same correction at Q8, in a gain multiply that scales a value by an
8.8 factor:

```asm
0        lsl       r1, #16
2        asr       r1, #16
4        mul       r0, r1
6        cmp       r0, #0
8        bge       12 ~>
10       add       r0, #255
12     ~>asr       r0, #8
14       bx        lr
```

On entry, one argument is sign-extended (`lsl #16` / `asr #16`). Then `mul`
forms the product, and the bias comes next. `cmp r0, #0` / `bge` skips the
correction when the product is non-negative. On the negative path, the code
adds 255, which is one less than the shift's divisor. Then `asr #8` shifts the
result back down. The bias constant always depends on the shift amount: `>> 8`
pairs with 255, and `>> 6` pairs with 63.

Your target ends with a shift pair whose two amounts are different. Here is that
pattern on its own, in a routine that packs a value into a signed byte:

```asm
0        lsl       r0, #21
2        asr       r0, #24
4        bx        lr
```

`lsl #L` followed by `asr #R` keeps a field `32 - R` bits wide, starting at bit
`R - L`, and sign-extends it. Here that is eight bits starting at bit three. In
other words, it is a right shift by three, with the result truncated to a signed
byte. agbcc combines two steps into that one pair: shifting the value, and
narrowing the result to its declared type. So the *difference* between the two
amounts is the shift that the C code asked for.

One more detail to plan for. In the target, the value that gets the bias and the
value that came out of the `mul` are in different registers. There is a `mov`
between them. The `cmp` tests one of them and the `add` adds to the other, and
the shift after that uses the three-operand form. agbcc makes a copy like this
when it keeps two values live where one would be enough. The usual cause is
source code that gave them separate names.

Read the target the same way. First find the bias constant on the `add`. Then
work backwards through the final shift pair to recover the shift amount and the
width it truncates to.

## Your task

Write `MultiplyQ4` to reproduce the target assembly.

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
