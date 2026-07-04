---
id: 06169f42-ba48-5a3a-84a5-7150a5319255
slug: arithmetic-sub-add
title: A Subtract Then an Add
difficulty: 2
concepts:
  - arithmetic
  - chaining
  - operand-order
symbol: subadd3
hints:
  - The `subf` runs first and leaves `a - b` in a scratch register.
  - Remember `subf rD, rA, rB` computes `rB - rA`, so `subf r0, r4, r3` is
    `a - b`.
---

# Threading a `subf` into a chain

Let us bring the subtract quirk into a chain. You have got two operations now, so
two arithmetic instructions, and the first hands its output to the second. Keep
an eye on `r0`. It carries the running result until the last instruction finally
writes `r3`.

Take `blend(p, q, r)`. It mixes an add with a subtract.

```asm
add  r0, r3, r4   # r0 = p + q
subf r3, r5, r0   # r3 = r0 - r5  =  (p + q) - r
blr
```

Here is the bit that bites. **`subf rD, rA, rB` computes `rB − rA`**, never
`rA − rB`. Run that through `subf r3, r5, r0` and you get `r0 − r5`, which is
`(p + q) − r`. The habit to build is flipping the subtrahend and minuend every
single time a `subf` goes by.

Now, addition can be regrouped because it is associative. Subtraction cannot. So
the compiler leaves your left-to-right C order intact, and the instructions line
up one for one with the operations you wrote. What still misleads you is the
reversed operands inside `subf`.

So with this lesson's target, two things decide it. Which instruction goes first?
And which argument is `rA` and which is `rB` in that `subf`?

## Your task

Write `subadd3`, taking three `int`s, to reproduce the assembly above.

<!-- starter -->
```c
int subadd3(int a, int b, int c) {
    return 0;
}
```

<!-- solution -->
```c
int subadd3(int a, int b, int c) {
    return a - b + c;
}
```
