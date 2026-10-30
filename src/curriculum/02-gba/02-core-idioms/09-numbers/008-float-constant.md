---
id: f8bf32a0-d093-4a92-8070-1d97fa2f949a
slug: gba-numbers-float-constant
title: A Float Constant in the Pool
difficulty: 3
concepts:
  - floating-point
  - literal-pool
  - constants
symbol: func_0829eea4
hints:
  - Decode the pool word before anything else. 1120403456 is 0x42C80000, with
    sign 0, exponent 0x85 and mantissa 0x480000.
  - "One `f32` in, an `f32` out. 1120403456 is 100.0f. It is loaded into `r4`
    once, because both calls need it."
---

# Reading a constant from the pool

A Thumb instruction cannot hold a 32-bit value. The largest immediate is 8
bits, so every float literal in a program has to be stored in memory and
loaded. gcc stores it in the function itself. It emits the raw IEEE-754 bit
pattern as a `.word` in the middle of `.text`, and a PC-relative `ldr` loads
it.

```asm
0        push      {lr}
2        ldr       r1, [pc, #8] (->12)
4        bl        __addsf3-4
8        pop       {r1}
10       bx        r1
12       .word     1075838976
```

The workspace prints pool words in decimal, so getting the literal back takes
three steps. You will do this hundreds of times. First convert to hex:
1075838976 is 0x40200000. Then split that into its IEEE-754 fields:

- sign bit 0, so the value is positive;
- exponent byte 0x80 = 128, and the bias is 127, so the value is scaled by
  2^1 = 2;
- mantissa 0x200000 out of 0x800000 = 0.25, and the leading 1 is implicit, so
  the significand is 1.25.

Finally, 1.25 x 2 = 2.5, so the literal was `2.5f`. Memorise a few common
values, because you will see them all the time: 0x3F800000 is 1.0f,
0x3F000000 is 0.5f, 0x40000000 is 2.0f, 0xBF800000 is -1.0f, and 0 is 0.0f.

The pool is not always at the end. gcc can put it anywhere the load can reach,
even in the middle of the body:

```asm
0        push      {lr}
2        ldr       r1, [pc, #12] (->16)
4        bl        __gtsf2-4
8        cmp       r0, #0
10       bgt       20 ~>
12       mov       r0, #0
14       b         22 ~>
16       .word     0
20     ~>mov       r0, #1
22     ~>pop       {r1}
24       bx        r1
```

The `.word 0` at address 16 is between a branch and its destination. It is
data, not an instruction. It can go there because the instruction at 14 is an
unconditional `b`. Execution can never fall through into the next address, so
that gap is the cheapest place for gcc to put a word.

Notice what that zero costs as well. Comparing a float against a literal `0`
still needs a pool word of 0.0f and a full helper call. Without float
hardware, there is no faster way to compare with zero.

Learn to recognise one more habit. A literal used twice is emitted **once** and
kept in a callee-saved register between uses. This is why a function with only
one constant can push `r4` for no obvious reason. Your target does this.

## Your task

Write `func_0829eea4` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_0829eea4(f32 x) {
    return (x + 100.0f) * 100.0f;
}
```
