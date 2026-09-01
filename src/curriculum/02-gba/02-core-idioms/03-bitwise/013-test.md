---
id: b7b1d40b-453c-4cca-8ee4-f8b30c114a37
slug: gba-bitwise-test
title: Testing a Single Bit
difficulty: 3
concepts:
  - bitwise
  - branches
  - register-allocation
symbol: func_081040f4
hints:
  - Only one of the three `mov`s before the compare builds a mask. The other
    two are shuffling the candidate results into position, and the branch
    decides which one survives.
  - Three arguments and an `s32` result. The first carries the flag bit; the
    other two are the values chosen between.
---

# and, cmp, branch

Thumb has a `tst` instruction that ands two registers and keeps only the flags,
and hand-written GBA assembly uses it constantly. agbcc never emits it. Every
bit test you will meet in compiler output is a real, value-producing `and` into
a scratch register followed by `cmp Rd, #0`:

```asm
0        mov       r1, #2
2        and       r1, r0
4        cmp       r1, #0
6        bne       12 ~>
8        mov       r0, #40
10       b         14 ~>
12     ~>mov       r0, #100
14     ~>bx        lr
```

Three instructions before the branch can even be taken: build the mask, apply
it, set the flags. The `and` burns a register, which is why bit tests show up in
the register allocation of the surrounding code in a way a flag-only `tst` never
would. Do not try to write C that produces `tst` — there is no spelling that
reaches it.

Bit 31 is the exception, and it is a large one:

```asm
0        cmp       r0, #0
2        blt       8 ~>
4        mov       r0, #20
6        b         10 ~>
8      ~>mov       r0, #10
10     ~>bx        lr
```

No mask, no `and`. A signed compare against zero already tells you the top bit,
so gcc drops the mask entirely and switches the branch to a signed condition.
Three different C spellings arrive here — testing against `0x80000000`, shifting
right by 31, or comparing a signed value against zero — and all of them match,
so pick whichever suits the surrounding code.

Every other bit pays full price. There is no cheap shortcut for bit 30: it
builds its mask and does the `and` like all the rest. And watch the branch
polarity, because it inverts between the two forms — the masked test jumps on
`beq`/`bne`, the sign test on `bge`/`blt`.

The target below tests a bit that is not bit 31, so the mask is there in front
of you. What it does with the result is the part to work out.

## Your task

Write `func_081040f4` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081040f4(u32 flags, s32 a, s32 b) {
    return (flags & 4) ? a : b;
}
```
