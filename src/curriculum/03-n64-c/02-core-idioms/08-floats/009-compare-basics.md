---
id: b688eb99-78c1-4844-b7e0-ac5e7e7d940b
slug: floats-compare-basics
title: "c.lt.s: The Three-Step Compare"
difficulty: 2
concepts:
  - floats
  - compares
  - bc1f
  - booleans
symbol: func_801a23ac
hints:
  - "Same structure as the worked example, without the constant setup. The compare reads both arguments directly."
  - "`v0` starts at 0, and `bc1f` decides whether it becomes 1. The condition returned is exactly what `c.lt.s` tests."
---

# Compare, wait, branch

Integer code compares and branches directly (`beqz`, or `slt` + `bnez`). The
FPU can't do that. A float comparison **sets a flag**, which is a single
condition bit inside the FPU. A separate instruction reads that flag a little
later. This is `isNeg(x)`, which returns whether `x` is below zero:

```asm
 0:  mtc1   zero, ft0        # 0.0f, moved from the zero register at no cost
 4:  or     v0, zero, zero   # result = 0, assumed up front
 8:  c.lt.s fa0, ft0         # flag = (x < 0.0f)
 c:  nop                     # the flag isn't readable next cycle
10:  bc1f   0x1c             # flag false? skip ahead, keeping the 0
14:  nop
18:  addiu  v0, zero, 1      # flag true: result = 1
1c:  jr     ra
20:  nop
```

The three steps:

- **`c.lt.s`** (*compare, less than, single*) has no destination register.
  The flag **is** the result.
- **The `nop`** is the same kind of hazard as after `mtc1`. The flag has been
  written but cannot be read yet. When IDO has a useful instruction to put
  there instead, it will. The delay is always there, even when the `nop`
  isn't.
- **`bc1f`** (*branch on coprocessor 1 flag false*) and its partner **`bc1t`**
  (true) are the only way to act on the FPU's result.

Around the compare is the FPU's usual way of making a boolean. There is no
`slt`-style instruction here that writes the result into a register, so IDO
**assumes 0, then skips setting the 1 when the flag is false**.
`or v0, zero, zero` comes before the branch, and `addiu v0, zero, 1` comes
after it. Because `bc1f` jumps over the 1, the C returns the condition exactly
as `c.lt.s` states it.

One more pattern from the worked example: the bit pattern of `0.0f` is all
zeros, so it can be moved straight from the `zero` register.
`mtc1 zero, ft0` *is* the constant `0.0f`, and no `lui` is needed.

The target's compare uses no constant, so its setup is shorter. It returns
the result the same way.

## Your task

Write `func_801a23ac` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_801a23ac(f32 a, f32 b) {
    return a < b;
}
```
