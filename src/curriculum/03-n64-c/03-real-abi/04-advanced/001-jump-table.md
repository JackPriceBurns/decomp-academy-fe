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
  - "The `sltiu` immediate is the case count, and each case body is a `jr ra` with its return value in the slot. Read the constants off in order."
  - "Case numbering starts at 0. Body order in the assembly follows case order, so the first `jr ra` pair after the dispatcher is case 0."
---

# switch, dispatched by data

A `switch` with enough consecutive cases stops comparing and starts *looking
up*. Here's `cost(op)`, which maps operations 0–5 to their prices — with a
default of −1:

```asm
 0:  sltiu  at, a0, 6            # bounds: is op in 0..5?
 4:  beqz   at, 0x54             # no → default
 8:  addiu  v0, zero, -1         #   slot: default result, preloaded
 c:  sll    t6, a0, 2            # case × 4: an index into a table of words
10:  lui    at, %hi(.rodata)     # the table's address —
14:  addu   at, at, t6
18:  lw     t6, %lo(.rodata)(at) # — fetch THIS case's code address
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

The pieces worth naming:

- **`sltiu` is the whole bounds check.** Unsigned "less than 6" is false for
  every negative number too (as unsigned they're huge), so one instruction
  rejects both directions of out-of-range.
- **The table itself is data, not code.** It lives in the object's read-only
  data section — that's the `.rodata` the relocs point at — one word per
  case, each holding the address of that case's body. You never see the
  addresses in the diff; you see the *load* and the `jr` through `t6`.
- **`jr t6`** — the same "jump to register" that returns through `ra` works
  with any register. This is computed control flow: the case picks itself.
- **Each case body** is two instructions: `jr ra` with the return value
  built in the delay slot. The default's value rides the dispatcher's
  `beqz` slot, so it's already in `v0` if the bounds check fails.

Reading one of these is fast once you trust the layout: `sltiu` tells you how
many cases, the bodies come in case order, and the constants line up in the
delay slots. Recover each case's value, note the default, and write the
`switch` plainly — IDO rebuilds the table for you.

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
