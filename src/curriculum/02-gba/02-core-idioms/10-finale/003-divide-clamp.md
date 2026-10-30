---
id: 68d65a09-fdfd-490c-8df7-388d97aee45e
slug: gba-finale-divide-clamp
title: Divide, Then Clamp
difficulty: 4
concepts:
  - division
  - control-flow
  - calling-convention
hints:
  - "`__divsi3` reads the numerator from r0 and the divisor from r1, and
    returns the quotient in r0. Everything before the `bl` is there to put the
    right values in those two registers."
  - "Each clamp is one `cmp`, plus one `mov` that the branch skips. The clamps
    appear in the same order as in the source. Check both compare constants to
    see whether either one was moved by one. `bge` and `bgt` against the same
    number mean different C."
  - "The function takes two `s32` values and returns an `s32`. The numerator is scaled up before the division. Neither clamp constant was moved, so both bounds appear in the listing exactly as the source wrote them."
symbol: func_082d00a0
---

# A call in the middle and a clamp at the end

The ARM7TDMI has no divide instruction. So a `/` by any value that the compiler
cannot turn into a shift becomes a call to `__divsi3`. The numerator goes in
r0, the divisor goes in r1, and the quotient comes back in r0. That call splits
the function into two halves, and they follow different rules. Before the call,
the code is setting up the argument registers. After the call, it works on a
value that is already in r0.

Here is a function that divides by a constant and clamps the result between 1
and 20:

```asm
0        push      {lr}
2        mov       r1, #5
4        bl        __divsi3-4
8        cmp       r0, #0
10       bgt       14 ~>
12       mov       r0, #1
14     ~>cmp       r0, #20
16       ble       20 ~>
18       mov       r0, #20
20     ~>pop       {r1}
22       bx        r1
```

The prologue is only `push {lr}`. It saves no callee-saved registers, because
no value has to stay alive across the call. The argument goes in, the quotient
comes back in r0, and every instruction after the `bl` works on r0 directly. If
a value did need to survive the call, you would see `push {r4, lr}` instead,
with a `mov r4, ...` that saves the value in r4 before the call.

`mov r1, #5` is the divisor. Notice what did *not* happen here. gcc 2.9 cannot
replace a division by a constant with a multiply by its reciprocal, so a
constant divisor costs the same full call as a variable one. Notice too that
the address column jumps from 4 to 8. A `bl` is four bytes long. It is the one
instruction that breaks the steady two-byte steps of a Thumb listing.

Each clamp is a compare and a single move that the branch jumps over. The two
clamps appear in the same order as in the source, and each branch tests the
opposite of the C condition. The one to look at closely is at 8. The bound in
the source is 1, but the listing shows 0. For integers, "less than 1" and
"at most 0" mean the same thing. gcc rewrites the first form into the second:
it lowers the constant by one, and it uses `bgt` where you would expect `bge`.
The upper bound at 14 needed no such rewrite, so it appears in the listing as
it was written.

The epilogue has the interworking shape that every non-leaf function gets. The
return address is popped into a scratch register, and the code then jumps to
it. It is never popped straight into `pc`.

Your target has the same structure, a divide followed by two clamps, but it
does some work before the call that this example did not need. Read its first
three instructions and work out what r0 and r1 must hold at the moment the `bl`
runs. Then read both clamp branches to see whether either bound was moved by
one.

## Your task

Write `func_082d00a0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_082d00a0(s32 hp, s32 max) {
    s32 pct = hp * 100 / max;
    if (pct < 0) pct = 0;
    if (pct > 100) pct = 100;
    return pct;
}
```
