---
id: 58199c47-6eff-466e-bf2f-5a9c9d55644e
slug: types-narrow-compare
title: "Comparing Bytes"
difficulty: 3
concepts:
  - types
  - booleans
  - comparisons
symbol: func_80206670
hints:
  - "Two loads, then a boolean-materialization idiom from the control chapter. No branch anywhere."
  - "Equality of two loaded bytes, returned as 0 or 1 — recall which two-instruction pair builds `==` without branching."
---

# Old idioms, new widths

Nothing about comparison changes when the operands come from narrow loads
— by the time `slt` or `xor` sees them, they're proper 32-bit values,
courtesy of the load's extension. The skill is simply recognizing your
control-chapter idioms with `lbu`s in front. Two quick specimens:

```c
s32 is_dark(u8 *p) {
    return *p < 40;
}
```

```asm
lbu   v0, 0(a0)
slti  t6, v0, 40    # boolean: loaded byte < 40
or    v0, t6, zero
jr    ra
nop
```

```c
s32 below_zero(s8 *p) {
    return *p < 0;
}
```

```asm
lb    v0, 0(a0)
slti  t6, v0, 0     # sign test on the sign-extended byte
or    v0, t6, zero
jr    ra
nop
```

Worth a pause on each:

- `is_dark` uses **`slti`** — a signed compare — on a `u8`. Legal and
  correct: a zero-extended byte is 0…255, comfortably positive, so signed
  and unsigned comparison agree and IDO picks the signed one. Don't let a
  `slti` talk you out of a `u8` declaration when the load says `lbu`.
- `below_zero` only works because `lb` sign-extended: the byte's bit 7
  became bit 31, and `slti …, 0` reads it. The same C on a `u8` would be
  meaningless (never true) — the compiler would fold it to zero. Load
  signedness and comparison meaning are welded together.

The target compares two loaded bytes for equality and returns the
boolean — the branch-free materialization pattern, fed by two loads.

## Your task

Write `func_80206670` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80206670(u8 *a, u8 *b) {
    return *a == *b;
}
```
