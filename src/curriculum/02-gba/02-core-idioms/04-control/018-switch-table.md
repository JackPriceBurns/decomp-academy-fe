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
  - "`cmp r0, #4` bounds five case values, and the `sub r0, #1` in front of it
    says where they start. Table slot plus that bias gives you the case label."
  - The `.word` rows are data the compiler emitted. You write cases; the table
    appears on its own.
  - Two `s32` arguments and an `s32` result. Five consecutive cases beginning at
    one, each a small operation on the second argument, and a default of zero.
---

# Five cases and the shape changes completely

The threshold is exact and worth memorising. Four dense cases give the compare
tree from the previous lesson. Five give a jump table, and nothing about the
function looks the same afterwards:

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

Addresses 0 to 12 are a fixed seven-instruction preamble, and it is worth
learning as one unit. Bound the selector against the number of cases minus one;
send anything above it to the default with `bhi`; multiply by four to turn a
case number into a word offset; load the table's base address; add; load the
entry; jump to it.

`bhi` is unsigned, and that single choice handles negative selectors for free —
a value like -1 reads as an enormous unsigned number and fails the same compare
that catches values above the range. One branch covers both ends.

There are two levels of indirection and it is easy to conflate them. The `.word`
at 16 is a literal-pool entry holding the *address of the table*, which is 20.
The five words from 20 onwards are the table proper, and each holds the address
of a case body. The dispatch is `mov pc, r0` rather than `bx r0`, because Thumb
`mov pc` does not change instruction set — which is why the table entries carry
no Thumb bit on their addresses. The `.hword 0` at 14 is alignment padding,
present only because the pool would otherwise land off a four-byte boundary. All
of those rows are data. You write cases; the compiler emits the table.

When the cases do not start at zero, a bias instruction appears in front of the
bound check — `sub` for a range starting high, `add` for one starting negative —
and the arithmetic to recover the labels is table slot plus bias. Holes are not
compressed: a gap in the case values becomes a table entry pointing at the
default.

Your target has the bias, and its bodies compute rather than loading constants.

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
