---
id: 927840c3-eea7-52ff-bee5-d6f13b222fcb
slug: bitwise-clear-flag
title: "Clearing a Bit: The rlwinm Surprise"
difficulty: 2
concepts:
  - bitwise
  - and
  - rlwinm
  - mwcc-idiom
symbol: func_8009e100
hints:
  - "Clearing a bit ANDs with the complement: `x &= ~0x80`."
  - "`~0x80` is a full 32-bit constant, too wide for `andi.` — expect `rlwinm`."
  - Avoid `x &= 0xFF7F` here — it produces `andi.`, which won't match the target.
---

# Clearing a bit with `rlwinm`

Clearing a flag means ANDing with the inverse of its mask. In C, bit numbers
count from the least significant bit: bit `n` has mask `1 << n`. For example,
`1 << 6` is 64, or `0x40` in hexadecimal, so `x & ~0x40` clears C bit 6.
MWCC compiles that example to:

```asm
rlwinm  r3,r3,0,26,24
blr
```

The operand format is `rlwinm rA, rS, SH, MB, ME`: rotate `rS` left by `SH`,
keep bits `MB` through `ME`, and write the result to `rA`. These mask positions
use **PowerPC numbering**, where bit 0 is the most significant bit (MSB).
If `MB` is greater than `ME`, the kept range wraps past bit 31 to bit 0.

C bit `n` is PowerPC bit `31 - n`. That puts C bit 6 (`0x40`) at PowerPC
bit 25. In this example, the shift is zero and `[MB,ME] = [26,24]` keeps
PowerPC bits 26–31 and 0–24, clearing only PowerPC bit 25.

The complement `~0x40` is `0xFFFFFFBF`: its set bits extend beyond the 16-bit
immediate that `andi.` can hold. `rlwinm` can express this mask with its two
endpoints. Writing the same mask directly as `0xFFFFFFBF` produces the same
instruction; either spelling clears C bit 6.

Use the target's mask endpoints to find the excluded PowerPC bit, then convert
that position back to a C bit number and mask.

## Your task

Write `func_8009e100` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_8009e100(u32 x) {
    x &= ~0x80;
    return x;
}
```
