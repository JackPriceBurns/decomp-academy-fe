---
id: 4e573e44-249e-5834-bb8a-f555b48f8269
slug: bitwise-test-bit
title: Testing Whether a Bit Is Set
difficulty: 2
concepts:
  - bitwise
  - and
  - rlwinm
  - masks
symbol: func_80395cf8
hints:
  - Isolate the bit by AND-ing with its single-bit mask.
  - A contiguous one-bit mask like 0x80 compiles to `rlwinm`, not `andi.`.
  - Expect `rlwinm r3, r3, 0, 24, 24` — mask `[24,24]` is exactly bit 0x80.
---

# Isolating one bit

To **test** a flag you AND the value with that single bit and return the result
— zero if clear, the bit's value if set. A single contiguous bit is all
`rlwinm` needs. Isolating bit 4 (the `0x10` bit) produces:

```asm
rlwinm  r3,r3,0,27,27
blr
```

The rotate is 0 and the mask is one bit wide: `[27,27]` selects PPC bit 27,
which corresponds to `0x10`. (PPC counts bits from the MSB: bit 0 is
`0x80000000`, bit 27 is `0x10`, bit 31 is `0x1`.) This is the mirror image of
the AND-mask lesson — a *contiguous* mask, even a one-bit one, goes through
`rlwinm`, while a *scattered* mask like `0x12` went through `andi.`.
Contiguity, not size, steers AND between the two instructions.

For your target, read the `[MB,ME]` field to find which PPC bit is being
isolated, convert that back to the hex value, and express it as an AND in C.

## Your task

Write `func_80395cf8` to reproduce the assembly above.

<!-- solution -->
```c
u32 func_80395cf8(u32 x) {
    return x & 0x80;
}
```
