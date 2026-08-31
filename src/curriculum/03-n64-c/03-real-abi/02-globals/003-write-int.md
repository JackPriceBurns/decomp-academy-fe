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

Writing a global is the mirror image of reading one: `lui` builds the upper
half of the address, and the `%lo` half rides on a **store**. Here's
`stashScore(pts)`, which assigns its argument to the global `gScore`:

```asm
lui   at, %hi(gScore)      # upper half of gScore's address
sw    a0, %lo(gScore)(at)  # store the argument into it
jr    ra
nop
```

One difference from the read: the address lands in `at`, the assembler
temporary, not `v0` — there's no return value here, so the compiler grabs its
designated scratch register. The value being written sits in the *first*
operand of the `sw`; the *where* is the `%lo` pair. Read every global store as
"**what** goes into **which name**".

The target also writes one global — but check the first `sw` operand carefully
before assuming it's an argument. You know a register that always holds
something.

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
