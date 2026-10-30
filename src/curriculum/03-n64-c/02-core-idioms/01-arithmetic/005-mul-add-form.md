---
id: 0a87e675-5a53-41dd-81d8-f23b789e3aa2
slug: arithmetic-mul-add-form
title: "Shift Chains: The Add Form"
difficulty: 2
concepts:
  - arithmetic
  - strength-reduction
  - shifts
symbol: func_802a1f98
hints:
  - "`sll` by k gives 2^k times the input. The `addu` then adds one more copy of the original input."
  - "Work out what multiple of the input the register holds after each line. The final value is the one multiplier your C needs."
---

# 2^k plus one

The warmup showed you that IDO turns a multiply by a constant into a chain of
shifts, because a real multiply is slow. The next few lessons go through the
shapes these chains take, one at a time. You will decode them again and again
in your matching work.

The simplest group is constants one *above* a power of two. The compiler
shifts to get the power of two, then adds the original input once more. Here's
×5:

```asm
sll  v0, a0, 2     # v0 = x * 4
addu v0, v0, a0    # v0 = x*4 + x  =  x * 5
jr   ra
nop
```

The fingerprint is `sll` by `k`, followed by `addu` with the *original
argument register* as the second operand. That pair always means "2^k + 1
times the input". Shift by 2 then add is ×5, shift by 4 then add is ×17, and
so on.

Pay attention to *which* register the `addu` adds. If it is the unchanged
argument, you are adding 1× the input. Later chains add shifted copies
instead, and then the arithmetic changes, so always check.

The target below has the same two instructions with a different shift. Work
out the multiplier.

## Your task

Write `func_802a1f98` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_802a1f98(s32 x) {
    return x * 9;
}
```
