---
id: 6d2d2f85-c050-4296-9d88-17b1bf349b73
slug: floats-le-ge
title: "c.le.s and the Mirrored >="
difficulty: 2
concepts:
  - floats
  - compares
  - fingerprints
symbol: func_8034b4bc
hints:
  - "`c.le.s` with the *second* argument first. Apply the mirror rule from last lesson to a `<=` compare."
  - "Which C comparison puts `b` on the left of a less-or-equal?"
---

# The non-strict compare

`<` has a non-strict partner. **`c.le.s`** (compare, less or equal) tests
`<=`. It is a *separate instruction* from `c.lt.s`. Whether the boundary value
itself passes is part of the mnemonic, so no extra flag handling is needed.
This is `fits(x)`, which tests `x <= 4.0f`:

```asm
 0:  lui    at, 0x4080     # 4.0f
 4:  mtc1   at, ft0
 8:  or     v0, zero, zero
 c:  c.le.s fa0, ft0       # flag = (x <= 4.0f)
10:  nop
14:  bc1f   0x20
18:  nop
1c:  addiu  v0, zero, 1
20:  jr     ra
24:  nop
```

The argument is first, the constant is second, and the mnemonic uses `.le`
instead of `.lt`. Apart from that, this is the boolean structure you already
know. So the reading rule for the two compares fits in one table:

- `c.lt.s` → strict `<` (or a mirrored `>`)
- `c.le.s` → `<=` (or a mirrored `>=`)

The mirror rule applies here too. There is no greater-or-equal compare
either, so `a >= b` compiles as "`b <= a`": a `c.le.s` with the operands the
other way round. The mnemonic tells you whether the compare is strict, and the
operand order tells you the direction. Check those two things and you can
recover the exact C comparison, including what happens at the boundary.

This precision matters more with floats than you might expect. `hp >= maxHp`
and `hp > maxHp` are different game logic on the frame where the two values
are equal, and the assembly always shows which one was written.

The target uses `>=` and has no constant. Apply the mirror rule and pick the
non-strict compare.

## Your task

Write `func_8034b4bc` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8034b4bc(f32 a, f32 b) {
    return a >= b;
}
```
