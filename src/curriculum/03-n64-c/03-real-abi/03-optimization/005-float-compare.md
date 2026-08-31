---
id: ee9a123d-9386-4b13-a50e-79e19551b012
slug: opt-float-compare
title: c.lt, Then Wait, Then Branch
difficulty: 3
concepts:
  - optimizer
  - floats
  - hazards
  - branch-likely
symbol: func_803a6848
hints:
  - "Same skeleton as the worked example — but look at which register each `mov.s` copies into `fv0`, on the taken path and the fall-through path."
  - "The condition is still `fa0 < fa1`. Only the returns swapped; decide what that means the `if` must say."
---

# Comparing floats is a three-beat rhythm

Integer code compares and branches in one hop (`beq`, `bnez`). The FPU can't:
a float comparison *sets a flag*, and a separate branch instruction reads it —
with a mandatory beat of silence in between. Here's `fmin2(a, b)`, which
returns the smaller of two `f32`s:

```asm
 0:  c.lt.s fa0, fa1    # flag = (a < b)
 4:  nop                # hazard: the flag isn't readable next cycle
 8:  bc1fl  0x1c        # branch if flag FALSE — likely form
 c:  mov.s  fv0, fa1    #   slot: return b (runs only if branch taken)
10:  jr     ra
14:  mov.s  fv0, fa0    # fall-through: return a
18:  mov.s  fv0, fa1    # duplicated tail from the split return
1c:  jr     ra
20:  nop
```

The three beats:

- **`c.lt.s`** — "compare, less-than, single" — writes the FPU's one condition
  flag. No destination register; the flag *is* the result.
- **The `nop`** is the same hazard story as `mtc1`: flag written, flag not yet
  readable. IDO always pads here.
- **`bc1t` / `bc1f`** branch if the flag is true / false. The `l` suffix makes
  it a *likely* form: the delay slot instruction runs **only when the branch is
  taken** — so the compiler parks the taken-path's return value there.

Follow both paths. Flag false (`a >= b`): branch taken, slot runs,
`fv0 = fa1`, return. Flag true (`a < b`): slot annulled, fall to `jr` at
`0x10`, `fv0 = fa0`. The stray `mov.s` at `0x18` is a duplicated tail the
optimizer left behind — count it, don't puzzle over it.

The target is the same three-beat rhythm with the two outcomes rearranged.
Trace each path to its `mov.s` before writing anything.

## Your task

Write `func_803a6848` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_803a6848(f32 a, f32 b) {
    if (a < b) {
        return b;
    }
    return a;
}
```
