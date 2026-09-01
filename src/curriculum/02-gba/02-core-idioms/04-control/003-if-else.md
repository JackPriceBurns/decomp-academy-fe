---
id: cfbb6c17-c064-4221-8227-40d4f43909de
slug: gba-control-if-else
title: If and Else
difficulty: 2
concepts:
  - branches
  - control-flow
  - returns
symbol: func_08123520
hints:
  - Both arms subtract, and they differ only in which operand goes first. The
    three-operand `sub r0, r1, r0` writes its result over its own second source,
    which is why it needs the long form.
  - Two `s32` arguments and an `s32` result. The function answers with the
    distance between the two values, and the arm the branch jumps to is the one
    written first in the source.
---

# The order of the arms is part of the object

gcc 2.9 does no block reordering worth the name, so the two arms of an `if`/
`else` come out in a fixed relationship to the branch — and swapping them in the
source produces a genuinely different function, not a rearrangement of the same
one.

Start from the reading that never fails: a conditional branch goes to its
target when its condition holds, so the arm at the target is the arm that
condition selects. Everything else is layout — which of the two arms the
compiler decided to put there.

For an `if`/`else` whose arms both end in `return` and both need instructions of
their own, that decision is consistent. The `else` arm takes the fall-through
slot directly under the branch and ends with an unconditional `b` over the other
one; the `if` arm goes to the target; and so the branch carries the condition
exactly as written:

```asm
0        cmp       r0, r1
2        blt       8 ~>
4        sub       r0, #1
6        b         10 ~>
8      ~>add       r0, r1, #1
10     ~>bx        lr
```

`blt` is the source's `<`, unmodified. It jumps to address 8, which computes the
`if` arm; the `else` arm sits at 4 and hops over it. Now the same decision
written the other way round:

```asm
0        cmp       r0, r1
2        bge       8 ~>
4        add       r0, r1, #1
6        b         10 ~>
8      ~>sub       r0, #1
10     ~>bx        lr
```

Same two answers, same decision, same twelve bytes — and a different
object. The two listings differ in the branch mnemonic and in which arm is
which. No amount of editing the bodies will turn one into the other; the fix is
always to flip the condition in the source.

The decision goes the other way when the arms are ordinary statements that fall
into shared code afterwards. Then the `if` arm takes the fall-through slot, the
`else` arm becomes the target, and the branch is the negation — the same
polarity that guarded a single statement two lessons ago:

```asm
0        cmp       r0, r1
2        bge       8 ~>
4        add       r2, #1
6        b         10 ~>
8      ~>sub       r2, #1
10     ~>mov       r0, r2
12       bx        lr
```

Written `if (a < b)`, compiled `bge`. The `if` arm is at 4 this time, first,
because there is real code after the join for it to fall into. So before you
trust a branch's polarity, check whether its arms return or continue.

A third arrangement turns up later in the chapter, when one arm needs no
instructions at all because its value already sits in `r0`. That arm becomes the
target, the other is skipped over, and the branch carries whichever condition
selects the free one. The reading rule still handles it; only the layout habit
changes.

Your target returns from both arms and both of them need an instruction. The two
arms do the same kind of arithmetic in opposite directions — read carefully
which register each one keeps.

## Your task

Write `func_08123520` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08123520(s32 a, s32 b) {
    if (a > b) return a - b;
    else return b - a;
}
```
