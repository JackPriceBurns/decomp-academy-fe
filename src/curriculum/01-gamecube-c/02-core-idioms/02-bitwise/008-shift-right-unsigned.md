---
id: dec628aa-7429-5d0e-8db1-6ba631180f67
slug: bitwise-shift-right-unsigned
title: Logical Right Shift (Unsigned)
difficulty: 3
concepts:
  - bitwise
  - shifts
  - unsigned
  - srwi
symbol: shiftRightU
hints:
  - An unsigned right shift fills with zeros — the `srwi` mnemonic.
  - "`x >> 3` on a u32 compiles to `srwi r3, r3, 3`."
  - Keep the type `u32`; a signed type would change the instruction.
---

# `srwi` — shift right, fill with zeros

Shift an *unsigned* value rightward and you get a *logical* shift. The bits slide
toward the low end and zeros pour in to fill the gap up top. MWCC handles it with
`rlwinm`, which prints as the extended mnemonic `srwi`. Here's an unsigned value
shifted right by 5:

```asm
srwi    r3,r3,5
blr
```

The type is doing the work here. Since `x` is `u32`, the compiler knows fresh
zeros belong in the top bits, and a single masked rotate covers that. `srwi r3,
r3, 5` is `rlwinm r3, r3, 27, 5, 31` underneath. Make `x` signed and the story
changes; the vacated bits would copy the sign bit, which calls for a wholly
different instruction, the subject of the next lesson.

Read the shift amount off the target `srwi`, hold the type at `u32`, and the same
instruction comes out.

## Your task

Write `shiftRightU` so it compiles to the `srwi` above.

<!-- solution -->
```c
u32 shiftRightU(u32 x) {
    return x >> 3;
}
```
