---
id: 88872540-bd12-4d8f-9660-5121c52133c2
slug: int64-carry-chain
title: The Carry Chain
difficulty: 3
concepts:
  - int64
  - arithmetic
  - carry
  - register-pairing
symbol: func_80221c94
hints:
  - "Here the `sltu` compares the two ORIGINAL low words — a borrow happens when the first is smaller — and the result is subtracted from the high difference."
  - "Don't be thrown by the high half being computed before the low half; scheduling reorders freely. It's still a one-line C function."
---

# When the halves must talk

Bitwise pairs don't interact; **addition does**. If the low words overflow
when added, a carry must ripple into the high sum — and this machine has no
add-with-carry instruction. Watch IDO build the carry by hand. Here's
`add64(a, b)`, returning the sum of two `s64`s:

```asm
sw     a0, 0(sp)      # homing, as always
sw     a1, 4(sp)
sw     a2, 8(sp)
sw     a3, 12(sp)
lw     t7, 4(sp)      # a-low
lw     t9, 12(sp)     # b-low
lw     t6, 0(sp)      # a-high
lw     t8, 8(sp)      # b-high
addu   v1, t7, t9     # low sum — the result's low word, done
sltu   at, v1, t9     # KEY: sum < an operand (unsigned)? then it wrapped
addu   v0, at, t6     # the carry joins the high half…
addu   v0, v0, t8     # …plus the other high word
jr     ra
nop
```

The star is `sltu at, v1, t9`. Unsigned addition wrapped *exactly when* the
sum is smaller than an operand — so this compare **is** the carry bit, a
clean 0 or 1 in `at`, ready to be added into the high half. No flags
register, no special instruction: a comparison conjures the carry from the
result. The whole chain — `addu`, `sltu`, `addu`, `addu` — is the machine
spelling of one `+`.

Subtraction plays the mirrored game. Low words subtract; a **borrow**
happened when the first low word was smaller than the second (`sltu` again,
different operands); and the borrow is *subtracted from* the high
difference. Same cast, roles reversed.

The target is that mirror. Two things to watch as you read it: which
registers the `sltu` compares (originals, not the result — that's how a
borrow is detected), and the order the halves are computed in, which the
scheduler has shuffled. Label the four loads and follow each half to its
destination register.

## Your task

Write `func_80221c94` to reproduce the target assembly.

<!-- solution -->
```c
s64 func_80221c94(s64 a, s64 b) {
    return a - b;
}
```
