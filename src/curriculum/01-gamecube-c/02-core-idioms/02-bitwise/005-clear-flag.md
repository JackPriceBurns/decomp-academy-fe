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

# Why clearing a bit is *not* an `andi.`

Clearing a flag is AND with the *inverse* mask. Going by the earlier AND
lesson, you'd bet on `andi.`. You'd lose. Watch MWCC clear bit 6, the `0x40`
bit, of a value:

```asm
rlwinm  r3,r3,0,26,24
blr
```

That's `rlwinm` — rotate-left-word-immediate-then-AND-with-mask. No `andi.` in
sight, and the reason is the constant itself. The complement of a one-bit mask
spans 32 bits, while `andi.` only holds a 16-bit immediate — nowhere near
enough. So MWCC leans on `rlwinm` instead, rotating by 0 and masking off
everything except the single bit it's clearing.

Decoding the mask is the fiddly part. PowerPC numbers bits from the MSB, so bit
0 is `0x80000000` and bit 31 is `0x1`. That puts value bit 6 (`0x40`) at PPC
bit 25, so the `[MB,ME] = [26,24]` pair *wraps* around the end of the word,
lighting up bits 26-31 and 0-24 — every bit but 25 itself.

You'll meet this idiom constantly. The `~` is the trigger: it produces a 32-bit
constant, and that's what pulls in `rlwinm`. Drop in a bare literal like
`0xFFFFFFBF` and you'd clear bit 25 too, but it's the *shape* of the
expression, not its value, that decides which instruction MWCC picks. The
target uses other operands, so spot the bit being cleared, write it in C, and
`rlwinm` shows up.

## Your task

Write `func_8009e100` so it compiles to the `rlwinm` above.

<!-- solution -->
```c
u32 func_8009e100(u32 x) {
    x &= ~0x80;
    return x;
}
```
