---
id: 2b141330-eeff-45e3-9120-bdeb46b4d975
slug: gba-arithmetic-pooled-constant
title: Constants From the Pool
difficulty: 3
concepts:
  - constants
  - literal-pool
  - immediates
symbol: func_0804f1b8
hints:
  - A pool word larger than 2147483648 is a negative number. Subtract
    4294967296 to read it. The `add` that uses it is gcc's rewrite of a
    subtraction.
  - The function takes two `s32` parameters and returns an `s32`. The register
    arithmetic is the first parameter minus the second, and then the pooled
    constant 4660 is subtracted.
---

# The number is in the listing, and it may be negative

Sometimes no small value shifted left gives the constant. Then gcc does not
build it. Instead, it stores the full 32-bit word in the literal pool after the
function, and loads it from there:

```asm
0        ldr       r1, [pc, #4] (->8)
2        add       r0, r1
4        bx        lr
6        .hword    0
8        .word     5000
```

5000 is 625 << 3, and 625 does not fit in the eight-bit `mov`, so the constant
goes in the pool. The `.word` line is the constant, printed in decimal. To read
it back, copy the number.

Watch out for one case. Here is a function that subtracts 300:

```asm
0        ldr       r2, [pc, #4] (->8)
2        add       r0, r1, r2
4        bx        lr
6        .hword    0
8        .word     4294966996
```

The instruction is an `add`, and the constant is very large. Both have the same
cause. gcc rewrites `value - K` as `value + (-K)`, and −300 stored in 32 bits is
4294967296 − 300 = 4294966996. To read a pool word, check whether it is
above 2147483648. If it is, subtract 4294967296, and you get the negative number
that the source wrote.

This is why **every** subtraction of a constant above 255 becomes a pool load.
A negative number can never be a small value shifted left. So the `mov`/`lsl`
method from the last lesson cannot be used, however round the constant looks in
decimal. Adding 1024 takes three instructions. Subtracting 1024 needs a pool
word.

One last detail from the two listings above. The `.hword 0` between the code and
the `.word` is alignment padding. A word has to start at a multiple of four, and
both functions ended at address 6. If a function's code already ends on a
multiple of four, it gets no padding row, and the pool word comes straight after
`bx lr`. Neither row is an instruction, but both are still part of the function
you are matching.

## Your task

Write `func_0804f1b8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0804f1b8(s32 a, s32 b) {
    return (a - b) - 4660;
}
```
