---
id: fe163eba-f0dc-40d8-a021-b211fcb728d2
slug: arithmetic-reciprocal-divide
title: Division Without a Divide
difficulty: 3
concepts:
  - strength-reduction
  - divide
  - optimization
symbol: recipDiv
hints:
  - This whole cluster is a divide by a constant — the compiler swapped the slow
    `divw` for a multiply by a fixed reciprocal.
  - The constant that `lis`/`addi` build is about 2^(32+s) / N, where s is the
    count on any `srawi`; work back to N, or recognise the shape and test a small
    divisor.
---

# Division without a divide

Back in the intro, `divConst(a) = a / 3` compiled to a tidy pair:

```asm
li   r0, 3
divw r3, r3, r0
```

That lesson quietly dialled the optimizer down. The rest of this course runs at
`-O4,p` — the setting the real game was built with — and at that level MWCC
refuses to spend a slow hardware `divw` on a constant divisor. Instead it
multiplies by a fixed-point *reciprocal*. Here is that exact `a / 3` again:

```asm
lis   r4, 21845      # r4 = 0x5555_0000
addi  r0, r4, 21846  # r0 = 0x5555_5556  ≈ 2^32 / 3
mulhw r3, r0, r3     # top 32 bits of r0 * a
srwi  r0, r3, 31     # 1 when the result is negative, else 0
add   r3, r3, r0     # nudge back toward zero
```

`mulhw` ("multiply high word") keeps the *top* 32 bits of the 64-bit product, so
multiplying by `≈ 2^32 / 3` and taking that high half divides by 3. The
`srwi 31` + `add` is the same toward-zero rounding fixup you met on the signed
power-of-two divide. It's strength reduction once more — the trick that turns
`* 8` into a shift, now aimed at division by *any* constant.

Reading it back: the constant the code assembles is roughly `2^(32+s) / N`, where
`s` is the count on any `srawi` in the sequence (zero when there's none). Recover
`N` from that — or, quicker, recognise the shape and try the small divisor it
points at.

The target below divides by a different constant, and its sequence carries an
extra `srawi`.

## Your task

Write `recipDiv`, taking an `int a`, to reproduce the target assembly.

<!-- starter -->
```c
int recipDiv(int a) {
    return 0;
}
```

<!-- solution -->
```c
int recipDiv(int a) {
    return a / 5;
}
```
