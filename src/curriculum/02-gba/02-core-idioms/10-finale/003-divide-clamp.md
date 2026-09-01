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
  - "`__divsi3` reads the numerator out of r0 and the divisor out of r1, and
    hands the quotient back in r0. Everything in front of the `bl` exists to get
    those two registers right."
  - Each clamp is one `cmp` and one `mov` that the branch skips, laid down in
    the order the source wrote them. Check both compare constants for the
    off-by-one nudge — `bge` and `bgt` against the same number mean different C.
  - "Two `s32` in, an `s32` out. The numerator is scaled up before the division, and neither clamp constant was nudged, so both bounds are in the listing exactly as the source wrote them."
symbol: func_082d00a0
---

# A call in the middle, a clamp on the way out

The ARM7TDMI cannot divide, so a `/` by anything the compiler cannot turn into a
shift becomes a call to `__divsi3`: numerator in r0, divisor in r1, quotient back
in r0. That call cuts the function into a before and an after, and the two halves
follow different rules — before it you are arranging argument registers, after it
you are working on a value that already lives in r0.

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

The prologue is a bare `push {lr}` — no callee-saved registers at all, because
nothing has to stay alive across the call. The argument goes in, the quotient
comes back in r0, and every instruction after the `bl` operates on r0 in place.
The moment a value does need to survive the helper you see `push {r4, lr}`
instead, with a `mov r4, ...` parking that value before the call.

`mov r1, #5` is the divisor, and it is worth noticing what did *not* happen: gcc
2.9 has no reciprocal-multiply trick, so a constant divisor costs the same full
call as a variable one. Note too that the address column steps from 4 to 8. A
`bl` is four bytes, and it is the one instruction that breaks the two-byte rhythm
of a Thumb listing.

Each clamp is a compare and a single move that the branch hops over, and the two
appear in the order the source wrote them, with the branch testing the negation
of the condition. The interesting one is at 8. The bound in the source is 1, and
the listing says 0. For integers "less than 1" and "at most 0" are the same
claim, and gcc canonicalises the first into the second, moving the constant down
by one and switching `bge` for `bgt`. The ceiling at 14 needed no such rewrite
and shows its bound directly.

The epilogue is the interworking shape every non-leaf function gets: the return
address is popped into a scratch register and jumped to, never popped straight
into `pc`.

Your target has the same divide-then-clamp spine, with work in front of the call
that this example did not need. Read its first three instructions and ask what
has to be true of r0 and r1 at the instant the `bl` executes, then read both
clamp branches to see whether either bound was nudged.

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
