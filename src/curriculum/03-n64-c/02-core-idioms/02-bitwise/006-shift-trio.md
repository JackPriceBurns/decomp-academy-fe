---
id: 667a7052-3c9b-4234-94ca-5bc6f4c88c65
slug: bitwise-shift-trio
title: "sll, srl, sra: The Shift Family"
difficulty: 2
concepts:
  - shifts
  - types
symbol: func_8019e9c0
hints:
  - "Two right shifts with different mnemonics on two different arguments — the mnemonics are telling you the two parameter types differ."
  - "Both shift amounts are equal; only the signedness distinguishes the halves of the sum."
---

# Three shifts, two questions

You've met all three shift instructions scattered across arithmetic lessons.
Time to line them up as what they are — a family answering two questions:
which direction, and what fills the vacated bits?

- **`sll`** — left, zeros fill from the bottom. C's `<<`.
- **`srl`** — right, zeros fill from the top. C's `>>` on **unsigned** values.
- **`sra`** — right, *copies of the sign bit* fill from the top. C's `>>` on
  **signed** values.

Left shifting has one C spelling, so `sll` is unambiguous. But `>>` in C
splits into two instructions depending on the operand's type, and that makes
right shifts a *type oracle*, the same way `div`/`divu` was. Watch the same
shift compiled twice — first on a `u32`, then on an `s32`:

```asm
srl  v0, a0, 6     # u32 x >> 6 — zeros pour in from the top
```

```asm
sra  v0, a0, 6     # s32 y >> 6 — the sign bit smears down
```

Identical C text, different instruction — the declaration alone chose the
mnemonic. Decoding runs the oracle backwards: `srl` in the target forces the
shifted value to be unsigned in your C, `sra` forces it signed. Get it wrong
and the diff shows one stubborn mnemonic mismatch on an otherwise perfect
line — now you know exactly what that smells like, and the fix is in the
declaration, not the expression.

The target below shifts *both* of its arguments and adds the results. Let
each mnemonic pick each parameter's type.

## Your task

Write `func_8019e9c0`, declaring each shifted value with the type its shift
demands, to reproduce the target assembly.

<!-- solution -->
```c
u32 func_8019e9c0(s32 a, u32 b) {
    return (a >> 3) + (b >> 3);
}
```
