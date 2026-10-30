---
id: b175fdb1-8626-4a2b-af9d-d307d7a73ae2
slug: finale-float-global
title: A Float Global and a Constant Built by lui
difficulty: 4
concepts:
  - globals
  - floats
  - hi-lo
  - fingerprints
symbol: func_8005d7f4
hints:
  - "Step through the halving sequence one more time to decode the target's `lui` constant."
  - "Read the `sub.s` operand order (the global comes first), and then ask what the multiply that feeds it combines."
---

# Reading a float constant from a lui

When you update a float global by a constant factor, three patterns appear
together: the `%hi`/`%lo` address pattern, the move from integer registers to
the FPU, and a float constant *stored inside an integer instruction*. Here is
`coolDown(step)`, which halves the global `f32` `gHeat` and adds `step`:

```asm
lui    v0, %hi(gHeat)
addiu  v0, v0, %lo(gHeat)    # the full address, built once and used twice
lui    at, 0x3f00            # 0.5f as raw bits
mtc1   at, ft1               # moved across to the FPU
lwc1   ft0, 0(v0)            # load gHeat
mul.s  ft2, ft0, ft1         # × 0.5f
add.s  ft3, ft2, fa0         # + step
swc1   ft3, 0(v0)            # store gHeat
jr     ra
nop
```

Three things to notice, one for each pattern:

- **The address is completed up front.** In the integer patterns, `%lo` was
  part of the memory op. Here `addiu` finishes the address in `v0`, because
  both a load *and* a store need it, and this function has no call that could
  clobber registers in between. One address serves two memory ops, both at
  offset 0.
- **The constant is never loaded from memory.** The bit pattern of `0.5f` is
  `0x3F000000`. Its low 16 bits are zero, so a single `lui` builds the whole
  value in an integer register, and `mtc1` moves it across. Note that there is
  no hazard `nop` after this `mtc1`: the scheduler moved the `lwc1` into that
  gap.
- **You can decode the constant by hand.** `1.0f` is `0x3F800000`. Each
  *halving* subtracts `0x0080_0000`, which is one step of the exponent. In the
  top half, `0x3F00` is 0.5f, and each further halving lowers it by another
  `0x80`. Round-number float constants are almost always a bare `lui`, and you
  can read them by stepping through that sequence.

The target changes a different global by a different (smaller) factor. It
also combines its values differently: with a subtraction, whose operand order
matters. Decode the `lui`, then let the FPU instructions give you the
expression tree.

## Your task

`extern f32 gFuel;` is declared for you. Write `func_8005d7f4` to reproduce the
target assembly.

<!-- solution -->
```c
void func_8005d7f4(f32 rate) {
    gFuel = gFuel - rate * 0.25f;
}
```

<!-- context -->
```c
extern f32 gFuel;
```
