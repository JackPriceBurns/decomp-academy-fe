---
id: c99a07a8-0352-49a8-8846-2c5fcfbfd438
slug: gba-control-flags-for-free
title: The Compare That Vanished
difficulty: 3
concepts:
  - branches
  - comparisons
  - arithmetic
symbol: func_081352f0
hints:
  - "`cmn` is a compare against the negation, so it sets the flags from
    `r0 + r1`. The branch after it is testing that sum, and both arms return
    something built from the third argument."
  - Three `s32` arguments and an `s32` result. Two of them are only ever added
    together and tested; the third is what comes back, plus one on the arm the
    branch falls into.
---

# When the arithmetic disappears into the compare

Every Thumb data-processing instruction on the low registers sets the condition
flags, which suggests an obvious optimisation: compute `a - b`, then branch on
the flags the subtraction already left behind. gcc 2.9 does not do that. Test
the result of a `mul`, an `asr`, an `orr`, an `and` — the redundant `cmp Rd, #0`
is emitted every single time. Its Thumb back end models the compare as a
separate operation and has no peephole to remove it.

What does happen is the reverse, and it is easy to mistake for the same thing.
When the result of a subtraction, an addition or an exclusive-or is used for
nothing except a test against zero, the arithmetic is folded *into* the compare
and the value is never computed at all:

```asm
0        cmp       r0, r1
2        beq       6 ~>
4        mov       r2, #7
6      ~>mov       r0, r2
8        bx        lr
```

There is no `sub` in that listing. The source subtracted two values and asked
whether the difference was non-zero, and `cmp r0, r1` answers that question by
itself. `a ^ b` folds the same way, and `a - k` against a constant folds into
`cmp Rn, #k`. An addition folds too, into the one instruction that exists for
precisely this: `cmn Ra, Rb` sets the flags from `Ra + Rb` — compare against the
negation. Outside this fold you will essentially never see `cmn`, so reading one
in a target is strong evidence that the C said "add these and test the sum".

Now the control. Keep the difference alive past the test and everything comes
back:

```asm
0        sub       r0, r1
2        cmp       r0, #0
4        bne       8 ~>
6        mov       r0, #100
8      ~>bx        lr
```

One extra use of the value in the source, and the listing gains both the `sub`
*and* the `cmp #0` that the `sub` had supposedly made unnecessary. That pair is
the normal state of affairs in agbcc output. A missing compare tells you an
arithmetic instruction was absorbed because its result was dead. It never tells
you the compiler reused the flags of an instruction it kept.

Your target opens with the addition form. Read its branch as a jump to whichever
arm the condition selects, and both halves of the source fall out.

## Your task

Write `func_081352f0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081352f0(s32 a, s32 b, s32 c) {
    if (a + b) return c;
    return c + 1;
}
```
