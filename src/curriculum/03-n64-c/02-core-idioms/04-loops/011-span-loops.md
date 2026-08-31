---
id: 582bdeec-c615-492e-875d-1ffd715abde3
slug: loops-span
title: "Two Pointers, One Loop"
difficulty: 4
concepts:
  - loops
  - pointers
  - unrolling
symbol: func_8020af78
hints:
  - "Element size 4 this time — check the remainder mask and the strides. The main loop is a four-load burst folding into one accumulator."
  - "The C takes two `s32 *` pointers and walks the first until it equals the second, accumulating. Equality test, not less-than."
---

# while (p != end)

Game code often bounds a walk with a *pointer*, not a count: start here,
stop when you reach `end`. The condition compiles to a plain `beq`/`bne` on
two pointer registers — and IDO **still unrolls it**, deriving the length
it needs with a subtraction. Here's `span_len(p, end)`, which counts `s16`
elements between two pointers:

```c
s32 span_len(s16 *p, s16 *end) {
    s32 n = 0;
    while (p != end) {
        p++;
        n++;
    }
    return n;
}
```

```asm
 0:  beq   a0, a1, 0x34   # guard: p == end already? zero elements
 4:  or    v1, zero, zero # (slot) n = 0
 8:  subu  a2, a1, a0     # end - p = the span's size IN BYTES
 c:  andi  t6, a2, 0x7    # size & 7 — remainder in bytes (4 elems × 2)
10:  beqz  t6, 0x28       # no remainder? straight to the main loop
14:  addu  v0, t6, a0     # (slot) v0 = p + remainder — a mid-span pointer!
18:  addiu a0, a0, 2      # ── remainder loop: p++ (2 bytes)
1c:  bne   v0, a0, 0x18   # p reached the mid-point?
20:  addiu v1, v1, 1      # (slot) n++
24:  beq   a0, a1, 0x34   # remainder was everything? exit
28:  addiu a0, a0, 8      # ── main loop: p += 4 elements
2c:  bne   a0, a1, 0x28   # p reached end?
30:  addiu v1, v1, 4      # (slot) n += 4
34:  or    v0, v1, zero
38:  jr    ra
3c:  nop
```

Same two-loop skeleton as ever, re-dressed in pointer clothes:

- The **`subu` right after the guard** replaces the `andi n, 3` opener:
  length isn't a parameter, so the compiler manufactures it. `subu` of two
  incoming pointers = "this was a `p != end` loop".
- The remainder mask is `0x7` and strides are 2 and 8 — everything scaled
  by `sizeof(s16)`. Divide the strides by the element size to recover
  counts: this loop's `n` grows by 1 and 4, matching one and four `p++`s.
- The remainder loop's bound (`v0`) is a *pointer partway into the span*.
  A computed `addu` of a pointer and a masked length, used only in a
  `bne` — that's the mid-point marker, not a real C variable.

The C behind all of it is four lines and never mentions a length. Write
the `!=` comparison exactly — a `<` would be a different instruction pair
in the guard, and the diff will call you on it.

The target walks a span of **words** and folds each one into a total: same
guard-`subu`-remainder-main structure, plus the four-load burst you know
from the last two lessons.

## Your task

Write `func_8020af78` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8020af78(s32 *p, s32 *end) {
    s32 t = 0;
    while (p != end) {
        t += *p;
        p++;
    }
    return t;
}
```
