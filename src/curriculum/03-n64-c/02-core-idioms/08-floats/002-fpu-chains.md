---
id: c52e969d-fb9b-4ab0-a7db-bd2f4cefcefb
slug: floats-fpu-chains
title: "Chains, ft0, and the mul.s nop"
difficulty: 1
concepts:
  - floats
  - fpu
  - expression-chains
symbol: func_8014ba58
hints:
  - "Two `.s` ops, one feeding the other through `ft0` — read them bottom-up like any integer chain."
  - "The second instruction reuses one of the original *arguments*, not the intermediate. Check which register rides in each slot."
---

# Two ops, one temporary

Bigger float expressions chain through the `ft` temporaries exactly
the way integer expressions chain through `t6` and friends. Here's
`blend(a, b)`, which computes `(a + b) * a`:

```asm
add.s  ft0, fa0, fa1   # ft0 = a + b
mul.s  fv0, ft0, fa0   # fv0 = (a + b) * a
nop
jr     ra
nop
```

Bottom-up reading works unchanged: the value returned is a `mul.s` of
`ft0` and `fa0`; `ft0` is an `add.s` of the two arguments; substitute
and the expression falls out. Note the second operand of the multiply
is `fa0` — the *argument*, used twice. Which register appears where is
the whole difference between `(a + b) * a` and `(a + b) * b`.

And that stray `nop` before `jr ra`? It's not scheduling — it's a
**hardware workaround**. This console's CPU has a known bug involving
multiplies too close to certain instructions, and the assembler pads a
`mul.s` that lands right before a return. `add.s`, `sub.s`, and even
`div.s` in the same spot get no such padding. So: a lone `nop` between
a `mul.s` and `jr ra` is *expected furniture* — count it, don't hunt
for a meaning. You'll see this pad again and again all game long.

The full `.s` arithmetic set is what you'd guess: `add.s`, `sub.s`,
`mul.s`, and — with no integer counterpart drama, no HI/LO — a
straightforward **`div.s`**. Hardware float division in one
instruction; slow, but real.

The target chains two `.s` operations. Work out what feeds what, and
which argument appears twice.

## Your task

Write `func_8014ba58` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_8014ba58(f32 a, f32 b) {
    return (a - b) / b;
}
```
