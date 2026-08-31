---
id: 076994a7-d1cd-4499-b282-d0799a22870d
slug: adv-fallthrough
title: The Missing break
difficulty: 4
concepts:
  - switch
  - control-flow
  - fallthrough
  - fingerprints
symbol: func_801da650
hints:
  - "Follow each case's body to where it lands. One of them flows into an instruction that another case also executes — that's your fallthrough."
  - "A constant in the target can be the SUM of an initial value and one or more `+=` steps that the compiler folded. Un-fold it."
---

# Falling into the next case

Omit a `break` and control *falls through* into the next case's body — a C
feature that reads like a bug until you've matched one. The compiler makes it
concrete. Here's `fee(k)`: `f` starts at 1; case 0 sets it to 6; case 1 adds
10 **and falls through** into case 2, which adds 20:

```asm
 0:  beqz   a0, 0x24          # case 0?
 4:  addiu  v1, zero, 1       #   slot: f = 1 (the init rides here)
 8:  addiu  at, zero, 1
 c:  beq    a0, at, 0x2c      # case 1?
10:  addiu  at, zero, 2
14:  beql   a0, at, 0x34      # case 2 — likely form…
18:  addiu  v1, v1, 20        #   …slot runs only when taken: f += 20
1c:  b      0x38              # no case matched
20:  or     v0, v1, zero
24:  b      0x34              # case 0: jump to the exit…
28:  addiu  v1, zero, 6       #   …setting f = 6 on the way
2c:  addiu  v1, zero, 11      # case 1: f += 10, FOLDED to f = 11 (1+10)
30:  addiu  v1, v1, 20        # …then case 2's f += 20 happens too
34:  or     v0, v1, zero
38:  jr     ra
3c:  nop
```

Look hard at `0x2c`–`0x30`. Case 1's body doesn't end with a jump — it runs
straight into an `f += 20`, the same operation case 2 performs. That
*continuation into the next case's work* is fallthrough, spelled out in
instruction order.

Two fingerprints sharpen the read:

- **Constant folding hides the arithmetic.** `f` was 1, case 1 adds 10, and
  the compiler just writes 11. When a case's constant doesn't match the
  source constant you expect, check whether it's an accumulated total.
- **Reached-directly vs fallen-into can differ in shape**: case 2 entered by
  its own `beql` does the `+= 20` in an annulled slot; the same `+= 20`
  duplicated after case 1's body is plain. One statement, two homes.

The target is a three-case switch with one missing `break` and folded
constants of its own. Trace each entry path to the exit and tally what the
result register holds on each.

## Your task

Write `func_801da650` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_801da650(s32 t) {
    s32 x = 0;

    switch (t) {
    case 0:
        x += 4;
    case 1:
        x += 2;
        break;
    case 2:
        x = 9;
        break;
    }
    return x;
}
```
