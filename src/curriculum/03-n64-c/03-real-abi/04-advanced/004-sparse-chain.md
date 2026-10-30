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
  - "Each `addiu at, zero, N` gives a case value, and the `beq` next to it jumps to that case's body. There are three cases, three return values and one default."
  - "It is still a `switch` in C. The compiler chose the chain on its own."
---

# When a table would be mostly empty

A jump table needs one word for every possible value between the lowest and
the highest case. Cases 2, 19, and 40 would need a 39-entry table with only 3
real entries, so IDO does not build one. Instead, it compares the value
against each case in turn. Here is `rank(code)`:

```asm
 0:  addiu  at, zero, 2      # case 2?
 4:  beq    a0, at, 0x24
 8:  addiu  at, zero, 19     #   slot: already loading the NEXT case
 c:  beq    a0, at, 0x2c     # case 19?
10:  addiu  at, zero, 40
14:  beq    a0, at, 0x34     # case 40?
18:  or     v0, zero, zero   # nothing matched: default result
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

The pattern repeats: load a case constant into `at`, then `beq` against it.
The scheduler also puts the load of *the next case's constant* in each
branch's delay slot. If no case matches, the code reaches the end of the
chain and runs the default. Each matched case has its own `jr ra` body with
the return value in the delay slot, exactly like the bodies of a jump table.

The important decision: **this is still a `switch` in your C.** Do not write
an `if`/`else if` ladder just because the assembly compares. When a few
scattered constants are tested against one value, IDO compiles a `switch`
into exactly this chain. (It compiles the matching `if` ladder the same way,
but the `switch` shows what the code *means*.) Dense cases become a table and
sparse cases become a chain. In both cases the C uses a `switch`.

The target has a chain of three scattered case values of its own. Read them
from the `at` loads, match each one to its return value, and note what the
default returns.

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
