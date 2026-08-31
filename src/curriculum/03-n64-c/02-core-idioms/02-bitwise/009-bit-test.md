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
  - "The `andi` isolates one bit; the `sltu`-from-`zero` turns \"anything survived\" into a clean 1-or-0. In C that's a mask compared against zero."
  - "Write the comparison explicitly (`!= 0`) on the masked value — the mask is the `andi` immediate."
---

# Is that bit set?

Game code asks this constantly: is flag such-and-such on? In C it's a mask
and a comparison — `(x & FLAG) != 0`. Here's what IDO makes of testing
bit 6:

```asm
andi v0, a0, 0x40    # isolate bit 6 — zero everywhere else
sltu t6, zero, v0    # is 0 < v0 (unsigned)? i.e. did anything survive?
or   v0, t6, zero    # the 1-or-0 lands in the return register
jr   ra
nop
```

The `andi` you know. The new move is `sltu t6, zero, v0` — **s**et on
**l**ess-**t**han, **u**nsigned, comparing `zero` against the masked value.
"Is zero strictly less than it?" is just "is it nonzero?", and the answer is
written as a clean 1 or 0. That's how MIPS turns a condition into a *value*:
there's no "compare to zero" instruction, so the compiler leans on the zero
register one more time.

Two habits to pick up here:

- **The extra copy is normal.** IDO computed the boolean into `t6`, then moved
  it to `v0` with the `or`-with-`zero` you already know. It does this even
  when it looks pointless — one more fingerprint, reproduced for free by
  ordinary C.
- File `sltu`-from-`zero` away as "**!= 0, as a value**". The next chapter
  builds a whole family of these boolean-materializing sequences; this is
  your first.

The target tests a different bit. Read the mask off the `andi` and say what
the function is asking.

## Your task

Write `func_80113ab0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80113ab0(s32 x) {
    return (x & 0x10) != 0;
}
```
