---
id: 005f0956-3485-4b9f-9fe3-95c392b16ee1
slug: arithmetic-signed-pow2-remainder
title: Signed Remainder, Sign Restored
difficulty: 3
concepts:
  - arithmetic
  - divide
  - bitwise
  - fingerprints
symbol: func_80017c24
hints:
  - "The divisor is the `andi` mask plus one — same recipe as the unsigned lesson, now wearing a guard."
  - "`beqz` branches if the register is zero. Ask what the second branch is
    protecting: which negative inputs need no correction?"
---

# Mask, then make it negative again

Remainder by a power of two is still a mask for signed values — but a C
remainder takes the sign of the dividend, and a mask can only produce
non-negative bits. So after masking, negative inputs need their sign put back.
Here's `s32 x % 8`:

```asm
 0:  bgez  a0, 0x14      # x >= 0?  the mask alone is correct
 4:  andi  v0, a0, 0x7   # (delay slot) v0 = x & 7 — runs either way
 8:  beqz  v0, 0x14      # negative x, but remainder 0? nothing to fix
 c:  nop
10:  addiu v0, v0, -8    # slide the masked bits into negative range
14:  jr    ra
18:  nop
```

The skeleton matches last lesson beat for beat: `bgez` guard, the real work
riding in its delay slot, a patch-up for negatives. The new instruction is
**`beqz`** — **b**ranch if **eq**ual to **z**ero — and it's guarding a subtle
case: a negative multiple of 8 masks to 0, and 0 is already the right
remainder. Only a *nonzero* masked value needs the correction, which subtracts
the divisor to land in the negative range C requires (`-11 % 8` is `-3`, and
indeed `-11 & 7` is 5, minus 8 is `-3`).

You don't need to re-derive any of that under pressure. Recognize the shape —
`bgez` / `andi` in the slot / `beqz` / subtract-the-divisor — and read just
two numbers: the mask (divisor−1) and the final immediate (−divisor). They
must agree. Then write the one-line `%` and let IDO rebuild the dance.

## Your task

Write `func_80017c24` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80017c24(s32 a) {
    return a % 4;
}
```
