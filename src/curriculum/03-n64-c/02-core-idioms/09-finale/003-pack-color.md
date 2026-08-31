---
id: 9bfe03ff-4227-44c9-8fb4-899ea2b79e97
slug: finale-pack-color
title: "Four Bytes, One Word"
difficulty: 3
concepts:
  - bitwise
  - pointers
  - types
  - capstone
symbol: func_802ff80c
hints:
  - "Four `lbu`s at offsets 0-3, three shift amounts. Map each byte to its lane by pairing every `sll` with the load feeding it."
  - "Write it as one `return` OR-ing four shifted array reads, most significant first. The scheduler's shuffle regenerates on its own."
---

# Packing lanes

Graphics code lives on this move: gather narrow values, shift each
into its lane, OR the lanes together. Here's `packHalves`, which
fuses two `u16`s from an array into one word:

```c
u32 packHalves(u16 *p) {
    return (p[0] << 16) | p[1];
}
```

```asm
 0:  lhu   t7, 0(a0)      # p[0]
 4:  lhu   t6, 2(a0)      # p[1]
 8:  sll   t8, t7, 16     # p[0] into the top lane
 c:  or    v0, t6, t8     # fuse
10:  jr    ra
14:  nop
```

Small enough to read at a glance — and every piece annotates itself:
`lhu` (not `lh`!) because packing wants raw bits, not sign; the
shift amount *is* the lane position; the un-shifted operand lands in
the low lane.

At four lanes the idiom stays identical but the scheduler gets
playful: loads bunch up front, and the OR-tree combines in whatever
order the pipeline liked — you may see the *last* byte fused with
the *first* before the middle ones join. Don't reverse-engineer the
shuffle into weird C. Identify each load's offset, follow it through
its `sll` to learn its lane, and write the expression in plain
descending-lane order; the compiler re-derives the exact shuffle
from that.

The target packs a four-byte color — `c[0]` ending up most
significant. Four loads, three shifts, three ORs, one `return`.

## Your task

Write `func_802ff80c` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_802ff80c(u8 *c) {
    return (c[0] << 24) | (c[1] << 16) | (c[2] << 8) | c[3];
}
```
