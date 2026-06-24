---
id: workflow-fix-the-near-match
title: Fix the Near-Match
difficulty: 2
concepts:
  - near-match
  - idioms
  - bit-manipulation
symbol: clear_flag
hints:
  - The diff shows `andi.` where the target has `rlwinm` — a wrong-idiom symptom.
  - "Express it as clearing one bit, not as a literal mask: `~0x80` is the 0x80
    bit inverted."
  - Once you switch idioms, the diff should drop to zero diverging instructions
    — you'll see `rlwinm` on both sides.
---

# Fix the near-match (capstone)

Time to put the whole loop together. You inherited a function that's *almost*
matching — someone wrote plausible-looking C, but the diff shows a single
divergent instruction. Your job is to read the symptom and close the gap to 100%.

## The target

```asm
<clear_flag>:
   0:	54 63 06 6e 	rlwinm  r3,r3,0,25,23
   4:	4e 80 00 20 	blr
```

`rlwinm r3,r3,0,25,23` is a *rotate-left-immediate-then-mask*. Its operands are
`(dst, src, shift, MB, ME)`, and the mask is "every bit from position MB through
ME set" (PowerPC numbers bits from the MSB, so bit 0 is `0x80000000` and bit 31
is `0x00000001`). When `MB > ME` the run wraps around the end: here MB=25, ME=23
means bits 25..31 and bits 0..23 are set, leaving exactly bit 24 clear — and bit
24 (MSB-numbered) is the `0x80` bit in normal notation. So the mask is
`0xFFFFFF7F`. With a rotate of 0, the instruction just **masks** `r3` with that
pattern: it keeps every bit **except bit 7** (the `0x80` bit). In other words:
clear one specific bit.

## The starter's symptom

The starter clears the same bit, but it spells the mask the "obvious" way —
`x & 0xff7f` — and that's the bug. Compile the starter and you get:

```asm
<clear_flag>:
   0:	70 63 ff 7f 	andi.   r3,r3,65407
   4:	4e 80 00 20 	blr
```

First (and only) diverging instruction: `andi.` where the target has `rlwinm`.
Same *result* numerically, different *instruction*. This is the "wrong idiom" row
from the diagnosis table: a literal AND-immediate mask compiles to `andi.`, but
the original developer expressed it as **clearing a single bit**, which MWCC
lowers to `rlwinm`.

## The fix

Write the operation the way it was *meant*: not "AND with this magic number," but
"clear the `0x80` bit." In C that's:

```c
x & ~0x80
```

`~0x80` is "all bits set except bit 7" — the same mask, but written as a
single-bit clear. MWCC emits `rlwinm` for it, matching the target exactly.

## Your task

Edit `clear_flag` so it compiles to `rlwinm r3,r3,0,25,23` and `blr` — a 100%
match. Change the mask idiom from `& 0xff7f` to a single-bit clear.

<!-- starter -->
```c
int clear_flag(int x) {
    // Near-match: this clears bit 7, but the literal mask
    // 0xff7f compiles to andi. -- the target uses rlwinm.
    return x & 0xff7f;
}
```

<!-- solution -->
```c
int clear_flag(int x) {
    return x & ~0x80;
}
```
