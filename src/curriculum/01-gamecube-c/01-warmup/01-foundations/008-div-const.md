---
id: 104e5d1c-2dbc-444e-87ce-7932687a7b55
slug: foundations-div-const
title: Dividing by a Constant
difficulty: 1
concepts:
  - arithmetic
  - divide
symbol: divConst
opt: "O4,s"
hints:
  - There's no divide-immediate, so the constant is loaded with `li`, then `divw`
    does the division.
  - The number the `li` loads is the divisor.
---

# `li` the divisor, then `divw`

Division is the one basic operation with no immediate form — nothing lets you
divide "by this number" from inside the instruction. So to divide by a constant,
the compiler first drops it into a register with `li` ("load immediate"), then
runs the real divide, `divw` ("divide word").

`sixth(n) = n / 6` comes out as a plain pair:

```asm
li   r0, 6         # load the divisor
divw r3, r3, r0    # r3 = r3 / 6
blr
```

The `li` names the divisor outright — it's the number being loaded. `divw` does
signed division and throws the remainder away.

> We've eased this lesson's optimizer back a notch to keep the divide this
> honest. At the setting the rest of the course runs under, dividing by a constant
> turns into something far stranger — you'll pull that apart later.

## Your task

Write `divConst`, taking an `int a`, to reproduce the target assembly.

<!-- starter -->
```c
int divConst(int a) {
    return 0;
}
```

<!-- solution -->
```c
int divConst(int a) {
    return a / 3;
}
```
