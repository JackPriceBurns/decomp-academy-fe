---
id: workflow-sub-add
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

Now mix the subtract quirk into a chain. `a - b + c` is a `subf` followed by an
`add`, evaluated left-to-right — the running result flows from one into the next:

```asm
subf r0, r4, r3   # r0 = r3 - r4  =  a - b
add  r3, r5, r0   # r3 = c + (a - b)
blr
```

The `subf` goes first and lands `a - b` in scratch register `r0`. Keep the
reversal in mind: `subf r0, r4, r3` is `r3 - r4`, i.e. `a - b`, **not** `b - a`.
The `add` then folds in `c`, putting the final value in `r3` to return.

Unlike the pure-add chain, there's no reassociation surprise here — subtraction
isn't associative, so the compiler keeps the left-to-right order you wrote.

## Your task

Write `subadd3`, returning `a - b + c` for three `int`s.

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
