---
id: a2edba92-e630-5c15-aa76-cd9f17631136
slug: floats-float-to-int
title: "Float to Int: fctiwz and the Store/Load Dance"
difficulty: 3
concepts:
  - floating-point
  - conversion
  - fctiwz
  - float-to-int
symbol: func_800bb6e8
hints:
  - float→int is `fctiwz`, then a store/load to move the bits FPR→GPR.
  - Write `(int)x`; expect `fctiwz` then `stfd`/`lwz` of the low word.
---

# `fctiwz` produces the bits in an FPR

Converting a float to an integer uses `fctiwz` ("convert to integer word, round
toward zero"). But the result lands in a floating-point register, and there's
no direct FPR→GPR move — so MWCC stores the FPR to the stack and loads the low
word back into a GPR. A function `to_int(f32 v)` produces:

```asm
fctiwz f0, f1        # convert v, result in low half of f0
stfd   f0, 8(r1)     # spill the 8-byte FPR to the stack
lwz    r3, 12(r1)    # +4 from the stfd base = low word = the int result
blr
```

That `fctiwz` → `stfd` → `lwz` is the unmistakable signature of a float-to-int
conversion in C. The integer result sits in the low 32-bit word of the 64-bit
FPR; because PowerPC is big-endian, that low word is at the higher address, so
the `lwz` reads `12(r1)` — +4 past the `stfd` base at `8(r1)`. The
round-toward-zero `fctiwz` matches C's truncating conversion semantics.

When you see `fctiwz` → `stfd` → `lwz` in a disassembly, a single C operator
produces the whole sequence. Identify it and apply it to the correct variable.

## Your task

Write `func_800bb6e8` to match the target assembly above.

<!-- solution -->
```c
int func_800bb6e8(f32 x) {
    return (int)x;
}
```
