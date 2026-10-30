---
id: 86374d79-7e87-438a-bb2f-804d34f19cbe
slug: finale-hash-walk
title: "Hashing a String"
difficulty: 3
concepts:
  - loops
  - pointers
  - types
  - multiplication
  - capstone
symbol: func_8018dd34
hints:
  - "The loop skeleton is exactly the same as in the worked example. The new body is a `multu`/`mflo` with the hoisted constant, then an `addu` that adds the byte that was just peeked."
  - "The classic accumulator update is `h = h * K + byte`. The `addiu` before the loop tells you the value of K."
---

# Nothing new, all at once

From here to the end of the tier, every exercise is a complete function
built only from idioms you have already learned. Your job now is to
*recognize* the shapes you *learned* when they appear in the middle of a
function. Here is `xorAll(s)`, which XORs together the bytes of a
zero-terminated string:

```c
u32 xorAll(u8 *s) {
    u32 x = 0;
    while (*s != 0) {
        x ^= *s;
        s++;
    }
    return x;
}
```

```asm
 0:  lbu   v0, 0(a0)        # peek the first byte
 4:  or    v1, zero, zero   # x = 0
 8:  beqzl v0, 0x28         # empty string? return…
 c:  or    v0, v1, zero     #   (likely slot) …x
10:  xor   v1, v1, v0       # ── loop: fold the byte in
14:  lbu   v0, 1(a0)        # peek the NEXT byte
18:  addiu a0, a0, 1        # s++
1c:  bnezl v0, 0x14         # not the terminator? go around…
20:  xor   v1, v1, v0       #   (likely slot) …folding as we go
24:  or    v0, v1, zero
28:  jr    ra
2c:  nop
```

Try to name each piece as you read it:

- a sentinel walk, where the byte being tested is peeked one element
  ahead;
- a guard, with the accumulator's starting value placed in its likely
  slot;
- a `bnezl` back-edge, with the fold in its likely slot;
- `lbu`, because the elements are unsigned bytes.

Those twelve lines use ideas from four different chapters.

The target is the same walk, but it computes a real string *hash*, the
kind used to look up names. Expect one new detail. On each trip, the
body multiplies the accumulator by a constant. In straight-line code you
saw IDO turn a multiply by a constant into a chain of shifts and adds.
Inside a rotated loop it does not do that. It **hoists the constant into
a register before the loop** (one `addiu`) and uses a `multu`/`mflo`
pair on every trip. When a constant is loaded into a register above a
loop, it is almost always this: a loop-invariant value, computed once
outside the loop.

## Your task

Write `func_8018dd34` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_8018dd34(u8 *s) {
    u32 h = 0;
    while (*s != 0) {
        h = h * 31 + *s;
        s++;
    }
    return h;
}
```
