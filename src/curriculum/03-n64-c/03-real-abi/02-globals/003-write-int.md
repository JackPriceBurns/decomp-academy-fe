---
id: 8dd0543b-ea41-477e-830f-afbf4d799ccb
slug: globals-write-int
title: Writing a Global
difficulty: 1
concepts:
  - globals
  - hi-lo
  - stores
symbol: func_80374150
hints:
  - "Look at which register the `sw` stores. It isn't an argument this time."
  - "Storing the always-zero register is how the compiler writes one particular constant."
---

# Same pair, store instead of load

Writing a global uses the same pair as reading one. `lui` builds the upper half
of the address, and the `%lo` half goes in a **store** instead of a load. Here
is `stashScore(pts)`, which assigns its argument to the global `gScore`:

```asm
lui   at, %hi(gScore)      # upper half of gScore's address
sw    a0, %lo(gScore)(at)  # store the argument into it
jr    ra
nop
```

There is one difference from the read. The address goes into `at`, the
assembler temporary, instead of `v0`. This function has no return value, so the
compiler uses its designated scratch register. The value being written is the
*first* operand of the `sw`. The `%lo` pair gives *where* it goes. Read every
global store as "**what** goes into **which name**".

The target also writes one global. Before you assume the first `sw` operand is
an argument, check it carefully. You have already met one register whose value
never changes.

## Your task

`extern s32 gCombo;` is declared for you. Write `func_80374150` to reproduce the
target assembly.

<!-- solution -->
```c
void func_80374150(void) {
    gCombo = 0;
}
```

<!-- context -->
```c
extern s32 gCombo;
```
