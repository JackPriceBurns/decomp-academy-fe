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
  - "The divisor is the `andi` mask plus one. This is the same rule as in the unsigned lesson, now with a guard around it."
  - "`beqz` branches if the register is zero. Think about what the second branch protects: which negative inputs need no correction?"
---

# Mask, then make it negative again

For signed values, a remainder by a power of two is still a mask. But a C
remainder has the sign of the dividend, and a mask can only produce a
non-negative result. So after masking, negative inputs need their sign put
back. Here's `s32 x % 8`:

```asm
 0:  bgez  a0, 0x14      # x >= 0?  the mask alone is correct
 4:  andi  v0, a0, 0x7   # (delay slot) v0 = x & 7, runs either way
 8:  beqz  v0, 0x14      # negative x, but remainder 0? nothing to fix
 c:  nop
10:  addiu v0, v0, -8    # move the masked bits into the negative range
14:  jr    ra
18:  nop
```

The structure is the same as in the last lesson: a `bgez` guard, the real work
in its delay slot, and a fix-up for negative values. The new instruction is
**`beqz`** (**b**ranch if **eq**ual to **z**ero). It handles a special case: a
negative multiple of 8 masks to 0, and 0 is already the right remainder. Only
a *nonzero* masked value needs the correction. The correction subtracts the
divisor to move the value into the negative range that C requires. For
example, `-11 % 8` is `-3`. The mask gives `-11 & 7`, which is 5, and 5 minus
8 is `-3`.

You don't need to work all of that out each time. Learn to recognize the
shape: `bgez`, then `andi` in the delay slot, then `beqz`, then a subtraction
of the divisor. Then read only two numbers: the mask (divisor−1) and the final
immediate (−divisor). They must agree. Finally, write the one-line `%`, and IDO
will rebuild the whole sequence.

## Your task

Write `func_80017c24` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80017c24(s32 a) {
    return a % 4;
}
```
