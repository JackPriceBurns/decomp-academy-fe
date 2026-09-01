---
id: f0808306-f2fb-4188-863a-d579bc4c4957
slug: gba-memory-pointer-arithmetic
title: Pointer Arithmetic
difficulty: 3
concepts:
  - pointers
  - addressing
  - strength-reduction
symbol: func_08214798
hints:
  - Nothing here is dereferenced, so the value being built is an address. The
    final constant is in bytes; divide it by the element size to get what the
    C wrote.
  - An `s32 *` and an `s32` in, an `s32 *` out. The shift-and-add ladder is a
    multiply on the index, and the `lsl #2` after it is the element size.
---

# Pointer arithmetic is scaled arithmetic

`p + n` means "n elements further along", so the machine has to multiply `n` by
the element size before it can add anything. That is the same scaling you have
been reading inside index expressions, except that here the result is the value
the function produces rather than an address it immediately loads from.

The same expression on three pointer types:

```asm
0        add       r0, r1
2        bx        lr
```

```asm
0        lsl       r1, #1
2        add       r0, r1
4        bx        lr
```

```asm
0        lsl       r1, #2
2        add       r0, r1
4        bx        lr
```

Bytes, halfwords, words. The shift amount is the only difference and it is the
whole type information.

Constants get scaled too, silently. Adding 3 to a `u16 *` is `add rB, #6` in
the listing, and the 6 is bytes; you have to divide by the element size to
recover the 3 that was written. A multiplier on the index compounds with the
element size in exactly the same way — `p + n * 2` on halfwords is a single
`lsl #2`, because two elements of two bytes is four. When the two factors have
collapsed into one shift you cannot separate them from that shift alone. Look
for a constant elsewhere in the function, or for a load, to pin the element
size down.

When the multiplier is not a power of two you get the strength-reduced ladder
from the arithmetic chapter, and then the element scale on top of it, in that
order: the ladder builds `n` times the multiplier, and a final shift turns
elements into bytes.

Your target's listing contains no load and no store anywhere in it.

## Your task

Write `func_08214798` to reproduce the target assembly.

<!-- solution -->
```c
s32 *func_08214798(s32 *p, s32 n) {
    return p + n * 3 - 1;
}
```
