---
id: bitwise-merge-fields
title: "Merging Two Fields: rlwinm + rlwimi"
difficulty: 3
concepts:
  - bitwise
  - and
  - or
  - rlwinm
  - rlwimi
  - mwcc-idiom
symbol: merge_fields
hints:
  - Mask the two halves independently, then OR them together — the compiler may fuse those steps.
  - "`rlwimi rD, rA, sh, MB, ME` inserts bits from rA into rD in the range [MB,ME], leaving the rest of rD intact."
---

# Two masks, joined by OR — and an instruction you haven't seen yet

When C ANDs two values with complementary masks and ORs the results together,
MWCC often replaces the pair of `andi.` instructions with `rlwinm` + `rlwimi`.

Consider `combine_nibbles(a, b)`, which takes the low nibble of `a` and the
next nibble of `b` and puts them together:

```asm
mr      r0,r3
rlwinm  r3,r4,0,24,27
rlwimi  r3,r0,0,28,31
blr
```

Step by step:

- `mr r0, r3` copies `a` into `r0` for safekeeping (because `r3` is about to be
  overwritten).
- `rlwinm r3, r4, 0, 24, 27` rotates `r4` left by 0 (no rotation) and masks
  to PPC bits 24–27. In PPC notation bit 0 is the MSB, so bits 24–27 are the
  range `0x000000F0` — that is, `b & 0xF0`.
- `rlwimi r3, r0, 0, 28, 31` is **rotate-left-and-insert** — it takes bits
  28–31 of `r0` (the range `0x0000000F`, i.e. the low nibble of `a`) and
  *inserts* them into `r3` at positions 28–31, leaving the rest of `r3` alone.
  The net result is `(b & 0xF0) | (a & 0xF)`.

`rlwimi` is the key instruction: it merges a field from a source register into a
destination register without touching the bits outside the [MB, ME] range. In C
you'd write that as an AND on the source, an AND-and-complement on the
destination, and an OR — three operations reduced to one.

The target assembly uses the same `mr` / `rlwinm` / `rlwimi` pattern but with
different masks. Decode the [MB, ME] fields in each instruction to find which
byte-wide fields are being combined, and which argument contributes which field.

## Your task

Write `merge_fields`, taking two `int`s, to reproduce the assembly above.

<!-- starter -->
```c
int merge_fields(int a, int b) {
    return 0;
}
```

<!-- solution -->
```c
int merge_fields(int a, int b) {
    return (a & 0xFF) | (b & 0xFF00);
}
```
