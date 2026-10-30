---
id: c99a07a8-0352-49a8-8846-2c5fcfbfd438
slug: gba-control-flags-for-free
title: Arithmetic Folded Into the Compare
difficulty: 3
concepts:
  - branches
  - comparisons
  - arithmetic
symbol: func_081352f0
hints:
  - "`cmn` compares against the negation, so it sets the flags from `r0 + r1`.
    The branch after it tests that sum. Both arms return a value made from the
    third argument."
  - There are three `s32` arguments and an `s32` result. Two of them are only
    added together and tested. The function returns the third, plus one on the
    arm the branch falls through to.
---

# When the arithmetic is folded into the compare

Every Thumb data-processing instruction on the low registers sets the condition
flags. That suggests an optimisation: compute `a - b`, then branch on the flags
that the subtraction already set. gcc 2.9 does not do that. If you test the
result of a `mul`, an `asr`, an `orr` or an `and`, the compiler emits a
redundant `cmp Rd, #0` every time. Its Thumb back end treats the compare as a
separate operation, and it has no peephole optimisation to remove it.

The compiler does the opposite, and you should not confuse the two. When the
result of a subtraction, an addition or an exclusive-or is used only for a test
against zero, the arithmetic is folded *into* the compare. The value itself is
never computed:

```asm
0        cmp       r0, r1
2        beq       6 ~>
4        mov       r2, #7
6      ~>mov       r0, r2
8        bx        lr
```

There is no `sub` in that listing. The source subtracted two values and tested
whether the difference was non-zero, and `cmp r0, r1` answers that question by
itself. `a ^ b` folds the same way, and `a - k` against a constant folds into
`cmp Rn, #k`. An addition folds too, into the instruction that exists for this
purpose: `cmn Ra, Rb` sets the flags from `Ra + Rb`. The name means "compare
against the negation". You will almost never see `cmn` outside this fold. So a
`cmn` in a target strongly suggests that the C said "add these and test the
sum".

For comparison, here is a version where the difference is still needed after
the test. Both instructions come back:

```asm
0        sub       r0, r1
2        cmp       r0, #0
4        bne       8 ~>
6        mov       r0, #100
8      ~>bx        lr
```

One extra use of the value in the source adds both the `sub` *and* the
`cmp #0` to the listing, even though the `sub` already set the flags. That pair
is normal in agbcc output. A missing compare tells you that an arithmetic
instruction was folded in because its result was not used again. It never means
that the compiler reused the flags of an instruction it kept.

Your target starts with the addition form. Read its branch as a jump to the arm
that the condition selects, and you will find both halves of the source.

## Your task

Write `func_081352f0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081352f0(s32 a, s32 b, s32 c) {
    if (a + b) return c;
    return c + 1;
}
```
