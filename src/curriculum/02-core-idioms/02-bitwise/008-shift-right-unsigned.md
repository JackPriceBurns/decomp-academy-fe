---
id: bitwise-shift-right-unsigned
title: Logical Right Shift (Unsigned)
difficulty: 3
concepts:
  - bitwise
  - shifts
  - unsigned
  - srwi
symbol: lsr3
hints:
  - An unsigned right shift fills with zeros — the `srwi` mnemonic.
  - "`x >> 3` on a u32 compiles to `srwi r3, r3, 3`."
  - Keep the type `u32`; a signed type would change the instruction.
---

# `srwi` — shift right, fill with zeros

Right-shifting an **unsigned** value is a *logical* shift: bits move toward the
low end and the high end is filled with zeros. MWCC emits `rlwinm`, printed as
the extended mnemonic **`srwi`**. For example, shifting an unsigned value right
by 5:

```asm
srwi    r3,r3,5
blr
```

The **type drives this**. Because `x` is `u32`, the compiler knows the top bits
must come in as zero, so a plain masked rotate suffices — `srwi r3, r3, 5` is
really `rlwinm r3, r3, 27, 5, 31`. If `x` were signed, the high bits would
instead be filled with the sign bit, which needs a *different* instruction
entirely (the next lesson).

Read the immediate in the target `srwi` to find the shift amount, keep the type
`u32`, and the instruction follows.

## Your task

Write `lsr3` so it compiles to the `srwi` above.

<!-- starter -->
```c
u32 lsr3(u32 x) {
    return 0;
}
```

<!-- solution -->
```c
u32 lsr3(u32 x) {
    return x >> 3;
}
```
