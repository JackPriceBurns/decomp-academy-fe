---
id: floats-float-to-int
title: "Float to Int: fctiwz and the Store/Load Dance"
difficulty: 3
concepts:
  - floating-point
  - conversion
  - fctiwz
  - float-to-int
symbol: f2i
hints:
  - float→int is `fctiwz`, then a store/load to move the bits FPR→GPR.
  - Write `(int)x`; expect `fctiwz` then `stfd`/`lwz` of the low word.
---

# `fctiwz` produces the bits in an FPR

Converting a float to an integer uses **`fctiwz`** ("convert to integer word,
round toward zero"). But there's a catch: the result lands in a *floating-point*
register, and there is no direct FPR→GPR move. So MWCC stores the FPR to the
stack and loads the low word back into a GPR. A function `to_int(f32 v)` produces:

```asm
fctiwz f0, f1        # convert v, result in low half of f0
stfd   f0, 8(r1)     # spill the 8-byte FPR to the stack
lwz    r3, 12(r1)    # +4 from the stfd base = low word = the int result
blr
```

That `fctiwz` → `stfd` → `lwz` is the unmistakable signature of a float-to-int
conversion in C. The integer result lands in the **low 32-bit word** of the 64-bit
FPR; because PowerPC is big-endian, that low word lives at the *higher* address,
so the `lwz` reads `12(r1)` — i.e. **+4** past the `stfd` base at `8(r1)`. The
round-toward-zero `fctiwz` matches C's truncating conversion semantics.

When you see `fctiwz` → `stfd` → `lwz` in disassembly, a single C operator
produces this whole sequence. Identify it and apply it to the correct variable.

## Your task

Write `f2i` taking an `f32 x` to match the target assembly above.

<!-- starter -->
```c
int f2i(f32 x) {
    return 0;
}
```

<!-- solution -->
```c
int f2i(f32 x) {
    return (int)x;
}
```
