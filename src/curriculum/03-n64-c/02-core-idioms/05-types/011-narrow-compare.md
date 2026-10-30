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
  - "There are two loads, then the idiom from the control chapter that materializes a boolean. There is no branch anywhere."
  - "The function returns the equality of two loaded bytes as 0 or 1. Remember which pair of instructions builds `==` without a branch."
---

# Comparisons on narrow values

Comparisons work the same way when the operands come from narrow loads. The
load has already extended each value, so by the time `slt` or `xor` uses them,
they are normal 32-bit values. You only need to recognize the idioms from the
control chapter with `lbu`s in front of them. Here are two short examples:

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

Look at each one carefully:

- `is_dark` uses **`slti`**, a signed compare, on a `u8`. This is valid and
  correct. A zero-extended byte is in the range 0…255, which is never
  negative, so signed and unsigned comparison give the same result, and IDO
  picks the signed one. If the load is `lbu`, keep the `u8` declaration even
  though the compare is `slti`.
- `below_zero` only works because `lb` sign-extended the byte. The byte's bit
  7 became bit 31, and `slti …, 0` reads it. The same C on a `u8` would make
  no sense, because it could never be true, and the compiler would fold it to
  zero. So the signedness of the load decides what the comparison means.

The target compares two loaded bytes for equality and returns the boolean.
This is the branch-free pattern that materializes a boolean, with two loads
feeding it.

## Your task

Write `func_80206670` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80206670(u8 *a, u8 *b) {
    return *a == *b;
}
```
