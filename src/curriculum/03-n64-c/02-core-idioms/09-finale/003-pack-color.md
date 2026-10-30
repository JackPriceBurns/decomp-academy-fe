---
id: 9bfe03ff-4227-44c9-8fb4-899ea2b79e97
slug: finale-pack-color
title: "Packing Four Bytes into a Word"
difficulty: 3
concepts:
  - bitwise
  - pointers
  - types
  - capstone
symbol: func_802ff80c
hints:
  - "There are four `lbu`s at offsets 0-3, and three shift amounts. To find each byte's lane, pair every `sll` with the load that feeds it."
  - "Write it as one `return` that ORs together four shifted array reads, most significant first. The scheduler will produce the same shuffled order by itself."
---

# Packing values into lanes

Graphics code uses this pattern all the time. It loads narrow values,
shifts each one into its lane (its bit position in the word), and ORs
the lanes together. Here is `packHalves`, which combines two `u16`s from
an array into one word:

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

This is short enough to read at a glance, and each piece tells you what
it is for:

- `lhu` is used instead of `lh` because packing needs the raw bits,
  with no sign extension.
- The shift amount *is* the lane position.
- The operand that is not shifted ends up in the low lane.

With four lanes the idiom is the same, but the scheduler reorders more.
The loads are grouped at the start, and the ORs combine the values in
whatever order suits the pipeline. You may see the *last* byte combined
with the *first* before the middle bytes are added. Don't try to copy
that order into unusual C. Find each load's offset, follow it through
its `sll` to find its lane, and write the expression in plain order,
from the highest lane down. The compiler produces the same shuffled
order from that.

The target packs a four-byte color, with `c[0]` as the most significant
byte. Expect four loads, three shifts, three ORs and one `return`.

## Your task

Write `func_802ff80c` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_802ff80c(u8 *c) {
    return (c[0] << 24) | (c[1] << 16) | (c[2] << 8) | c[3];
}
```
