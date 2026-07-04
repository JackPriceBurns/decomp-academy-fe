---
id: bebf5fc1-7160-5ff5-9ae1-98b5ab3a47b9
slug: arithmetic-mul-add
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

# Chaining off a multiply

`mullw rD, rA, rB` is just *multiply low word*. It computes `rA * rB` and keeps
the lower 32 bits, which is exactly what a C `int` multiply means. The operands
aren't reversed the way `subf`'s are, so what you read is what you get.

Most of the time a multiply isn't the whole story; something consumes its result.
That gives the familiar chain where `mullw` writes a scratch register and the
very next instruction reads it back.

`scale_offset(p, q, r)` is a handy stand-in. It multiplies two of its arguments,
then subtracts the third:

```asm
mullw r0, r3, r4   # r0 = p * q
subf  r3, r5, r0   # r3 = r0 - r5  =  (p * q) - r
blr
```

So the product lands in `r0`, and `subf` treats `r0` as the minuend before
subtracting `r5`. (Watch out, `subf rD, rA, rB` computes `rB − rA`, which is why
`subf r3, r5, r0` yields `r0 − r5`.)

Your target keeps the `mullw` but follows it with something other than a
subtract. Decide what value the multiply hands off, then read what the second
instruction does to it.

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
