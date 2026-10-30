---
id: b0d22cb1-059b-4dca-95f3-62ba00d46fe2
slug: adv-jump-table
title: The Jump Table
difficulty: 3
concepts:
  - switch
  - jump-table
  - control-flow
symbol: func_800348b0
hints:
  - "The `sltiu` immediate is the number of cases. Each case body is a `jr ra` with its return value in the delay slot. Read the constants in order."
  - "Case numbering starts at 0. The bodies in the assembly come in case order, so the first `jr ra` pair after the dispatcher is case 0."
---

# A switch that jumps through a table

When a `switch` has enough consecutive cases, the compiler stops comparing the
value against each case. Instead, it *looks up* where to go in a table. Here is
`cost(op)`, which maps operations 0 to 5 to their prices, with a default of
−1:

```asm
 0:  sltiu  at, a0, 6            # bounds: is op in 0..5?
 4:  beqz   at, 0x54             # no → default
 8:  addiu  v0, zero, -1         #   slot: default result, preloaded
 c:  sll    t6, a0, 2            # case × 4: an index into a table of words
10:  lui    at, %hi(.rodata)     # the table's address,
14:  addu   at, at, t6
18:  lw     t6, %lo(.rodata)(at) # then load this case's code address
1c:  jr     t6                   # and jump to it
20:  nop
24:  jr     ra                   # case 0:
28:  addiu  v0, zero, 2
2c:  jr     ra                   # case 1:
30:  addiu  v0, zero, 6
34:  jr     ra                   # case 2:
38:  addiu  v0, zero, 3
3c:  jr     ra                   # case 3:
40:  addiu  v0, zero, 30
44:  jr     ra                   # case 4:
48:  addiu  v0, zero, 11
4c:  jr     ra                   # case 5:
50:  addiu  v0, zero, 8
54:  jr     ra                   # out-of-range lands here, v0 still -1
58:  nop
```

The important parts:

- **`sltiu` does the whole bounds check.** It tests unsigned "less than 6".
  A negative number read as unsigned is very large, so the test is false for
  negative numbers too. One instruction rejects values that are too small and
  values that are too large.
- **The table is stored as data.** It lives in the object's read-only data
  section, which is the `.rodata` that the relocations point at. It holds one
  word per case, and each word is the address of that case's body. The diff
  never shows these addresses. You only see the *load* and the `jr` through
  `t6`.
- **`jr t6` jumps to the address in `t6`.** It is the same "jump to register"
  instruction that returns through `ra`, and it works with any register. This
  is computed control flow: the case value decides where the code goes.
- **Each case body is two instructions:** a `jr ra`, with the return value
  built in its delay slot. The default value is set in the delay slot of the
  dispatcher's `beqz`, so it is already in `v0` if the bounds check fails.

These functions are quick to read once you know the layout. The `sltiu` tells
you how many cases there are. The bodies come in case order, and each
constant sits in a delay slot. Recover each case's value, note the default,
and write a plain `switch`. IDO builds the table again for you.

## Your task

Write `func_800348b0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_800348b0(s32 n) {
    switch (n) {
    case 0:
        return 7;
    case 1:
        return 3;
    case 2:
        return 12;
    case 3:
        return 1;
    case 4:
        return 9;
    case 5:
        return 28;
    case 6:
        return 4;
    case 7:
        return 15;
    }
    return 0;
}
```
