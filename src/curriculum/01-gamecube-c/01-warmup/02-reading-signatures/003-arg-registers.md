---
id: 42ce0d09-a1ed-53d1-9d37-cb7190a09d90
slug: signatures-arg-registers
title: Read an Argument Off the Registers
difficulty: 1
concepts:
  - calling-convention
  - registers
  - arguments
symbol: pick_arg
hints:
  - Arguments map to r3, r4, r5, r6 in order — read the `mr`'s source register
    and count to find its position.
  - A single `mr r3, rN` copies the Nth argument into the return register; no
    other work is needed.
---

# Your first one from scratch

No starter this time — just an empty editor and the name `pick_arg` up in the
header. Everything else you read off the target.

Look at it: a single `mr` into `r3`, then `blr`. `mr` ("move register") copies one
register straight into another, and `r3` is the return register — so this function
takes one of its arguments and hands it right back, untouched. The only thing left
to work out is *which* argument.

That is pure register-counting. Take a function whose body is:

```asm
mr   r3, r5
blr
```

`r5` is the **3rd** argument register, so this returns its third parameter. And
because the value it wants lives in `r5`, there must be a first and second
argument sitting ahead of it — so the signature has three parameters, not one:

```c
int third(int a, int b, int c) {
    return c;
}
```

Now read your own target the same way. Which register does its `mr` copy from?
Count from `r3`, and that tells you both how many arguments to declare and which
one to return.

## Your task

Write `pick_arg` to reproduce the assembly above.

<!-- solution -->
```c
int pick_arg(int a, int b, int c, int d) {
    return d;
}
```
