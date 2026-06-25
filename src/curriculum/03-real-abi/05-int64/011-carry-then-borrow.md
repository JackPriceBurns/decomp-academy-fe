---
id: int64-carry-then-borrow
title: "Chaining: Carry Into a Borrow"
difficulty: 3
concepts:
  - 64-bit
  - arithmetic
  - carry
  - borrow
  - chaining
symbol: addsub_64
hints:
  - Two 64-bit operations back to back — an `addc`/`adde` pair, then a `subfc`/`subfe` pair on the running result.
  - The carry chain of the add and the borrow chain of the subtract don't interact; each pair manages its own flag, low word then high.
  - Three `u64` parameters; the body is the natural left-to-right combination of all three with no parentheses needed.
---

# Stacking two carry chains

You've seen the 64-bit add (`addc`/`adde`) and the 64-bit subtract
(`subfc`/`subfe`) on their own. Real code rarely stops at one operation — it
threads several together, and each 64-bit step keeps its own low-then-high,
flag-between-them shape. The trick to reading a chain is to find each *pair*: a
carrying instruction on the low word followed by its extended partner on the
high word is **one** arithmetic operation.

Consider `accumulate(p, q, r)`, which adds the first two 64-bit values and then
adds a third:

```asm
addc   r4, r4, r6     # (p + q) low,  carry out
adde   r0, r3, r5     # (p + q) high, + carry   -> running result in r0:r4
addc   r4, r8, r4     # (... + r) low,  carry out
adde   r3, r7, r0     # (... + r) high, + carry  -> final result in r3:r4
blr
```

Read it as two stacked pairs. The first `addc`/`adde` builds `p + q` into a
register pair; the second `addc`/`adde` takes that pair as its input and folds
in `r`. Notice the running high word lives in a scratch register (`r0`) between
the two steps, and only the *last* `adde` writes the final high word back to
`r3`.

The target for this lesson mixes the two operations you know: one carrying pair
adds, the next carrying pair subtracts. Each flag is consumed by its own
extended instruction — the carry from the `addc` never reaches the `subfe`.
Find the two pairs, read whether each is an `add` or a `subf`, and reconstruct
the expression.

## Your task

Write `addsub_64`, taking three `u64`s, to reproduce the assembly above.

<!-- starter -->
```c
u64 addsub_64(u64 a, u64 b, u64 c) {
    return 0;
}
```

<!-- solution -->
```c
u64 addsub_64(u64 a, u64 b, u64 c) {
    return a + b - c;
}
```
