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

To **clear** a single flag you AND with the *inverse* mask. The natural C is
`x &= ~0x80`. You might expect an `andi.` like the earlier AND lesson — but watch
what actually comes out:

```asm
rlwinm  r3, r3, 0, 25, 23    # x & ~0x80
blr
```

That's **`rlwinm`** (rotate-left-word-immediate-then-AND-with-mask), *not*
`andi.`. The reason is decisive: `~0x80` is `0xFFFFFF7F`, a 32-bit constant.
`andi.` only has a **16-bit** immediate and could never express the high bits, so
MWCC uses `rlwinm` with a rotate of 0 and a mask that spans everything except the
one bit being cleared. To derive that mask yourself: `~0x80` is `0xFFFFFF7F`, so
the only cleared bit is the one in `0x80`. PowerPC numbers bits from the MSB
(bit 0 = `0x80000000`, bit 31 = `0x1`), which puts `0x80` at **bit 24**. The mask
`[MB,ME] = [25,23]` therefore *wraps around* the word, covering bits 25-31 and
0-23 — everything except bit 24.

**This is a key MWCC idiom.** Write `x &= ~0x80` and you get `rlwinm`. If you had
instead written `x &= 0xFF7F`, you'd get an `andi.` — but note that isn't a
stylistic alternative: `0xFF7F` is `0x0000FF7F`, which also zeroes every bit above
bit 15, unlike `~0x80` (`0xFFFFFF7F`). So it's both the wrong instruction *and* the
wrong result — the source you write decides the instruction.

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
