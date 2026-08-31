---
id: 7dfce65d-8060-4c3f-a838-ff95f41e2338
slug: bitwise-pack-halves
title: Packing Two Values Into One
difficulty: 3
concepts:
  - bitwise
  - shifts
  - masks
symbol: func_8037f398
hints:
  - "Three jobs, three instructions — shift one argument into position, clip the other to its slot, OR them together. Read the shift amount and the mask width off the target."
  - "The mask immediate tells you how wide the low field is; the shift amount tells you where the high field starts. They should agree."
---

# Two values, one register

Consoles are starved for memory, so game code loves packing several small
values into one 32-bit word. The write half of that habit is a three-step
dance: *shift* one value up to its slot, *mask* the other down to size, *OR*
them together. Here's a byte-sized version — two values packed as
`(hi << 8) | (lo & 0xff)`:

```asm
sll  t6, a0, 8       # first value, moved up past the low byte
andi t7, a1, 0xff    # second value, clipped to exactly one byte
or   v0, t6, t7      # snap the two halves together
jr   ra
nop
```

Each instruction is one job:

- **`sll` positions.** The shift amount is where the upper field begins.
- **`andi` clips.** The mask guarantees the low value can't bleed into the
  upper field's bits — even if the caller passed something too big.
- **`or` merges.** The two pieces occupy disjoint bits, so OR is a pure
  paste, losing nothing.

Reading one of these backwards: the `sll` amount and the `andi` mask are the
two constants your C needs, and they normally agree — a shift by 8 pairs with
an 8-bit mask, a shift by 16 with a 16-bit mask. If they *don't* agree,
believe the assembly and write what it says.

The target packs wider fields. Read its two constants and write the dance in
C — shift, mask, OR.

## Your task

Write `func_8037f398` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_8037f398(u32 hi, u32 lo) {
    return (hi << 16) | (lo & 0xffff);
}
```
