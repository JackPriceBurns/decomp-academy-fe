---
id: 98efb048-43f0-5754-a0de-e49c58d3de76
slug: int64-shift
title: Shifts Call an Intrinsic Too
difficulty: 2
concepts:
  - 64-bit
  - shifts
  - intrinsics
symbol: func_8023bec0
hints:
  - A variable 64-bit shift has no single instruction, so it calls a helper just like division.
  - "Look for `bl __shl2i`; the shift amount is moved into r5 (`mr r5,r6`) before the call."
  - The helper name (`__shl2i` vs `__shr2u`) tells you the shift direction; the operands are the two parameters.
---

# Shifting a value wider than the shifter

A single shift instruction reaches across 32 bits, so it can't carry bits over
the seam between the two halves of a `u64`. That's why a variable-distance 64-bit
shift hands off to a runtime helper, the same shape division uses, with a
prologue, a `bl`, and an epilogue:

```asm
stwu   r1, -16(r1)
mflr   r0
mr     r5, r6         # marshal the shift amount into r5
stw    r0, 20(r1)
bl     __shl2i        # 64-bit shift-left helper
lwz    r0, 20(r1)
mtlr   r0
addi   r1, r1, 16
blr
```

Here `bl __shl2i` is the left-shift helper. Right shifts split by signedness:
`__shr2u` for a logical (unsigned) shift and `__shr2i` for an arithmetic (signed)
one. The `mr r5, r6` just ahead of the call is the compiler lining up the
arguments the helper wants, dropping the shift distance into place, much as a
divide marshals its operands.

That rounds out the short list of 64-bit operations the hardware can't do inline.
Divide, modulo, and shift are the three, and each one announces itself with a
`bl __…2i` or `__…2u`. Add, subtract, multiply, and the bitwise ops coming up
next all stay inline.

## Your task

Write `func_8023bec0` to match the target.

<!-- solution -->
```c
u64 func_8023bec0(u64 a, u64 b) {
    return a << b;
}
```
