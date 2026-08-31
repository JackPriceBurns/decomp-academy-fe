---
id: 4cfcabab-aab3-5258-a086-cd173c875055
slug: control-cmp-unsigned
title: "Unsigned Compare: cmplw"
difficulty: 3
concepts:
  - comparison
  - unsigned
  - branch
  - types
symbol: func_8033f2ac
hints:
  - Unsigned operands feeding a branch use `cmplw`, not `cmpw`.
  - The only difference from the signed version is the operand types.
---

# Flip the operands to unsigned and the opcode follows

Take last lesson's `if`/`else` and retype the operands as `u32`. The control
flow stays put; the compare does not. `cmpw` gives way to **`cmplw`**, the
*logical* (unsigned) word compare.

```asm
cmplw r3, r4      # unsigned word compare
li    r3, 200     # speculative load
bgelr-            # conditional return
li    r3, 100     # fall-through value
blr
```

One line differs. `cmplw` now sits where `cmpw` sat, and the four instructions
around it are untouched.

It all comes down to ordering. As signed bits, `0xFFFFFFFF` is just `-1`; flip
to unsigned and that same pattern becomes the largest value the register can
hold. Feed `u32` data into a signed compare and it sorts to the wrong end, so
the branch fires backwards. Which compare you get is dictated by the operand
types and nothing else. Seeing `cmplw` where your source still says `int` is
the giveaway that the real type was unsigned — the disassembly just told you
something the symbol names couldn't.

After the compare, nothing here is new. The type is settled by `cmplw`; for the
rest, `bgelr-` carries the condition and the two `li` constants are the values
it chooses between.

## Your task

Write `func_8033f2ac` to reproduce the assembly above.

<!-- solution -->
```c
int func_8033f2ac(u32 a, u32 b) {
    if (a < b) return 100;
    return 200;
}
```
