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
  - The pool holds four words in two pairs, high half first. 0x3FF80000 with a
    zero low half, then 0x40000000 with a zero low half.
  - "One `f32` in, an `f32` out. The two constants are 1.5 and 2.0 and neither
    carries an `f` suffix, which is what drags the whole expression into
    double."
---

# The suffix that costs three calls

An `f64` does not fit in a register, so it travels in a pair: `r0:r1` for the
first argument, `r2:r3` for the second, `r0:r1` for the return. The helpers
change their suffix from `sf` to `df` and everything else about the shape
stays:

```asm
0        push      {lr}
2        bl        __adddf3-4
6        pop       {r2}
8        bx        r2
```

Look at the epilogue. `lr` came back in `r2`, not `r1`, because the return
value occupies `r0` **and** `r1`. That single register is a complete answer to
"how wide is the return value": `pop {r0}` means `void`, `pop {r1}` means one
word, `pop {r2}` means two.

Now the trap. C89 says an unsuffixed floating literal is a `double`, so writing
`0.25` instead of `0.25f` in an `f32` expression triggers the usual arithmetic
conversions — widen the float, do the arithmetic in double, narrow the result
back:

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

One add became three calls and a two-word pool entry. With the `f` suffix the
whole function would have been a single `bl __addsf3` and one pool word.

Decoding those two words needs one more piece of knowledge. A double's 64 bits
are split with the **high half at the lower address and in the lower
register**, which is backwards from what a little-endian machine leads you to
expect. So the pair here is 0x3FD00000_00000000: sign 0, an 11-bit exponent of
0x3FD = 1021 against a bias of 1023 giving 2^-2, and a zero mantissa for a
significand of 1.0. That is 0.25.

The `.hword 0` at address 22 is alignment padding — the pool needs a 4-byte
boundary and the body ended on an odd halfword.

Your target does its arithmetic in double, and its pool holds four words.
Decode the two pairs to recover the literals, and the helper names tell you what
was done with them.

## Your task

Write `func_082a3618` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_082a3618(f32 x) {
    return x * 1.5 + 2.0;
}
```
