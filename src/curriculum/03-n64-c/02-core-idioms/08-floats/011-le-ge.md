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
  - "`c.le.s` with the *second* argument first — apply the mirror rule
    from last lesson to a `<=` compare."
  - "Which C comparison puts `b` on the left of a less-or-equal?"
---

# The other strict-ness

`<` has a softer sibling. **`c.le.s`** — compare, less-or-equal —
tests `<=`, and it's a *different instruction* from `c.lt.s`, not a
flag trick: whether the boundary value itself passes is baked into
the mnemonic. Here's `fits(x)`, which tests `x <= 4.0f`:

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

Argument first, constant second, `.le` instead of `.lt` — otherwise
the boolean skeleton you already own. So the reading rule for the
pair is one table:

- `c.lt.s` → strict `<` (or a mirrored `>`)
- `c.le.s` → `<=` (or a mirrored `>=`)

And yes — the mirror applies here too. There's no
greater-or-equal compare either, so `a >= b` compiles as
"`b <= a`": a `c.le.s` with the operands facing the other way.
Strictness comes from the mnemonic, direction from the operand
order. Two glances and you've recovered the exact C comparison,
boundary behavior included.

That precision matters more with floats than you might expect —
`hp >= maxHp` and `hp > maxHp` are different game logic on the
boundary frame, and the assembly never lets the two blur.

The target is a `>=` between the two arguments. Mirror, soften,
done.

## Your task

Write `func_8034b4bc` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8034b4bc(f32 a, f32 b) {
    return a >= b;
}
```
