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
  - There is no `mul` anywhere in the listing, yet a register starts at zero
    and grows by a fixed register every trip. That register holds a product.
  - Two `s32` parameters, an `s32` out. The first bounds the loop; the second
    is what the loop index gets multiplied by.
---

# A multiply that never happens

A variable that changes by a fixed amount every trip through a loop is an
induction variable. Multiply one by something the loop never changes and the
product is an induction variable too — it also moves by a fixed amount each
trip, namely the multiplier. gcc 2.9 spots that and replaces the multiply with
an addition. The pass is called strength reduction.

ARM7TDMI makes the trade worth taking. Thumb's `mul` is a real multiply whose
cycle count depends on the operand, while `add` is one cycle always. Getting a
multiply out of a loop body is worth real time here, and gcc takes the trade
whenever it can see the pattern.

What survives the pass is a register initialised before the loop and advanced
inside it. The multiply goes, and usually the loop counter with it: gcc
rewrites the ascending test into a countdown on the register that held the
bound, because a countdown keeps one value alive where comparing `i` against
the bound would keep two.

Here is `strideSum`, walking an array three elements at a time:

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

The C subscripts with `i * 3`, so the byte offset is `i * 12`. Neither the
multiply by three nor the scaling by four appears. Instead `r2` is seeded with
the base pointer in the preheader and bumped by 12 at address 12 — the address
itself became the induction variable, and the load is a plain `[r2, #0]`.
Meanwhile `i` is gone: `r1` counts the trip count down to zero.

`r3` is doing two jobs at the top. It is zeroed for the accumulator, and the
guard at 2 then compares it against the count, because `i` is zero at that
point too and the compiler has a register holding zero already.

In your target the product never becomes an address, so the register the pass
creates holds a plain value: it starts at zero and gains the same register
every trip. Find it, work out what it gains, and the multiply it replaced is
right there.

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
