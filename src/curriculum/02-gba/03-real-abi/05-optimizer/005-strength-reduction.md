---
id: 64e4c4f8-d21c-4e15-8cd3-d3d0602e4910
slug: gba-optimizer-strength-reduction
title: Multiplication Turned Into Addition
difficulty: 4
concepts:
  - optimizer
  - loops
  - induction-variables
symbol: func_083ca000
hints:
  - There is no `mul` anywhere in the listing, but one register starts at zero
    and has the same register added to it every trip. That register holds a
    product.
  - The function takes two `s32` parameters and returns an `s32`. The first is
    the loop bound, and the second is what the loop index is multiplied by.
---

# A multiply that never happens

A variable that changes by a fixed amount on every trip through a loop is
called an induction variable. If you multiply one by a value the loop never
changes, the product is an induction variable too. It also changes by a fixed
amount each trip, and that amount is the multiplier. gcc 2.9 notices this and
replaces the multiply with an addition. This pass is called strength reduction.

On the ARM7TDMI this change is worth making. Thumb's `mul` is a real multiply,
and the number of cycles it takes depends on the operand. An `add` always takes
one cycle. Removing a multiply from a loop body saves real time, so gcc makes
the change whenever it can see the pattern.

After the pass, you see a register that is set before the loop and increased
inside it. The multiply is gone, and usually the loop counter is gone too. gcc
rewrites the test that counts up as a countdown on the register that held the
bound. A countdown keeps one value alive, while comparing `i` against the bound
would keep two alive.

Here is `strideSum`, which walks through an array three elements at a time:

```asm
0        mov       r3, #0
2        cmp       r3, r1
4        bge       20 ~>
6        mov       r2, r0
8      ~>ldr       r0, [r2, #0]
10       add       r3, r0
12       add       r2, #12
14       sub       r1, #1
16       cmp       r1, #0
18       bne       8 ~>
20     ~>mov       r0, r3
22       bx        lr
```

The C uses the subscript `i * 3`, so the byte offset is `i * 12`. Neither the
multiply by three nor the scaling by four appears. Instead, the preheader sets
`r2` to the base pointer, and the instruction at address 12 adds 12 to it on
every trip. The address itself has become the induction variable, so the load
is a plain `[r2, #0]`. The variable `i` is gone as well: `r1` counts the trip
count down to zero.

At the top, `r3` does two jobs. It is set to zero for the accumulator. Then the
guard at 2 compares it against the count. `i` is also zero at that point, and
the compiler already has a register that holds zero, so it uses that one.

In your target, the product never becomes an address. So the register that the
pass creates holds a plain value. It starts at zero and has the same register
added to it every trip. Find that register and work out what is added to it.
That tells you which multiply it replaced.

## Your task

Write `func_083ca000` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_083ca000(s32 n, s32 step) {
    s32 sum = 0;
    s32 i;
    for (i = 0; i < n; i++) sum += i * step;
    return sum;
}
```
