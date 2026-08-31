---
id: f0e06b62-d9b8-4e6d-8f64-a64a32f207bb
slug: arithmetic-scale-add
title: Scale One, Add the Other
difficulty: 2
concepts:
  - arithmetic
  - shifts
  - registers
symbol: func_800381ac
hints:
  - "The `sll` scales the first argument by a power of two; the `addu` brings in the second argument, not a copy of the first."
  - "Read the shift amount off the target and convert it back to the multiplier it stands for."
---

# Two arguments, one scaled

So far every shift chain fed on a single input. Mix in a second argument and
you get one of the most important little shapes in MIPS: scale one value, add
another. Here's `stride(x, y)` returning `x * 8 + y`:

```asm
sll  t6, a0, 3     # t6 = x * 8
addu v0, t6, a1    # v0 = x*8 + y
jr   ra
nop
```

The decode is nothing new — `sll` by 3 is ×8, then an add. What's new is what
the `addu` folds in: **`a1`, the second argument**, not the original `a0`. In
the pure chains of the last few lessons, `addu` with `a0` meant "+1× the same
input". Here it means "+ the other variable". Same instruction, completely
different C — and the only way to tell them apart is to check the register.
This is why the margin-math habit insists you note *which* register every
operand is.

File this shape away with extra care. "Shift by k, then add a different
register" is exactly how array indexing will compile in a few chapters — the
shift scales an index by the element size, the add attaches it to a base. When
you meet it there, you'll already know how to read it.

## Your task

Write `func_800381ac` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_800381ac(s32 a, s32 b) {
    return a * 4 + b;
}
```
