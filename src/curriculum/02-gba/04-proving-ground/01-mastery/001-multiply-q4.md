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
  - The two `lsl`/`asr` pairs at the top are parameter sign-extension, so both
    inputs are 16 bits wide. The `mul` is the whole operation; everything after
    it is scaling.
  - Q4 means four fractional bits, so a product of two Q4 values carries eight
    and has to come back down by four. The bias before the shift is the same
    trick you used for signed division by a power of two.
  - "Two `s16` in, an `s16` out; the product wants a wider local to live in
    while it is being biased."
---

# A real fixed-point multiply

This is `MultiplyQ4` from **Klonoa: Empire of Dreams**, shipped in 2001. The
game keeps positions and speeds in 4.4 fixed point — four integer bits, four
fractional — and this is the routine that holds that format together across a
multiply.

Multiplying two Q4 values gives a Q8 product: the fractional bits add up. To get
back to Q4 the product has to lose four bits off the bottom. On a signed value
that is where the trouble starts, because `>>` on a negative number rounds
*down*, toward negative infinity, while the rest of the game's arithmetic rounds
toward zero. Klonoa's programmer fixed that by hand, adding `2^n - 1` to
negative products before shifting so they land on the same side as the positive
ones.

Here is the same correction applied at Q8 — a gain multiply that scales a value
by an 8.8 factor:

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

One argument is sign-extended on entry (`lsl #16` / `asr #16`), `mul` forms the
product, and then the bias: `cmp r0, #0` / `bge` skips the correction when the
product is non-negative, and the negative path adds 255 — one less than the
shift's divisor — before the `asr #8` brings it home. The bias constant always
follows the shift amount: `>> 8` pairs with 255, `>> 6` with 63.

Your target closes on a shift pair whose two amounts do not match. Here is that
pattern by itself, in a routine that packs a value down into a signed byte:

```asm
0        lsl       r0, #21
2        asr       r0, #24
4        bx        lr
```

`lsl #L` then `asr #R` keeps a field `32 - R` bits wide, starting at bit
`R - L`, sign-extended. Here that is eight bits starting at bit three — a
right shift by three, truncated back down to a signed byte. agbcc fuses "shift the
value" and "narrow the result to its declared type" into that one pair, so a
single pair carries both jobs at once and the *difference* between the two
amounts is the shift the C asked for.

One more detail to plan for. In the target the value that gets biased and the
value that came out of the `mul` do not share a register: there is a `mov`
between them, the `cmp` tests one of them and the `add` lands on the other, and
the shift that follows is written in three-operand form. A copy like that is
agbcc keeping two values live where one would do, and the usual cause is a
source that gave them separate names.

Read the target the same way: find the bias constant on the `add`, then work the
closing pair backwards to recover the shift and the width it truncates to.

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
