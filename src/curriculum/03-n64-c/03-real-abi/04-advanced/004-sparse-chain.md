---
id: 8839874e-807d-4bb5-a678-3dd270965eb7
slug: adv-sparse-chain
title: "Sparse Cases: The Compare Chain"
difficulty: 3
concepts:
  - switch
  - control-flow
  - compare-chain
symbol: func_8020e61c
hints:
  - "Each `addiu at, zero, N` names a case; the `beq` beside it jumps to that case's body. Three cases, three return values, one default."
  - "It's still a `switch` in C — the compiler chose the chain, not you."
---

# When a table would be mostly holes

Jump tables pay one word per possible value between the lowest and highest
case. Cases 2, 19, and 40 would mean a 39-entry table with 3 real entries —
so IDO doesn't build one. It compares, case by case. Here's `rank(code)`:

```asm
 0:  addiu  at, zero, 2      # case 2?
 4:  beq    a0, at, 0x24
 8:  addiu  at, zero, 19     #   slot: already loading the NEXT case
 c:  beq    a0, at, 0x2c     # case 19?
10:  addiu  at, zero, 40
14:  beq    a0, at, 0x34     # case 40?
18:  or     v0, zero, zero   # nothing matched — default result
1c:  b      0x3c
20:  nop
24:  jr     ra               # case 2:
28:  addiu  v0, zero, 1
2c:  jr     ra               # case 19:
30:  addiu  v0, zero, 2
34:  jr     ra               # case 40:
38:  addiu  v0, zero, 3
3c:  jr     ra
40:  nop
```

The rhythm: load a case constant into `at`, `beq` against it, and — the
scheduler's touch — each branch's delay slot *already loads the next case's
constant*. The chain reads like dominoes. Fall off the end and you're in the
default; each matched case has its own `jr ra` body, return value in the
slot, exactly like a table's bodies.

The important judgment call: **this is still a `switch` in your C.** Don't
write an `if`/`else if` ladder just because the assembly compares — for a
handful of scattered constants against one value, IDO compiles `switch` into
exactly this chain. (It happens to compile the equivalent `if` ladder the
same way, but the `switch` says what the code *means*.) Dense cases become a
table, sparse become a chain; the C stays the same construct either way.

The target chains three scattered case values of its own. Read them out of
the `at` loads, match each to its return value, and note what the default
hands back.

## Your task

Write `func_8020e61c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8020e61c(s32 id) {
    switch (id) {
    case 4:
        return 100;
    case 27:
        return 200;
    case 250:
        return 300;
    }
    return -1;
}
```
