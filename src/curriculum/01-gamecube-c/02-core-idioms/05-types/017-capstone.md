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
symbol: func_803b5be0
hints:
  - "Three operands of three different types means three different extends — read
    each one (`extsb`, `extsh`, `clrlwi …,16`, `clrlwi …,24`) to recover that
    parameter's exact width and signedness."
  - The extends interleave with the arithmetic in dependency order; a constant
    multiply of two variables is `mullw`, and the final combine is an `add`.
---

# Three types, one expression

This lesson throws several operands of different widths and signs into a single
expression. Nothing new happens — the same rules just fire together. Each
operand widens according to its own type, and the arithmetic runs in dependency
order. What you get is a catalog of extends, one per parameter, woven into the
math instead of stacked at the top.

Take `fold(a, b, c)` over a `u8`, an `s16`, and an `s8`, computing `a * b - c`:

```asm
clrlwi r3, r3, 24   # a: u8  -> zero-extend (keep low 8)
extsh  r0, r4       # b: s16 -> sign-extend
mullw  r0, r3, r0   # a * b  (variable * variable)
extsb  r3, r5       # c: s8  -> sign-extend
subf   r3, r3, r0   # (a * b) - c
blr
```

Each extend is a fingerprint. `clrlwi …,24` is an unsigned byte, `extsh` a
signed halfword, `extsb` a signed byte. Notice an operand's widen lands right
before its first use, which is why the extends weave through the arithmetic
rather than clustering at the top. The multiply is `mullw` — two variables, no
immediate — and its result sits in a scratch register until the last step.

Your target has the same three-types-in-one shape, but the widths and signs are
assigned to different operands and the final operator differs. Take the extends
one by one to pin down each parameter's type, then follow the arithmetic chain.

## Your task

Write `func_803b5be0` to reproduce the target assembly. Each parameter's type
is encoded in its extend instruction; the arithmetic chain is encoded in the
`mullw`/`add` that follow.

<!-- solution -->
```c
int func_803b5be0(s8 a, u16 b, u8 c) {
    return a * b + c;
}
```
