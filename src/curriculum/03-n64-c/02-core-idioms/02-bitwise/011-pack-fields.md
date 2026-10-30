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
  - "There are three jobs and three instructions. Shift one argument into position, clip the other to fit its slot, then OR them together. Read the shift amount and the mask width from the target."
  - "The mask immediate tells you how wide the low field is. The shift amount tells you where the high field starts. The two should agree."
---

# Two values, one register

Consoles have very little memory, so game code often packs several small
values into one 32-bit word. Writing a packed word takes three steps: *shift*
one value up to its slot, *mask* the other down to its size, and *OR* them
together. Here is a version with byte-sized fields, packing two values as
`(hi << 8) | (lo & 0xff)`:

```asm
sll  t6, a0, 8       # first value, moved up past the low byte
andi t7, a1, 0xff    # second value, clipped to exactly one byte
or   v0, t6, t7      # combine the two halves
jr   ra
nop
```

Each instruction does one job:

- **`sll` positions.** The shift amount is the bit where the upper field
  begins.
- **`andi` clips.** The mask makes sure the low value can't spill into the
  upper field's bits, even if the caller passed a value that is too big.
- **`or` merges.** The two pieces use separate bits, so OR combines them
  without losing anything.

When you decode one of these, the `sll` amount and the `andi` mask are the two
constants your C needs. They normally agree: a shift by 8 goes with an 8-bit
mask, and a shift by 16 goes with a 16-bit mask. If they *don't* agree, trust
the assembly and write what it says.

The target packs wider fields. Read its two constants and write the three
steps in C: shift, mask, OR.

## Your task

Write `func_8037f398` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_8037f398(u32 hi, u32 lo) {
    return (hi << 16) | (lo & 0xffff);
}
```
