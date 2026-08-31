---
id: b175fdb1-8626-4a2b-af9d-d307d7a73ae2
slug: finale-float-global
title: A Float Global and a Baked-in Constant
difficulty: 4
concepts:
  - globals
  - floats
  - hi-lo
  - fingerprints
symbol: func_8005d7f4
hints:
  - "Step the halving sequence one more time to decode the target's `lui` constant."
  - "Read the `sub.s` operand order — the global comes first — and then ask what the multiply feeding it combines."
---

# Reading a float constant out of a lui

Update a float global by a constant factor and three machines mesh: the
`%hi`/`%lo` address machinery, the FPU border crossing, and a float constant
*baked into an integer instruction*. Here's `coolDown(step)`, which halves
the global `f32` `gHeat` and adds `step`:

```asm
lui    v0, %hi(gHeat)
addiu  v0, v0, %lo(gHeat)    # the FULL address, built once — it's used twice
lui    at, 0x3f00            # 0.5f as raw bits…
mtc1   at, ft1               # …ferried across to the FPU
lwc1   ft0, 0(v0)            # load gHeat
mul.s  ft2, ft0, ft1         # × 0.5f
add.s  ft3, ft2, fa0         # + step
swc1   ft3, 0(v0)            # store gHeat
jr     ra
nop
```

Three observations, one per machine:

- **The address is completed up front.** Unlike the integer patterns where
  `%lo` rides the memory op, here `addiu` finishes the address in `v0` —
  because both a load *and* a store need it, and this function has no call
  to clobber registers across. One address, two memory ops at offset 0.
- **The constant never visits memory.** `0.5f`'s bit pattern is
  `0x3F000000` — the low 16 bits are zero, so a single `lui` builds the
  whole thing in an integer register and `mtc1` ferries it across. No
  hazard `nop` after this `mtc1`, note: the scheduler slid the `lwc1` into
  the gap.
- **Decoding the constant is a skill, not a chore.** `1.0f` is
  `0x3F800000`. Each *halving* subtracts `0x0080_0000` — one step of the
  exponent — from the top half: `0x3F00` is 0.5f, and the sequence keeps
  marching down by `0x80` per halving. Round-number float constants are
  almost always a bare `lui`, and you can read them by walking that
  ladder.

The target modifies a different global by a different (smaller) factor, and
combines with its parameter differently — a subtraction, whose operand
order matters. Decode the `lui`, then let the FPU instructions dictate the
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
