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
  - "The structure is the same as the worked example. Look at which register each `mov.s` copies into `fv0`, on the taken path and on the fall-through path."
  - "The condition is still `fa0 < fa1`. Only the returns are swapped. Work out what that means the `if` must say."
---

# Comparing floats takes three steps

Integer code compares and branches in one instruction (`beq`, `bnez`). The FPU
can't do that. A float comparison *sets a flag*, and a separate branch
instruction reads it, with a required gap between them. Here is `fmin2(a, b)`,
which returns the smaller of two `f32`s:

```asm
 0:  c.lt.s fa0, fa1    # flag = (a < b)
 4:  nop                # hazard: the flag isn't readable next cycle
 8:  bc1fl  0x1c        # branch if flag FALSE (likely form)
 c:  mov.s  fv0, fa1    #   slot: return b (runs only if branch taken)
10:  jr     ra
14:  mov.s  fv0, fa0    # fall-through: return a
18:  mov.s  fv0, fa1    # duplicated tail from the split return
1c:  jr     ra
20:  nop
```

The three steps:

- **`c.lt.s`** means "compare, less-than, single". It writes the FPU's one
  condition flag. It has no destination register, because the flag *is* the
  result.
- **The `nop`** is the same kind of hazard as with `mtc1`: the flag has been
  written, but it can't be read yet. IDO always pads here.
- **`bc1t` / `bc1f`** branch if the flag is true / false. The `l` suffix makes
  it a *likely* form: the delay slot instruction runs **only when the branch is
  taken**. So the compiler puts the taken path's return value there.

Follow both paths. If the flag is false (`a >= b`), the branch is taken, the
slot runs, `fv0 = fa1`, and the function returns. If the flag is true
(`a < b`), the slot is cancelled (annulled), execution falls through to the
`jr` at `0x10`, and `fv0 = fa0`. The extra `mov.s` at `0x18` is a duplicated
tail that the optimizer left behind. Expect it in the listing, but don't look
for a meaning in it.

The target uses the same three steps, with the two outcomes arranged
differently. Trace each path to its `mov.s` before you write anything.

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
