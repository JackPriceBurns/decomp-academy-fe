---
id: 270d5b7d-262d-57ce-86d1-de68382b3067
slug: pointers-index-var
title: A Variable Index Needs Scaling Then Indexing
difficulty: 3
concepts:
  - loads
  - indexed-addressing
  - scaling
symbol: func_801c356c
hints:
  - A variable index is scaled at runtime, then used with an indexed load.
  - Expect `slwi r0, r4, 2` (i * 4) then `lwzx r3, r3, r0`.
---

# When the index is a register

A *constant* index folds into a displacement at compile time. A *variable* index
can't — the value isn't known until runtime. The compiler scales it first, then
uses the indexed load `lwzx rD, rA, rB`, which reads from `rA + rB` with no
displacement.

The scaling step is `slwi` — shift-left immediate — to multiply by element size.
Here's a function that indexes a `u16` array by a variable:

```c
typedef unsigned short u16;
u16 at_u16(u16* p, int i) {
    return p[i];
}
```

```asm
slwi  r0, r4, 1   # i * 2  (sizeof(u16))
lhzx  r3, r3, r0  # load halfword at p + byte_offset
blr
```

`sizeof(u16)` is 2, so the shift amount is 1 (shift-left by 1 = multiply by 2). The
indexed halfword load `lhzx` then uses the scaled byte offset in `r0`.

The shift amount tells you the element size: **shift amount → size as a power of
2**. Shift by 1 → 2-byte elements; shift by 2 → 4-byte elements. The instruction
mnemonic (`lhzx`, `lwzx`, `lbzx`, …) cross-checks the element size.

One note for reading real disassembly: `slwi rA, rB, n` is a simplified mnemonic for
`rlwinm rA, rB, n, 0, 31-n`. Tools like objdump or Ghidra sometimes print the
underlying `rlwinm` form; they are the same instruction.

## Your task

Write `func_801c356c` to match the target assembly above.

<!-- solution -->
```c
int func_801c356c(int* p, int i) {
    return p[i];
}
```
