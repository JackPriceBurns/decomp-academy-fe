---
id: bitwise-test-bit
title: Testing Whether a Bit Is Set
difficulty: 2
concepts:
  - bitwise
  - and
  - rlwinm
  - masks
symbol: test_bit
hints:
  - Isolate the bit by AND-ing with its single-bit mask.
  - A contiguous one-bit mask like 0x80 compiles to `rlwinm`, not `andi.`.
  - Expect `rlwinm r3, r3, 0, 24, 24` — mask `[24,24]` is exactly bit 0x80.
---

# Isolating one bit

To **test** a flag you AND the value with that single bit and return the result
(zero if clear, the bit's value if set). The mask `0x80` is a single contiguous
bit, and MWCC isolates it with a single **`rlwinm`**:

```asm
rlwinm  r3, r3, 0, 24, 24    # x & 0x80
blr
```

Here the rotate is again 0 and the mask is exactly **one** bit wide: `[24,24]`
selects bit 24, which is `0x80`. (PPC counts bits from the MSB: bit 0 is
`0x80000000`, bit 24 is `0x80`, bit 31 is `0x1` — so the value `0x80` lands at
bit number 24.) This is the mirror image of the AND-mask lesson — a *contiguous*
mask (even a one-bit one) goes through `rlwinm`, while a *scattered* mask like
`0x12` went through `andi.`. Contiguity, not size, is what steers AND between the
two instructions.

## Your task

Write `test_bit` to reproduce the assembly above.

<!-- starter -->
```c
u32 test_bit(u32 x) {
    return 0;
}
```

<!-- solution -->
```c
u32 test_bit(u32 x) {
    return x & 0x80;
}
```
