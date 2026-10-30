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
  - Both arms subtract. They differ only in which operand comes first. The
    three-operand `sub r0, r1, r0` writes its result over its own second source,
    which is why it needs the long form.
  - There are two `s32` arguments and an `s32` result. The function returns the
    distance between the two values. The arm the branch jumps to is the one
    written first in the source.
---

# The order of the arms changes the compiled code

gcc 2.9 does almost no reordering of code blocks. So the two arms of an `if`/
`else` always come out in a fixed position relative to the branch. If you swap
the arms in the source, you get a different function in the output.

Start from the rule that always works: a conditional branch goes to its target
when its condition is true, so the arm at the target is the arm that the
condition selects. The only other question is layout: which of the two arms the
compiler chose to put there.

For an `if`/`else` where both arms end in `return` and both need their own
instructions, the compiler always makes the same choice. The `else` arm goes in
the fall-through position, directly under the branch, and ends with an
unconditional `b` over the other arm. The `if` arm goes at the target. So the
branch uses the condition exactly as written:

```asm
0        cmp       r0, r1
2        blt       8 ~>
4        sub       r0, #1
6        b         10 ~>
8      ~>add       r0, r1, #1
10     ~>bx        lr
```

`blt` is the source's `<`, unchanged. It jumps to address 8, which computes the
`if` arm. The `else` arm is at 4 and jumps over it. Here is the same decision
written the other way round:

```asm
0        cmp       r0, r1
2        bge       8 ~>
4        add       r0, r1, #1
6        b         10 ~>
8      ~>sub       r0, #1
10     ~>bx        lr
```

Both listings compute the same two answers from the same decision, and both
are twelve bytes long. But they are different code: the branch mnemonic
differs, and so does which arm sits where. Editing the bodies will never turn
one into the other. The fix is always to reverse the condition in the source.

The choice goes the other way when the arms are ordinary statements that
continue into shared code afterwards. Then the `if` arm takes the fall-through
position, and the `else` arm becomes the target. The branch is the opposite of
the source condition, the same as for the single guarded statement two lessons
ago:

```asm
0        cmp       r0, r1
2        bge       8 ~>
4        add       r2, #1
6        b         10 ~>
8      ~>sub       r2, #1
10     ~>mov       r0, r2
12       bx        lr
```

The source says `if (a < b)` and the listing has `bge`. This time the `if` arm
comes first, at 4, because there is real code after the join for it to continue
into. So before you decide whether a branch matches the source condition or its
opposite, check whether its arms return or continue.

A third layout appears later in this chapter. It happens when one arm needs no
instructions because its value is already in `r0`. That arm becomes the target,
the other arm is skipped over, and the branch uses whichever condition selects
the empty arm. The reading rule still works. Only the layout changes.

Your target returns from both arms, and both arms need an instruction. The two
arms do the same kind of arithmetic in opposite directions. Read carefully which
register each one keeps.

## Your task

Write `func_08123520` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08123520(s32 a, s32 b) {
    if (a > b) return a - b;
    else return b - a;
}
```
