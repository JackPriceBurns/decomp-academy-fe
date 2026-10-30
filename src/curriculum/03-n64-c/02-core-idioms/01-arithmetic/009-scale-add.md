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
  - "The `sll` multiplies the first argument by a power of two. The `addu` then adds the second argument, not another copy of the first."
  - "Read the shift amount from the target and turn it back into the multiplier it stands for."
---

# Two arguments, one scaled

So far, every shift chain has used a single input. Add a second argument and
you get one of the most important small patterns in MIPS: scale one value by a
power of two, then add another value. Here's `stride(x, y)` returning
`x * 8 + y`:

```asm
sll  t6, a0, 3     # t6 = x * 8
addu v0, t6, a1    # v0 = x*8 + y
jr   ra
nop
```

You already know how to decode this: `sll` by 3 is ×8, then an add. The new
part is what the `addu` adds: **`a1`, the second argument**, instead of the
original `a0`. In the chains of the last few lessons, `addu` with `a0` meant
"+1× the same input". Here it means "+ the other variable". The instruction is
the same, but the C is completely different, and the only way to tell them
apart is to check the register. This is why, when you track the running
multiplier, you also note *which* register each operand is.

Remember this shape well. "Shift by k, then add a different register" is how
array indexing compiles, which you will see in a few chapters. The shift
multiplies an index by the element size, and the add combines it with a base
address. When you meet it there, you will already know how to read it.

## Your task

Write `func_800381ac` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_800381ac(s32 a, s32 b) {
    return a * 4 + b;
}
```
