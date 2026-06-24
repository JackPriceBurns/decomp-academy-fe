---
id: pointers-index-var
title: A Variable Index Needs Scaling Then Indexing
difficulty: 3
concepts:
  - loads
  - indexed-addressing
  - scaling
symbol: at
hints:
  - A variable index is scaled at runtime, then used with an indexed load.
  - Expect `slwi r0, r4, 2` (i * 4) then `lwzx r3, r3, r0`.
---

# When the index is a register

A *constant* index folded into a displacement. A *variable* index can't — it
isn't known at compile time. The compiler must scale it at runtime, then use the
**indexed** load `lwzx rD, rA, rB`, which reads from `rA + rB` (two registers,
no displacement).

For an `int*`, the index is scaled by 4 with a shift-left-by-2 (`slwi`):

```asm
slwi r0, r4, 2    # i * 4  (sizeof(int))
lwzx r3, r3, r0   # load p[i]
blr
```

So `slwi` by 2 followed by `lwzx` is the signature of an `int*` indexed by a
variable. The shift amount tells you the element size: 2 → 4-byte elements.

One thing to recognize in the wild: `slwi rA, rB, n` is itself a simplified
mnemonic for `rlwinm rA, rB, n, 0, 31-n`. Disassemblers like objdump or Ghidra
often print the underlying `rlwinm` (here `rlwinm r0, r4, 2, 0, 29`) instead of
the friendlier `slwi r0, r4, 2` — they're the same shift.

## Your task

Write `at` to match the target assembly above.

<!-- starter -->
```c
int at(int* p, int i) {
    return 0;
}
```

<!-- solution -->
```c
int at(int* p, int i) {
    return p[i];
}
```
