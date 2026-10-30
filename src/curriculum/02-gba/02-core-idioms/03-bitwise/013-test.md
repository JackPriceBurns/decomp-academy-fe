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
    two move the possible results into position, and the branch decides which
    one is kept.
  - The function takes three arguments and returns an `s32`. The first argument
    holds the flag bit. The other two are the values to choose between.
---

# and, cmp, branch

Thumb has a `tst` instruction. It ands two registers and keeps only the flags,
and hand-written GBA assembly uses it all the time. agbcc never emits it. Every
bit test you will see in compiler output is a real `and`, which writes a value
into a scratch register, followed by `cmp Rd, #0`:

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

Three instructions run before the branch can be taken: build the mask, apply it,
and set the flags. The `and` uses up a register. So bit tests affect the
register allocation of the surrounding code, which a flags-only `tst` would not
do. Do not try to write C that produces `tst`, because no way of writing it gets
there.

Bit 31 is an important exception:

```asm
0        cmp       r0, #0
2        blt       8 ~>
4        mov       r0, #20
6        b         10 ~>
8      ~>mov       r0, #10
10     ~>bx        lr
```

There is no mask and no `and`. A signed compare against zero already tells you
the top bit, so gcc drops the mask completely and uses a signed branch condition
instead. Three different ways of writing the C compile to this: testing against
`0x80000000`, shifting right by 31, or comparing a signed value against zero.
All of them match, so choose whichever fits the surrounding code.

Every other bit pays the full cost. Bit 30 has no cheap shortcut: it builds its
mask and does the `and` like all the rest. Also check the branch condition,
because it flips between the two forms. The masked test branches on
`beq`/`bne`, and the sign test branches on `bge`/`blt`.

The target below tests a bit other than bit 31, so the mask is there in the
listing. The part to work out is what it does with the result.

## Your task

Write `func_081040f4` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081040f4(u32 flags, s32 a, s32 b) {
    return (flags & 4) ? a : b;
}
```
