---
id: cc9a1107-f962-5650-b45a-3536ac57bc4d
slug: int64-carry-then-borrow
title: "Chaining: Carry Into a Borrow"
difficulty: 3
concepts:
  - 64-bit
  - arithmetic
  - carry
  - borrow
  - chaining
symbol: func_80326844
hints:
  - Two 64-bit operations back to back — an `addc`/`adde` pair, then a `subfc`/`subfe` pair on the running result.
  - The carry chain of the add and the borrow chain of the subtract don't interact; each pair manages its own flag, low word then high.
  - Three `u64` parameters; the body is the natural left-to-right combination of all three with no parentheses needed.
---

# Stacking two carry chains

You've used the 64-bit add (`addc`/`adde`) and the 64-bit subtract
(`subfc`/`subfe`) one at a time. Most functions chain several steps. The shape
per step stays fixed: low word first, high word second, a flag in between. Read a
chain by finding its pairs. A carrying low-word instruction and its extended
high-word partner count as one operation.

Here is `accumulate(p, q, r)`. It adds the first two 64-bit values and folds in
a third:

```asm
addc   r4, r4, r6     # (p + q) low,  carry out
adde   r0, r3, r5     # (p + q) high, + carry   -> running result in r0:r4
addc   r4, r8, r4     # (... + r) low,  carry out
adde   r3, r7, r0     # (... + r) high, + carry  -> final result in r3:r4
blr
```

Two pairs. The first `addc`/`adde` makes `p + q` in a register pair. The second
`addc`/`adde` adds `r` to it. The high word waits in scratch register `r0`
between the steps. Only the last `adde` writes the high word to `r3`.

Your target uses both operations. First pair adds. Second pair subtracts. Each
pair keeps its own flag. The `addc` carry never reaches the `subfe`. Split the
assembly into two pairs. Label each `add` or `subf`. Then write the expression.

## Your task

Write `func_80326844` to reproduce the assembly above.

<!-- solution -->
```c
u64 func_80326844(u64 a, u64 b, u64 c) {
    return a + b - c;
}
```
