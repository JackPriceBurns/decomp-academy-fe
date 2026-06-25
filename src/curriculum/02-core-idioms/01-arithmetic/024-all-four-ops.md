---
id: arithmetic-all-four-ops
title: All Four Arithmetic Operators
difficulty: 2
concepts:
  - arithmetic
  - multiplication
  - division
  - chaining
  - operand-order
symbol: allfour5
hints:
  - Four instructions, four operations. The first two are independent — neither
    feeds the other — and they are later joined by the third. The fourth applies
    a final adjustment.
  - The third instruction is `add`, combining the two independent results into
    `r0`. The fourth is `subf`; remember `subf rD, rA, rB` is `rB − rA`.
---

# Every operator in one expression

This is the capstone of the arithmetic chain series. When `+`, `−`, `×`, and `÷`
all appear in a single expression, the compiler still follows the same rules: it
evaluates independent sub-expressions separately, then combines them in order of
dependency, one instruction at a time.

Consider `weighted_offset(p, q, r, s)`, which multiplies two values, then
divides that product by a third, and finally adds a fourth:

```asm
mullw   r0,r3,r4   # r0 = p * q
divw    r0,r0,r5   # r0 = r0 / r  =  (p * q) / r
add     r3,r6,r0   # r3 = s + r0  =  s + ((p * q) / r)
blr
```

Here `mullw` and `divw` are *dependent* — `divw` takes its dividend from the
`mullw` result stored in `r0`. The `add` then folds in `s` (`r6`). This is a
strictly sequential chain: each instruction feeds the next.

The target assembly for this lesson is arranged differently. Its first two
instructions are *independent* of each other (neither reads the other's output),
yet a third instruction combines their results, and a fourth applies the last
operation. Trace each register from first write to final use to reconstruct all
four operations.

## Your task

Write `allfour5`, taking five `int`s, to reproduce the assembly above.

<!-- starter -->
```c
int allfour5(int a, int b, int c, int d, int e) {
    return 0;
}
```

<!-- solution -->
```c
int allfour5(int a, int b, int c, int d, int e) {
    return a * b + c / d - e;
}
```
