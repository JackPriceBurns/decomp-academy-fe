---
id: fe163eba-f0dc-40d8-a021-b211fcb728d2
slug: arithmetic-reciprocal-divide
title: Division Without a Divide
difficulty: 3
concepts:
  - strength-reduction
  - divide
  - optimization
symbol: func_803858f8
hints:
  - This whole cluster is a divide by a constant — the compiler swapped the slow
    `divw` for a multiply by a fixed reciprocal.
  - The constant that `lis`/`addi` build is about 2^(32+s) / N, where s is the
    count on any `srawi`; work back to N, or recognise the shape and test a small
    divisor.
---

# Division without a divide

Back in the warm-up, `divConst(a) = a / 3` compiled to a tidy pair:

```asm
li   r0, 3
divw r3, r3, r0
```

That lesson quietly dialled the optimizer down. The rest of this course runs at
`-O4,p` — the setting real games are built with — and at that level MWCC
refuses to spend a slow hardware `divw` on a constant divisor. Instead it
multiplies by a fixed-point *reciprocal*.

Dividing by `N` is the same as multiplying by `1 / N`, but an integer can't
hold a fraction. So the compiler scales it up: it picks a big whole number `M`
close to `2^32 / N`, multiplies your value by it, then divides the product back
down by `2^32`. That last step is free: `mulhw` ("multiply high word") keeps
the top 32 bits of the 64-bit product, and dropping the low 32 bits *is* a
divide by `2^32`. The net effect is `a × (2^32 / N) ÷ 2^32 = a / N`.

The divisor `N` — the number you actually have to write — never appears in the
assembly. You recover it from the big constant `M`.

## Reading the constant back

Here's that same `a / 3`, now at `-O4,p`:

```asm
lis   r4, 21845      # r4 = 21845 * 2^16 = 1,431,633,920
addi  r0, r4, 21846  # r0 = 1,431,633,920 + 21846 = 1,431,655,766
mulhw r3, r0, r3     # r3 = top 32 bits of r0 * a
srwi  r0, r3, 31     # sign bit: 1 if negative, else 0
add   r3, r3, r0     # toward-zero rounding fixup
```

The first two lines build `M`. `lis` loads the *top* half of the register — a
left-shift by 16, i.e. a multiply by `2^16` (65536) — and `addi` adds the
bottom part, so `M = 21845 × 2^16 + 21846 = 1,431,655,766`. To get the divisor,
undo the reciprocal by dividing `2^32` by it:

`N ≈ 2^32 / M = 4,294,967,296 / 1,431,655,766 = 3.0` → the divisor is **3**.

Ignore the `srwi 31` + `add` at the end. That's not part of the reciprocal —
it's the toward-zero rounding fixup from the signed power-of-two divide: add
one, but only when the value is negative.

## When the divisor needs an extra shift

A divisor like 3 fits its reciprocal inside `2^32`. Bigger divisors don't — `M`
would have to exceed `2^32`, which no longer fits in 32 bits. The compiler's
fix is to scale `M` up by a few extra bits (so it approximates `2^32` times
some small power of two, divided by `N`) and then shift the product back down
by that many bits with an `srawi`.

So an `srawi` in the sequence is your signal: its shift count, call it `s`,
tells you the reciprocal was built from `2^(32 + s)` instead of plain `2^32`.
Here's `a / 17`:

```asm
lis   r4, 30840      # r4 = 30840 * 2^16 = 2,021,130,240
addi  r0, r4, 30841  # r0 = 2,021,130,240 + 30841 = 2,021,161,081
mulhw r0, r0, r3
srawi r0, r0, 3      # s = 3
srwi  r3, r0, 31     # sign bit
add   r3, r0, r3     # rounding fixup
```

- `M = 30840 × 2^16 + 30841 = 2,021,161,081`.
- The `srawi 3` means `s = 3`, so the reciprocal used `2^(32 + 3) = 2^35 =
  34,359,738,368`.
- `N ≈ 34,359,738,368 / 2,021,161,081 = 17.0` → the divisor is **17**.

So: `N ≈ 2^(32 + s) / M`, where `s` is the count on the `srawi` (and `s = 0`
when there is none). `M` only approximates the true reciprocal, so if the
answer lands a hair off a whole number, round to it.

## Your task

Your target builds `M` from its own `lis`/`addi` pair and has a single `srawi`.
Compute `M = top × 2^16 + bottom`, read `s` off that shift, and divide
`2^(32 + s)` by `M` to find the divisor it hides.

Write `func_803858f8` to reproduce the target assembly.

<!-- solution -->
```c
int func_803858f8(int a) {
    return a / 5;
}
```
