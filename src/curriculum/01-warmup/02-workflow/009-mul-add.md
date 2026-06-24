---
id: workflow-mul-add
title: Multiply Then Add
difficulty: 1
concepts:
  - arithmetic
  - multiplication
  - chaining
symbol: muladd3
hints:
  - "`mullw rD, rA, rB` computes `rA * rB` and writes the lower 32 bits into `rD`."
  - The `add` uses the `mullw` result as one of its sources — trace which register
    carries that intermediate value into the second instruction.
---

# Introducing `mullw`

The `mullw` (*multiply low word*) instruction multiplies two 32-bit signed integers
and keeps the lower 32 bits of the result — the same semantics as C `int`
multiplication. Its operand order is straightforward:
**`mullw rD, rA, rB` computes `rA * rB`**. No reversal, no surprises.

When multiplication is followed by a second operation, the pattern looks like
the chains you have already seen: `mullw` writes an intermediate result into a
scratch register, and the next instruction picks it up.

As an example, consider `scale_offset(p, q, r)`, which scales two values and then
shifts by a third:

```asm
mullw r0, r3, r4   # r0 = p * q
subf  r3, r5, r0   # r3 = r0 - r5  =  (p * q) - r
blr
```

`mullw` stores the product in `r0`. The `subf` then reads `r0` as its minuend and
subtracts `r5` from it. (Recall: `subf rD, rA, rB` computes `rB − rA`, so
`subf r3, r5, r0` gives `r0 − r5`.)

The target assembly for this lesson uses a different second operation. Read the
target asm above — identify what `mullw` produces, then determine what the
following instruction does with that product.

## Your task

Write `muladd3`, taking three `int`s, to reproduce the assembly above.

<!-- starter -->
```c
int muladd3(int a, int b, int c) {
    return 0;
}
```

<!-- solution -->
```c
int muladd3(int a, int b, int c) {
    return a * b + c;
}
```
