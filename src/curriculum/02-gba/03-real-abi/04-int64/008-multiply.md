---
id: f6d78ae2-7397-497f-87cb-e1b4879601c4
slug: gba-int64-multiply
title: A 64-bit Multiply Is a Call
difficulty: 4
concepts:
  - int64
  - libgcc
  - globals
symbol: func_083aabd4
hints:
  - "The two `mov rX, #0` instructions before the `bl` build high halves. A
    zero fill means the value being widened was unsigned."
  - It takes two `u32` parameters and returns nothing. The 64-bit product is
    stored in the global named by the `.word` row.
---

# __muldi3

In Thumb state, the ARM7TDMI has one multiply instruction: `mul rd, rm`. It
multiplies 32 bits by 32 bits and keeps the low 32 bits of the product. There is
no `umull` and no multiply that returns the high half. A 64-bit product needs a
widening 32x32 multiply, two cross-products, and the carries between them. This
instruction set has none of those, so gcc passes the whole job to libgcc:

```asm
0        push      {lr}
2        bl        __muldi3-4
6        pop       {r2}
8        bx        r2
```

The two pairs are already in `r0:r1` and `r2:r3`, which is where `__muldi3`
expects them, so the call is the whole function.

A **widening** multiply is different. Both operands are 32 bits and only the
product is 64. ARM state has an `smull` that does this in one instruction, but
Thumb code cannot use it:

```asm
0        push      {r4, r5, lr}
2        mov       r4, r0
4        mov       r2, r1
6        asr       r5, r4, #31
8        asr       r3, r2, #31
10       mov       r1, r5
12       mov       r0, r4
14       bl        __muldi3-4
18       pop       {r4, r5}
20       pop       {r2}
22       bx        r2
```

`asr r5, r4, #31` and `asr r3, r2, #31` widen both operands to full pairs, and
then the same 64x64 helper runs. gcc 2.9 has no narrower helper and does not use
one, so every version of this costs at least a call. Also, in the C that
produced this listing, only one operand has a cast. The other is promoted
implicitly and widened in the same way.

The register moves in the middle get the two pairs into `r0:r1` and `r2:r3`,
after the compiler first moved the arguments into other registers. The
`push {r4, r5, lr}` saves the two extra registers that those moves need.

Your target also does a widening multiply, and the product does not stay in
registers. The fills before the `bl` tell you what was widened.

## Your task

Write `func_083aabd4` to reproduce the target assembly.

<!-- context -->
```c
extern u64 gAcc;
```

<!-- solution -->
```c
void func_083aabd4(u32 a, u32 b) {
    gAcc = (u64)a * b;
}
```
