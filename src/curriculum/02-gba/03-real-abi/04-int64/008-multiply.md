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
  - "The two `mov rX, #0` instructions before the `bl` are high halves being built. A zero fill means the value being widened was unsigned."
  - Two `u32` parameters and nothing returned. The 64-bit product goes to the global named by the `.word` row.
---

# __muldi3

ARM7TDMI in Thumb state has one multiply: `mul rd, rm`, 32 bits by 32 bits,
keeping the low 32 bits of the product. There is no `umull`, no high-half
multiply, nothing wider. A 64-bit product needs a widening 32x32 multiply plus
two cross-products and the carries between them, none of which this instruction
set provides, so gcc hands the whole thing to libgcc:

```asm
0        push      {lr}
2        bl        __muldi3-4
6        pop       {r2}
8        bx        r2
```

Two pairs are already in `r0:r1` and `r2:r3`, which is exactly where `__muldi3`
wants them, so the call is the entire function.

The interesting case is a **widening** multiply, where both operands are 32 bits
and only the product is 64. ARM state has an `smull` that does exactly that in
one instruction, and Thumb has no way to reach it:

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
then the same 64x64 helper runs. gcc 2.9 has no narrower helper and will not
reach for one - there is no version of this that costs less than a call. Note
also that only one operand carries a cast in the C that produced this; the other
is promoted implicitly and widened just the same.

The register shuffle in the middle is the compiler getting the two pairs into
`r0:r1` and `r2:r3` after having parked the arguments somewhere safe, and the
`push {r4, r5, lr}` pays for the two extra registers that shuffle needs.

Your target does a widening multiply as well, and the product does not stay in
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
