---
id: control-cmp-unsigned
title: "Unsigned Compare: cmplw"
difficulty: 3
concepts:
  - comparison
  - unsigned
  - branch
  - types
symbol: pick_unsigned
hints:
  - Unsigned operands feeding a branch use `cmplw`, not `cmpw`.
  - The only difference from the signed version is the operand types.
---

# Flip the operands to unsigned and the opcode follows

Take last lesson's `if`/`else` and retype the operands as `u32`. The control
flow stays put. The compare does not. `cmpw` gives way to **`cmplw`**, the
*logical* (unsigned) word compare.

```asm
cmplw r3, r4      # unsigned word compare
li    r3, 200     # speculative load
bgelr-            # conditional return
li    r3, 100     # fall-through value
blr
```

One line differs. `cmplw` now sits where `cmpw` sat, and the four instructions
below it are untouched.

It all comes down to ordering. As signed bits, `0xFFFFFFFF` is just `-1`. Flip
to unsigned and that same pattern becomes the largest value the register can
hold. Feed `u32` data into a signed compare and it sorts to the wrong end, so the
branch fires backwards. Which compare you get is dictated by the operand types
and nothing else. Seeing `cmplw` where your source still says `int` is the
giveaway that the real type was unsigned. The disassembly just handed you
something the symbol names could not.

After the compare, nothing here is new. The type is settled by `cmplw`. As for
the rest, `bgelr-` carries the condition while the two `li` constants are the
values it chooses between.

## Your task

Write `pick_unsigned`, taking two `u32`s, to reproduce the assembly above.

<!-- starter -->
```c
int pick_unsigned(u32 a, u32 b) {
    return 0;
}
```

<!-- solution -->
```c
int pick_unsigned(u32 a, u32 b) {
    if (a < b) return 100;
    return 200;
}
```
