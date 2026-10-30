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
  - "Walk the doubling ladder from 1.0f = `0x3F80` to decode the target's `lui`. Each doubling adds `0x80` to the top half."
  - "This time the operation isn't a multiply. Read the `.s` mnemonic that uses `ft0`."
---

# 0.5f is just bits

A float constant has to be *built* somewhere, and IDO has two ways to do it.
This lesson shows the shorter one. `halveF(x)` returns `x * 0.5f`:

```asm
 0:  lui   at, 0x3f00     # 0.5f's bit pattern, top half
 4:  mtc1  at, ft0        # move the raw bits to the FPU
 8:  nop                  # hazard: ft0 isn't readable next cycle
 c:  mul.s fv0, fa0, ft0  # x * 0.5f
10:  nop                  # the padding nop after mul.s, again
14:  jr    ra
18:  nop
```

An `f32` is 32 bits, like any word. The bit pattern of `0.5f` is
`0x3F000000`, and its *bottom sixteen bits are all zero*. This lesson calls
bits like these *clean*. One `lui` can build the whole value in an integer
register. Then **`mtc1`** (move to coprocessor 1) copies the bits to the FPU
*unchanged*. There is no math, no memory access and no conversion. The bits
are only moved.

Two rules for this path:

- **The `nop` after `mtc1` is required.** The next FPU instruction cannot read
  a value that `mtc1` has only just moved. IDO fills this hazard with a `nop`
  instead of reordering the code. Expect `mtc1`, then `nop`, then the
  operation.
- **Round numbers follow the doubling ladder.** `1.0f` is `0x3F80` in the top
  half. Each *doubling* adds `0x80` to that half: `2.0f` = `0x4000`, `4.0f` =
  `0x4080`, `8.0f` = `0x4100`. Each halving subtracts it: `0.5f` = `0x3F00`,
  `0.25f` = `0x3E80`. A negative value sets the top bit: `-1.0f` = `0xBF80`.
  Most game constants are halves, doubles or other powers of two, and you can
  decode them by walking up or down this ladder in your head.

Constants whose bits *aren't* clean can't use this path. They take the other
path, which is the next lesson.

The target moves a different value from the ladder into the FPU and uses it
in a different operation. Decode the `lui`, then read the mnemonic.

## Your task

Write `func_8022e8bc` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_8022e8bc(f32 x) {
    return x + 2.0f;
}
```
