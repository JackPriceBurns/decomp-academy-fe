---
id: workflow-add-sub
title: An Add Then a Subtract
difficulty: 1
concepts:
  - arithmetic
  - chaining
  - operand-order
symbol: addsub3
hints:
  - Each operation becomes its own instruction, evaluated left-to-right.
  - The add lands in a scratch register; the `subf` then subtracts the third
    argument from it.
---

# Chaining two instructions

So far one expression has meant one instruction. But `a + b - c` is **two**
operations, so it compiles to **two** arithmetic instructions, evaluated
left-to-right. The first computes `a + b`; the second subtracts `c` from that
running result:

```asm
add  r0, r3, r4   # r0 = a + b
subf r3, r5, r0   # r3 = r0 - r5  =  (a + b) - c
blr
```

Notice the threading: the `add` writes its sum into a scratch register `r0`, and
the `subf` reads `r0` back as one of its sources. The intermediate value of
`a + b` lives in `r0` just long enough to feed the next step, then `r3` gets the
final answer ready to return.

And the `subf` reversal from the subtraction lesson still applies:
`subf r3, r5, r0` computes `r0 - r5`, i.e. `(a + b) - c` — not the other way
around.

## Your task

Write `addsub3`, returning `a + b - c` for three `int`s.

<!-- starter -->
```c
int addsub3(int a, int b, int c) {
    return 0;
}
```

<!-- solution -->
```c
int addsub3(int a, int b, int c) {
    return a + b - c;
}
```
