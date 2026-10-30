---
id: c7367995-be99-46bc-a4d3-997c25cd92b3
slug: int64-add-constant
title: Adding a Constant to an s64
difficulty: 2
concepts:
  - int64
  - arithmetic
  - carry
  - immediates
symbol: func_801cd9e4
hints:
  - "The `sltiu` uses the same immediate as the `addiu`. That is the wrap check, comparing against the constant that was just added."
  - "Three arithmetic instructions make up one `+` in C. Read the constant from the `addiu`."
---

# The carry chain with an immediate

When you add a *constant* to an `s64`, the carry chain from the last lesson
gets shorter. The constant's low word is stored inside an `addiu`. Its high
word is zero, so it disappears completely. Here is `raise(x)`, which returns
`x + 40`:

```asm
sw     a0, 0(sp)      # homing: high…
sw     a1, 4(sp)      # …low
lw     v1, 4(sp)      # low half, straight into the result's low register
lw     v0, 0(sp)      # high half likewise
addiu  v1, v1, 40     # low + 40
sltiu  at, v1, 40     # wrapped? then the sum is BELOW what was added
addu   v0, v0, at     # add the carry into the high half
jr     ra
nop
```

The carry check works differently here. Adding 40 to an unsigned word wraps
*exactly when* the result is smaller than 40. So the compiler compares against
**the same immediate**, using `sltiu`, instead of against an operand register.
An `addiu`/`sltiu` pair that shares one constant always means *a constant
added to a 64-bit value*.

Because the constant's high word is zero, the high side needs only one
`addu`: the old high word plus the carry. No second operand appears. The
register chain in the last lesson used four instructions. This one uses the
same idea with one operand fewer.

Also notice where the loads went: directly into `v0` and `v1`. When the
result of the chain *is* the return value, the compiler builds it in the
return registers from the start.

The target adds a different constant. Two instructions contain it.

## Your task

Write `func_801cd9e4` to reproduce the target assembly.

<!-- solution -->
```c
s64 func_801cd9e4(s64 x) {
    return x + 1;
}
```
