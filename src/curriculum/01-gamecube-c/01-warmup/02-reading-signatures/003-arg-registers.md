---
id: 42ce0d09-a1ed-53d1-9d37-cb7190a09d90
slug: signatures-arg-registers
title: Read an Argument Off the Registers
difficulty: 1
concepts:
  - calling-convention
  - registers
  - arguments
symbol: func_800b3834
hints:
  - Arguments map to r3, r4, r5, r6 in order — read the `mr`'s source register
    and count to find its position.
  - A single `mr r3, rN` copies the Nth argument into the return register; no
    other work is needed.
---

# Your first one from scratch

No starter this time — an empty editor, and `func_800b3834` up in the header.
Everything else comes from the target.

Look at it: a single `mr` into `r3`, then `blr`. `mr` ("move register") copies
one register into another, and `r3` is the return register — so this function
takes one of its arguments and hands it back untouched. The only thing left to
work out is *which* one.

That's pure register-counting. Take a function whose body is:

```asm
mr   r3, r5
blr
```

`r5` is the **3rd** argument register, so this returns the third parameter. And
since the value it wants lives in `r5`, there must be a first and second
argument ahead of it — the signature has three parameters, not one:

```c
int third(int a, int b, int c) {
    return c;
}
```

Now read your own target the same way. Which register does its `mr` copy from?
Count from `r3`, and that tells you both how many arguments to declare and
which one to return.

## Your task

Write `func_800b3834` to reproduce the assembly above.

<!-- solution -->
```c
int func_800b3834(int a, int b, int c, int d) {
    return d;
}
```
