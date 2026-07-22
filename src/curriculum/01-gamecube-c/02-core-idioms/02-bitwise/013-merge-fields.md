---
id: 8db18a7e-0b10-5772-b13f-7baa49826191
slug: bitwise-merge-fields
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

# Two masks, joined by OR, plus an instruction you haven't met yet

You AND two values against masks that don't overlap, OR the pieces back
together, and you've merged two fields. Write that in C and MWCC will frequently
skip the obvious pair of `andi.` instructions, reaching for `rlwinm` + `rlwimi`
instead.

Here's `combine_nibbles(a, b)`. It grabs the low nibble of `a` and the next
nibble up from `b`, then sets them side by side.

```asm
mr      r0,r3
rlwinm  r3,r4,0,24,27
rlwimi  r3,r0,0,28,31
blr
```

Read it top to bottom. The `mr r0, r3` just stashes `a` over in `r0`, because
`r3` is about to get clobbered and we still need `a` later. Then
`rlwinm r3, r4, 0, 24, 27` rotates `r4` by zero (no rotation at all) and masks
it down to PPC bits 24–27. Bit 0 is the MSB in PPC land, so those bits sit at
the range `0x000000F0`, which is exactly `b & 0xF0`.

The last line is the one to learn. `rlwimi r3, r0, 0, 28, 31` is
**rotate-left-and-insert**: it lifts bits 28–31 of `r0` (the range `0x0000000F`,
the low nibble of `a`) and drops them into `r3` at positions 28–31, leaving
every other bit of `r3` exactly as it was. So `r3` ends up holding
`(b & 0xF0) | (a & 0xF)`.

That insert is the whole trick. `rlwimi` splices a field from one register into
another without disturbing anything outside the [MB, ME] range. Doing the same
in C is fiddly, an AND on the source, an AND-with-complement on the destination,
then an OR, and the compiler folds all three into one instruction.

Your target runs the same `mr` / `rlwinm` / `rlwimi` dance, just with different
masks. Pull the [MB, ME] fields out of each instruction to see which byte-wide
fields meet up, and which argument supplies which one.

## Your task

Write `merge_fields` to reproduce the assembly above.

<!-- solution -->
```c
int merge_fields(int a, int b) {
    return (a & 0xFF) | (b & 0xFF00);
}
```
