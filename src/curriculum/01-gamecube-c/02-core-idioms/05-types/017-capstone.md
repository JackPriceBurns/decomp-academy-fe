---
id: 8ed6f80c-08a0-53b3-aea3-fa539eef130b
slug: types-capstone
title: "Capstone: Widths and Signs in One Function"
difficulty: 3
concepts:
  - widening
  - zero-extension
  - sign-extension
  - mixed-width
  - mixed-signedness
  - chaining
symbol: blend
hints:
  - "Three operands of three different types means three different extends — read
    each one (`extsb`, `extsh`, `clrlwi …,16`, `clrlwi …,24`) to recover that
    parameter's exact width and signedness."
  - The extends interleave with the arithmetic in dependency order; a constant
    multiply of two variables is `mullw`, and the final combine is an `add`.
---

# Everything at once

Here is where the types chapter comes together. Throw several operands with
assorted widths and assorted signedness into one expression and nothing genuinely
new turns up. Every rule you have already met simply fires together. Each operand
still widens by its own type, and then the arithmetic runs in dependency order.
What you get back is a little catalog of extends, one per parameter, threaded in
among the math rather than stacked off to the side.

Take `fold(a, b, c)` over a `u8`, an `s16`, and an `s8`, computing `a * b - c`:

```asm
clrlwi r3, r3, 24   # a: u8  -> zero-extend (keep low 8)
extsh  r0, r4       # b: s16 -> sign-extend
mullw  r0, r3, r0   # a * b  (variable * variable)
extsb  r3, r5       # c: s8  -> sign-extend
subf   r3, r3, r0   # (a * b) - c
blr
```

Each extend is a fingerprint. A `clrlwi …,24` marks an unsigned byte, `extsh` a
signed halfword, `extsb` a signed byte. Notice too that an operand's widen lands
right before its first use, which is why the extends weave through the arithmetic
instead of clustering at the top. The multiply here is `mullw`, two variables and
no immediate, and the result it produces rides the scratch register down to the
last step.

Your target wears the same three-types-in-one shape, only the widths and signs
are handed out to different operands and the closing operator is not the same.
Take the extends one by one to pin down each parameter's type, then follow the
arithmetic chain from there.

## Your task

Write `blend` to reproduce the
target assembly. Each parameter's type is encoded in its extend instruction;
the arithmetic chain is encoded in the `mullw`/`add` that follow.

<!-- solution -->
```c
int blend(s8 a, u16 b, u8 c) {
    return a * b + c;
}
```
