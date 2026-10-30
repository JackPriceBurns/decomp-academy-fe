---
id: 6dcb19f6-f3a6-434b-b6a6-d5dea981a258
slug: gba-numbers-double
title: Doubles Cost Double
difficulty: 4
concepts:
  - floating-point
  - doubles
  - literal-pool
symbol: func_082a3618
hints:
  - The pool holds four words in two pairs, high half first. The first pair is
    0x3FF80000 with a zero low half, and the second is 0x40000000 with a zero
    low half.
  - "One `f32` in, an `f32` out. The two constants are 1.5 and 2.0, and neither
    has an `f` suffix. That is what pulls the whole expression into double."
---

# A missing suffix costs three calls

An `f64` does not fit in one register, so it is passed in a pair: `r0:r1` for
the first argument, `r2:r3` for the second, and `r0:r1` for the return value.
The helpers change their suffix from `sf` to `df`, and the rest of the shape
stays the same:

```asm
0        push      {lr}
2        bl        __adddf3-4
6        pop       {r2}
8        bx        r2
```

Look at the epilogue. `lr` is popped into `r2` instead of `r1`, because the
return value uses `r0` **and** `r1`. That one register tells you how wide the
return value is: `pop {r0}` means `void`, `pop {r1}` means one word, and
`pop {r2}` means two words.

Now a common mistake. In C89, a floating literal without a suffix is a
`double`. So if you write `0.25` instead of `0.25f` in an `f32` expression,
the usual arithmetic conversions apply. The float is widened, the arithmetic
is done in double, and the result is narrowed back:

```asm
0        push      {lr}
2        bl        __extendsfdf2-4
6        ldr       r3, [pc, #20] (->28)
8        ldr       r2, [pc, #12] (->24)
10       bl        __adddf3-4
14       bl        __truncdfsf2-4
18       pop       {r1}
20       bx        r1
22       .hword    0
24       .word     1070596096
28       .word     0
```

One add has become three calls and a pool entry of two words. With the `f`
suffix, the whole function would have been a single `bl __addsf3` and one pool
word.

To decode those two words, you need one more fact. A double's 64 bits are
split with the **high half at the lower address and in the lower register**.
That is the opposite of what you would expect on a little-endian machine. So
the pair here is 0x3FD00000_00000000. The sign is 0. The 11-bit exponent is
0x3FD = 1021, and with a bias of 1023 that gives 2^-2. The mantissa is zero,
so the significand is 1.0. The value is 0.25.

The `.hword 0` at address 22 is alignment padding. The pool must start on a
4-byte boundary, and the body ended on an odd halfword.

Your target does its arithmetic in double, and its pool holds four words.
Decode the two pairs to get the literals back. The helper names tell you what
was done with them.

## Your task

Write `func_082a3618` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_082a3618(f32 x) {
    return x * 1.5 + 2.0;
}
```
