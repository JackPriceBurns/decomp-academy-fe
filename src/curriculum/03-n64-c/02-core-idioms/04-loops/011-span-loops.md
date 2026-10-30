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
  - "The element size is 4 this time. Check the remainder mask and the strides. The main loop is a burst of four loads that combine into one accumulator."
  - "The C takes two `s32 *` pointers. It walks the first until it equals the second, adding to a total as it goes. The test is for equality, not less-than."
---

# while (p != end)

Game code often ends a walk at a *pointer* instead of after a count: start
here, and stop when you reach `end`. The condition compiles to a plain
`beq`/`bne` on two pointer registers. IDO **still unrolls the loop**, and it
works out the length it needs with a subtraction. Here is `span_len(p, end)`,
which counts the `s16` elements between two pointers:

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
 c:  andi  t6, a2, 0x7    # size & 7, the remainder in bytes (4 elems × 2)
10:  beqz  t6, 0x28       # no remainder? straight to the main loop
14:  addu  v0, t6, a0     # (slot) v0 = p + remainder, a pointer partway in
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

This is the usual two-loop structure, adapted for pointers:

- The **`subu` right after the guard** takes the place of the opening
  `andi n, 3`. The length is not a parameter, so the compiler computes it. A
  `subu` of two incoming pointers means "this was a `p != end` loop".
- The remainder mask is `0x7`, and the strides are 2 and 8. Everything is
  scaled by `sizeof(s16)`. Divide the strides by the element size to get the
  counts back: this loop's `n` grows by 1 and by 4, which matches one `p++`
  and four `p++`s.
- The remainder loop's bound (`v0`) is a *pointer partway into the span*.
  When an `addu` adds a masked length to a pointer and the result is only
  used in a `bne`, it is this midpoint marker. It is not a real C variable.

The C behind all of this is four lines long and never mentions a length.
Write the `!=` comparison exactly. A `<` would give a different pair of
instructions in the guard, and the diff will show it.

The target walks a span of **words** and combines each one into a total. It
has the same structure (guard, `subu`, remainder loop, main loop), plus the
burst of four loads from the last two lessons.

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
