---
id: 86374d79-7e87-438a-bb2f-804d34f19cbe
slug: finale-hash-walk
title: "A Hash in a Walk"
difficulty: 3
concepts:
  - loops
  - pointers
  - types
  - multiplication
  - capstone
symbol: func_8018dd34
hints:
  - "The loop skeleton is the worked example's exactly. The new body is `multu`/`mflo` against the hoisted constant, plus an `addu` of the byte that was just peeked."
  - "The classic accumulator update is `h = h * K + byte` — the `addiu` before the loop names K."
---

# Nothing new, all at once

From here to the end of the tier: complete functions made purely of
idioms you already own. Your job shifts from *learning* shapes to
*recognizing* them mid-sentence. Here's `xorAll(s)`, which XORs
together the bytes of a zero-terminated string:

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

Name the pieces as they pass: sentinel walk with the tested byte
peeked one ahead; guard with the accumulator's init in its likely
slot; `bnezl` back-edge carrying the fold; `lbu` because the
elements are unsigned bytes. Four chapters, twelve lines.

The target is the same walk computing a real string *hash* — the
kind used for name lookups. One upgrade to expect: the body
multiplies the accumulator by a constant each trip, and inside a
rotated loop IDO doesn't spin up the shift-and-add chains you saw in
straight-line code. It **hoists the constant into a register before
the loop** (one `addiu`) and spends a `multu`/`mflo` per trip.
A constant materialized above a loop is almost always this — a
loop-invariant pulled out once.

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
