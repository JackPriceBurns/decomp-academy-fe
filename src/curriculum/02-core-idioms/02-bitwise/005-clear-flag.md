---
id: bitwise-clear-flag
title: "Clearing a Bit: The rlwinm Surprise"
difficulty: 2
concepts:
  - bitwise
  - and
  - rlwinm
  - mwcc-idiom
symbol: clear_flag
hints:
  - "Clearing a bit ANDs with the complement: `x &= ~0x80`."
  - "`~0x80` is a full 32-bit constant, too wide for `andi.` — expect `rlwinm`."
  - Avoid `x &= 0xFF7F` here — it produces `andi.`, which won't match the target.
---

# Why clearing a bit is *not* an `andi.`

To **clear** a single flag you AND with the *inverse* mask. You might expect an
`andi.` like the earlier AND lesson — but look at what MWCC actually produces when
clearing bit 6 (the `0x40` bit) of a value:

```asm
rlwinm  r3,r3,0,26,24
blr
```

That's **`rlwinm`** (rotate-left-word-immediate-then-AND-with-mask), *not*
`andi.`. The reason is decisive: bit-complement masks are 32-bit constants.
`andi.` only has a **16-bit** immediate and cannot express the high bits, so
MWCC uses `rlwinm` with a rotate of 0 and a mask that spans everything except the
one bit being cleared.

To read the mask back: PowerPC numbers bits from the MSB (bit 0 = `0x80000000`,
bit 31 = `0x1`). Bit 6 of the value (`0x40`) sits at **PPC bit 25**. The `[MB,ME]
= [26,24]` mask *wraps around* the word, covering bits 26-31 and 0-24 — every bit
except bit 25.

**This is a key MWCC idiom.** Using `~` gives a 32-bit constant that forces
`rlwinm`. Writing a literal constant instead (e.g. `0xFFFFFFBF`) would also clear
only bit 25, but the *shape* of the source expression is what drives instruction
selection. The assembly in your target uses different operands — work out which bit
is being cleared, express that in C, and `rlwinm` will appear.

## Your task

Write `clear_flag` so it compiles to the `rlwinm` above.

<!-- starter -->
```c
u32 clear_flag(u32 x) {
    return 0;
}
```

<!-- solution -->
```c
u32 clear_flag(u32 x) {
    x &= ~0x80;
    return x;
}
```
