---
id: 182c6ab4-6588-4ef6-a542-d057cca8aa40
slug: gba-control-switch-table
title: The Jump Table Appears
difficulty: 4
concepts:
  - branches
  - control-flow
  - constants
symbol: func_081664ec
hints:
  - "`cmp r0, #4` limits the selector to five case values, and the `sub r0, #1`
    before it shows where they start. Add that bias to the table slot to get the
    case label."
  - The `.word` rows are data that the compiler emits. You write the cases, and
    the table appears by itself.
  - There are two `s32` arguments and an `s32` result. There are five
    consecutive cases starting at one, each a small operation on the second
    argument, and a default of zero.
---

# At five cases, the code changes completely

The threshold is exact, and you should memorise it. Four dense cases give the
compare tree from the previous lesson. Five give a jump table, and the whole
function looks different:

```asm
0        cmp       r0, #4
2        bhi       60 ~>
4        lsl       r0, #2
6        ldr       r1, [pc, #8] (->16)
8        add       r0, r1
10       ldr       r0, [r0, #0]
12       mov       pc, r0
14       .hword    0
16       .word     20 ~>
20     ~>.word     40 ~>
24       .word     44 ~>
28       .word     48 ~>
32       .word     52 ~>
36       .word     56 ~>
40     ~>mov       r0, #3
42       b         62 ~>
44     ~>mov       r0, #11
46       b         62 ~>
48     ~>mov       r0, #24
50       b         62 ~>
52     ~>mov       r0, #8
54       b         62 ~>
56     ~>mov       r0, #40
58       b         62 ~>
60     ~>mov       r0, #0
62     ~>bx        lr
```

Addresses 0 to 12 are a fixed preamble of seven instructions. Learn it as one
unit. It compares the selector against the number of cases minus one, and
`bhi` sends anything above that to the default. Then it multiplies by four to
turn a case number into a word offset, loads the table's base address, and adds
the two. Finally it loads the table entry and jumps to it.

`bhi` is unsigned, so it also handles negative selectors at no extra cost. A
value like -1 reads as a very large unsigned number, so it fails the same
compare that catches values above the range. One branch covers both ends.

There are two levels of indirection, and you should not confuse them. The
`.word` at 16 is a literal pool entry that holds the *address of the table*,
which is 20. The five words from 20 onwards are the table itself, and each one
holds the address of a case body. The jump is `mov pc, r0` instead of `bx r0`,
because a Thumb `mov pc` does not change the instruction set. That is why the
table entries have no Thumb bit set in their addresses. The `.hword 0` at 14 is
alignment padding. It is there only because the pool would otherwise not sit on
a four-byte boundary. All of those rows are data. You write the cases, and the
compiler emits the table.

When the cases do not start at zero, a bias instruction appears before the
bound check. It is a `sub` for a range that starts above zero, and an `add` for
one that starts below zero. To get the case labels back, add the bias to the
table slot. Gaps are not removed: a missing case value becomes a table entry
that points at the default.

Your target has the bias, and its bodies compute values instead of loading
constants.

## Your task

Write `func_081664ec` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081664ec(s32 kind, s32 v) {
    switch (kind) {
        case 1: return v + 4;
        case 2: return v - 4;
        case 3: return v * 3;
        case 4: return -v;
        case 5: return v;
    }
    return 0;
}
```
