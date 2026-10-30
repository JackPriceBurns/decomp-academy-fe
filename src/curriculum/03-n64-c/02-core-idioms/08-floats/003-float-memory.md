---
id: a4596b23-609a-4724-939b-fa762e1bba9e
slug: floats-memory
title: "lwc1 and swc1: Floats in Memory"
difficulty: 2
concepts:
  - floats
  - loads
  - stores
  - pointers
symbol: func_801165ac
hints:
  - "Two `lwc1`s at different offsets, one `add.s`, one `swc1`. Match each offset to an element of the array."
  - "Note which offset gets stored back. Only one element changes."
---

# The FPU's own load and store

Floats are read from and written to memory with their own pair of
instructions: **`lwc1`** (load word to coprocessor 1) and **`swc1`**, the
matching store. They use the same `offset(base)` form as `lw`/`sw`. The
destination is an FPU register, but the base is still an *integer* register,
because addresses are integers. This is `squareAt(p)`, which squares the float
that `p` points at and stores the result back in the same place:

```asm
lwc1  fv0, 0(a0)      # load *p onto the FPU
mul.s ft0, fv0, fv0   # *p * *p
swc1  ft0, 0(a0)      # store it back
jr    ra
nop
```

The pointer arrives in `a0`, because pointers are integers whatever they point
at. The value gets onto the FPU in the normal way: it is *loaded* there. This
is the same read-modify-write pattern you saw with byte fields, using FPU
instructions.

One thing may look odd: the load writes to `fv0` in a function that returns
nothing. The job names are *conventions*, and nothing enforces them. When there
is no return value to hold, `fv0` is the lowest free register, and IDO uses it
as scratch. Follow where the data goes and ignore the register's name.

An `f32` is four bytes, so array indexing scales the same way as for `s32`
arrays: element `[1]` is at offset 4 and `[2]` is at offset 8. The target works
on two neighbouring elements of a float array. It has two loads at different
offsets, one operation and one store. Check which element is the destination.

## Your task

Write `func_801165ac` to reproduce the target assembly.

<!-- solution -->
```c
void func_801165ac(f32 *p) {
    p[0] = p[0] + p[1];
}
```
