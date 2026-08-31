---
id: 68ba2fa8-6c2e-4e97-8fcc-c8aac6088770
slug: floats-clean-constants
title: "Float Constants I: A lui With Clean Bits"
difficulty: 2
concepts:
  - floats
  - constants
  - mtc1
  - hazards
symbol: func_8022e8bc
hints:
  - "Walk the doubling ladder from 1.0f = `0x3F80` to decode the target's `lui` — each doubling adds `0x80` to the top half."
  - "The operation this time isn't a multiply. Read the `.s` mnemonic that consumes `ft0`."
---

# 0.5f is just bits

A float constant has to *materialize* somewhere, and IDO has two ways
to do it. Here's the elegant one. `halveF(x)` returns `x * 0.5f`:

```asm
 0:  lui   at, 0x3f00     # 0.5f's bit pattern, top half
 4:  mtc1  at, ft0        # ferry the raw bits to the FPU
 8:  nop                  # hazard: ft0 isn't readable next cycle
 c:  mul.s fv0, fa0, ft0  # x * 0.5f
10:  nop                  # the mul.s-before-return pad again
14:  jr    ra
18:  nop
```

An `f32` is 32 bits like any word, and `0.5f`'s pattern is
`0x3F000000` — the *bottom sixteen bits are all zero*. That's the
trick: one `lui` builds the entire value in an integer register, and
**`mtc1`** — move to coprocessor 1 — carries the bits across to the
FPU *unchanged*. No math, no memory, no conversion: a ferry.

Two rules of the ferry crossing:

- **The `nop` after `mtc1` is mandatory furniture.** A freshly ferried
  value isn't readable by the very next FPU instruction, and IDO pads
  the hazard rather than reorder. `mtc1`, `nop`, then the op — file
  the rhythm.
- **Round numbers ride the ladder.** `1.0f` is `0x3F80` up top. Each
  *doubling* adds `0x80` to that half: `2.0f` = `0x4000`, `4.0f` =
  `0x4080`, `8.0f` = `0x4100`. Each halving subtracts it: `0.5f` =
  `0x3F00`, `0.25f` = `0x3E80`. Negative versions set the top bit:
  `-1.0f` = `0xBF80`. Most game constants — halves, doubles, powers
  of two — decode by walking this ladder in your head.

Constants whose bits *aren't* clean can't play this game; they get
the other path, next lesson.

The target ferries a different rung of the ladder across, and feeds
it to a different operation. Decode the `lui`, read the mnemonic.

## Your task

Write `func_8022e8bc` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_8022e8bc(f32 x) {
    return x + 2.0f;
}
```
