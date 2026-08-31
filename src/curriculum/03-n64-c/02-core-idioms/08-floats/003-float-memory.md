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
  - "Two `lwc1`s at different offsets, one `add.s`, one `swc1` — match each offset to an element of the array."
  - "Note which offset gets stored back. Only one element changes."
---

# The FPU's own load and store

Floats read and write memory with their own instruction pair:
**`lwc1`** — load word to coprocessor 1 — and **`swc1`**, its store.
Same `offset(base)` grammar as `lw`/`sw`, but the destination is an
FPU register and the base is still an *integer* register, because
addresses are integer business. Here's `squareAt(p)`, which squares
the float `p` points at, in place:

```asm
lwc1  fv0, 0(a0)      # load *p onto the FPU
mul.s ft0, fv0, fv0   # *p * *p
swc1  ft0, 0(a0)      # store it back
jr    ra
nop
```

The pointer arrives in `a0` — pointers are integers, whatever they
point at — and the value crosses into the float world the natural
way, by being *loaded* there. Read-modify-write, the same sandwich
you know from byte fields, wearing FPU instructions.

One eyebrow-raiser: the load targets `fv0` in a function that returns
nothing. The job names are *conventions*, not enforcement — when
there's no return value in flight, `fv0` is just the lowest free
register and IDO grabs it as scratch. Read the dataflow, not the
name.

An `f32` is four bytes, so array indexing scales exactly like `s32`
arrays: element `[1]` lives at offset 4, `[2]` at 8. The target works
on a two-element stretch of a float array — two loads at different
offsets, one operation, and one store. Watch which element is the
destination.

## Your task

Write `func_801165ac` to reproduce the target assembly.

<!-- solution -->
```c
void func_801165ac(f32 *p) {
    p[0] = p[0] + p[1];
}
```
