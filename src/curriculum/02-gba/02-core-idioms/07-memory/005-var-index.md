---
id: 97255fae-9bf5-43b7-8d8c-25f9d9275c63
slug: gba-memory-var-index
title: A Variable Index
difficulty: 2
concepts:
  - pointers
  - arrays
  - addressing
symbol: func_0820713c
hints:
  - Each `lsl` that feeds an `add` onto the base is one index being scaled.
    Two of them means two indices, not one index used twice.
  - One `s32 *` and two `s32` indices in, an `s32` out. The order of the
    registers in the final `sub` tells you which index the C wrote first.
---

# When the index is not known until runtime

A constant index folds into the load's offset field. A variable one cannot,
because the field holds a literal. So the address has to be computed, and it
is always computed the same way: scale the index by the element size with a
shift, add it to the base, then load at offset zero.

```asm
0        lsl       r1, #2
2        add       r1, r0
4        ldr       r1, [r1, #0]
6        lsl       r0, r1, #1
8        add       r0, r1
10       bx        lr
```

Two shifts in six instructions, doing completely different jobs. The `lsl r1,
#2` at the top is addressing: four bytes per element, so the index is
multiplied by four before it is added to the base. The `lsl r0, r1, #1`
further down is arithmetic — the strength-reduced multiply from the arithmetic
chapter, shifting the loaded value rather than an index.

Telling them apart is a matter of following the register. A shift whose result
is added to a pointer and then dereferenced is a scale; a shift on a value that
came out of a load is a multiply. The shift amount in the first case is the
base-two logarithm of the element size, which makes it the single best clue to
the pointer's type: `lsl #2` before an `add` and an `ldr` means 4-byte
elements.

One thing worth knowing, because it will save you guessing: Thumb does have a
register-offset load, `ldr rD, [rB, rM]`, and agbcc never emits it for `ldr`,
`ldrh` or `ldrb`. The scaled index is always folded into the base with a real
`add` first. If you find yourself trying to coax a register-offset word load
out of this compiler, stop — it does not produce one.

Your target scales twice before it loads anything.

## Your task

Write `func_0820713c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0820713c(s32 *p, s32 i, s32 j) {
    return p[i] - p[j];
}
```
