---
id: types-capstone
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

This is the capstone of the types chapter. When several operands of different
widths *and* different signedness meet in one expression, nothing new happens —
the compiler just applies every rule you've learned at once: widen each operand
by its own type, then run the arithmetic in dependency order. The disassembly
becomes a little table of extends, one per parameter, interleaved with the math.

Consider `fold(a, b, c)` with a `u8`, an `s16`, and an `s8`, computing
`a * b - c`:

```asm
clrlwi r3, r3, 24   # a: u8  -> zero-extend (keep low 8)
extsh  r0, r4       # b: s16 -> sign-extend
mullw  r0, r3, r0   # a * b  (variable * variable)
extsb  r3, r5       # c: s8  -> sign-extend
subf   r3, r3, r0   # (a * b) - c
blr
```

Every extend is a fingerprint: `clrlwi …,24` is an unsigned byte, `extsh` a
signed halfword, `extsb` a signed byte. The widen for each operand appears just
before that operand is first *used*, so the extends interleave with the
arithmetic rather than all bunching at the top. `mullw` multiplies two variables
(no immediate), and the running result threads through the scratch register to
the final combine.

The target uses the same three-types-in-one-expression shape, but with a
*different* assignment of widths and signs to the operands and a different final
operator. Work through the extends one at a time to type each parameter, then
trace the arithmetic chain.

## Your task

Write `blend`, taking three parameters and returning an `int`, to reproduce the
target assembly. Each parameter's type is encoded in its extend instruction;
the arithmetic chain is encoded in the `mullw`/`add` that follow.

<!-- starter -->
```c
int blend(s8 a, u16 b, u8 c) {
    return 0;
}
```

<!-- solution -->
```c
int blend(s8 a, u16 b, u8 c) {
    return a * b + c;
}
```
