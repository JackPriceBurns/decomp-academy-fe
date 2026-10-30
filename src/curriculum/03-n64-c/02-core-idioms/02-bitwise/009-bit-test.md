---
id: a44eac09-d90a-4a2e-9827-b95d4e63bddb
slug: bitwise-bit-test
title: Testing a Bit
difficulty: 2
concepts:
  - bitwise
  - booleans
  - fingerprints
symbol: func_80113ab0
hints:
  - "The `andi` isolates one bit. The `sltu` from `zero` turns \"some bit survived\" into a clean 1 or 0. In C that is a mask compared against zero."
  - "Write the comparison explicitly (`!= 0`) on the masked value. The mask is the `andi` immediate."
---

# Is that bit set?

Game code often needs to check whether a flag is on. In C this is a mask and a
comparison: `(x & FLAG) != 0`. Here is what IDO produces when it tests bit 6:

```asm
andi v0, a0, 0x40    # isolate bit 6, zero everywhere else
sltu t6, zero, v0    # is 0 < v0 (unsigned)? i.e. did anything survive?
or   v0, t6, zero    # the 1-or-0 lands in the return register
jr   ra
nop
```

You already know `andi`. The new instruction is `sltu t6, zero, v0`:
**s**et on **l**ess-**t**han, **u**nsigned. It compares `zero` against the
masked value. "Is zero strictly less than it?" is the same question as "is it
nonzero?", and the answer is written as a clean 1 or 0. This is how MIPS turns
a condition into a *value*. There is no "compare to zero" instruction, so the
compiler uses the zero register again.

There are two habits to learn here:

- **The extra copy is normal.** IDO computed the boolean into `t6`, then moved
  it to `v0` with the `or` with `zero` that you already know. It does this
  even when the copy looks pointless. It is one more fingerprint of IDO, and
  ordinary C reproduces it with no extra work.
- Remember `sltu` from `zero` as "**!= 0, as a value**". The next chapter
  covers a whole family of these sequences that turn a condition into a
  boolean value. This is the first one.

The target tests a different bit. Read the mask from the `andi` and work out
what question the function is asking.

## Your task

Write `func_80113ab0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80113ab0(s32 x) {
    return (x & 0x10) != 0;
}
```
