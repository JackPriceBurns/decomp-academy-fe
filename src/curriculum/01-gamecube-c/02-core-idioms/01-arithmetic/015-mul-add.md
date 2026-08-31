---
id: bebf5fc1-7160-5ff5-9ae1-98b5ab3a47b9
slug: arithmetic-mul-add
title: Multiply Then Add
difficulty: 1
concepts:
  - arithmetic
  - multiplication
  - chaining
symbol: func_803afd7c
hints:
  - "`mullw rD, rA, rB` computes `rA * rB` and writes the lower 32 bits into `rD`."
  - The `add` uses the `mullw` result as one of its sources — trace which register
    carries that intermediate value into the second instruction.
---

# Chaining off a multiply

`mullw rD, rA, rB` is *multiply low word*: it computes `rA * rB` and keeps the
lower 32 bits, which is all a C `int` multiply means. The operands aren't
reversed the way `subf`'s are — what you read is what you get.

Most of the time a multiply isn't the whole story; something consumes its
result. That gives the familiar chain: `mullw` writes a scratch register and
the next instruction reads it.

Take `scale_offset(p, q, r)` — multiply two arguments, then subtract the third:

```asm
mullw r0, r3, r4   # r0 = p * q
subf  r3, r5, r0   # r3 = r0 - r5  =  (p * q) - r
blr
```

The product lands in `r0`, and `subf` treats `r0` as the minuend before
subtracting `r5`. (Remember, `subf rD, rA, rB` computes `rB − rA`, which is why
`subf r3, r5, r0` yields `r0 − r5`.)

Your target keeps the `mullw` but follows it with something other than a
subtract. Figure out what value the multiply hands off, then read what the
second instruction does with it.

## Your task

Write `func_803afd7c` to reproduce the assembly above.

<!-- solution -->
```c
int func_803afd7c(int a, int b, int c) {
    return a * b + c;
}
```
