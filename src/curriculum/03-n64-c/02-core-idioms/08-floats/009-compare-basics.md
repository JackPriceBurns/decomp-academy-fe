---
id: b688eb99-78c1-4844-b7e0-ac5e7e7d940b
slug: floats-compare-basics
title: "c.lt.s: The Three-Beat Compare"
difficulty: 2
concepts:
  - floats
  - compares
  - bc1f
  - booleans
symbol: func_801a23ac
hints:
  - "Same skeleton as the worked example, minus the constant setup — the compare reads both arguments directly."
  - "`v0` starts at 0 and `bc1f` decides whether the 1 happens. The
    condition returned is exactly what `c.lt.s` tests."
---

# Compare, wait, branch

Integer code compares and branches in a single hop (`beqz`, `slt` +
`bnez`). The FPU can't. A float comparison **sets a flag** — one
single condition bit the FPU owns — and a separate instruction reads
it a beat later. Here's `isNeg(x)`, which returns whether `x` is
below zero:

```asm
 0:  mtc1   zero, ft0        # 0.0f — ferried from the zero register, free
 4:  or     v0, zero, zero   # result = 0, assumed up front
 8:  c.lt.s fa0, ft0         # flag = (x < 0.0f)
 c:  nop                     # the flag isn't readable next cycle
10:  bc1f   0x1c             # flag false? skip ahead, keeping the 0
14:  nop
18:  addiu  v0, zero, 1      # flag true: result = 1
1c:  jr     ra
20:  nop
```

The three beats:

- **`c.lt.s`** — *compare, less-than, single* — has no destination
  register. The flag **is** the result.
- **The `nop`** is the same hazard story as `mtc1`: flag written,
  flag not yet readable. When IDO has a useful instruction to park
  there instead, it will — the beat is always there even when the
  `nop` isn't.
- **`bc1f`** — *branch on coprocessor 1 flag false* — and its twin
  **`bc1t`** (true) are the only way off the FPU's verdict.

Around the compare sits the FPU's boolean idiom: no `slt`-style
"result into a register" exists over here, so IDO **assumes 0, then
conditionally skips the 1**. `or v0, zero, zero` before the branch,
`addiu v0, zero, 1` after it — `bc1f` jumping the 1 means the C
returns the condition exactly as `c.lt.s` spells it.

One bonus fingerprint from the worked example: `0.0f`'s bit pattern
is all zeros, so it ferries straight from the `zero` register —
`mtc1 zero, ft0` *is* the constant `0.0f`. No `lui` needed.

The target compares the two arguments against each other — no
constant, so the setup shrinks — and returns the verdict the same
way.

## Your task

Write `func_801a23ac` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_801a23ac(f32 a, f32 b) {
    return a < b;
}
```
