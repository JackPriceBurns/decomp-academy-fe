---
id: 613b4c1f-e15f-4f76-9663-606931c84eb5
slug: arithmetic-unsigned-divide
title: "divu: Signedness Shows in the Mnemonic"
difficulty: 2
concepts:
  - arithmetic
  - divide
  - types
symbol: func_8004ed30
hints:
  - "`divu` means the C operates on unsigned values — declare accordingly."
  - "Check whether the target fetches LO or HI after the divide; that's the operator."
---

# One letter of type information

Division is the first place the instruction stream openly tells you a C type.
Signed division is `div`; unsigned division is `divu` — a *real* unsigned
this time, not the "don't trap" suffix. Here's `udivTen(x)`, dividing a `u32`
by 10:

```asm
addiu at, zero, 10
divu  zero, a0, at   # LO = x / 10,  HI = x % 10  (unsigned)
mflo  v0
nop
nop
jr    ra
nop
```

Everything else about the ritual is unchanged — divisor into `at`, results
into HI/LO, `mflo`/`mfhi` to fetch, the two cautious `nop`s. Only the mnemonic
moved.

This matters because *you* choose the types when you write the C, and the
compiler chooses the instruction from your types. See `divu` in a target and
declare the operands `u32`, or you'll produce a `div` and one stubborn diff
line. It's your first taste of **type detective work** — recovering
declarations, not just expressions, from the instructions. A whole chapter
ahead lives on this idea.

`mfhi` works after `divu` exactly as it does after `div`. The target below
needs both facts at once: read the mnemonic for the types, read the fetch for
the operator.

## Your task

Write `func_8004ed30` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_8004ed30(u32 a) {
    return a % 9;
}
```
