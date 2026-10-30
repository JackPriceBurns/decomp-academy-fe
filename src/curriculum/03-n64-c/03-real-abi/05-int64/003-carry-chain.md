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
  - "Here the `sltu` compares the two ORIGINAL low words. A borrow happens when the first one is smaller, and the result is subtracted from the high difference."
  - "The high half is computed before the low half here. That is only the scheduler reordering instructions. It is still a one-line C function."
---

# When the halves affect each other

In a bitwise operation the two halves stay separate. **Addition is
different.** If adding the low words overflows, a carry has to go into the
high sum. This machine has no add-with-carry instruction, so IDO builds the
carry by hand. Here is `add64(a, b)`, which returns the sum of two `s64`s:

```asm
sw     a0, 0(sp)      # homing, as always
sw     a1, 4(sp)
sw     a2, 8(sp)
sw     a3, 12(sp)
lw     t7, 4(sp)      # a-low
lw     t9, 12(sp)     # b-low
lw     t6, 0(sp)      # a-high
lw     t8, 8(sp)      # b-high
addu   v1, t7, t9     # low sum: the result's low word, done
sltu   at, v1, t9     # KEY: sum < an operand (unsigned)? then it wrapped
addu   v0, at, t6     # the carry is added to the high half…
addu   v0, v0, t8     # …plus the other high word
jr     ra
nop
```

The key instruction is `sltu at, v1, t9`. An unsigned addition wrapped around
*exactly when* the sum is smaller than one of the operands. So this compare
**is** the carry bit. It puts a 0 or 1 in `at`, ready to be added into the
high half. There is no flags register and no special instruction: a
comparison works out the carry from the result. The whole chain (`addu`,
`sltu`, `addu`, `addu`) is how the machine does one `+`.

Subtraction works the same way in reverse. The low words are subtracted. A
**borrow** happened when the first low word was smaller than the second
(`sltu` again, with different operands). The borrow is then *subtracted from*
the high difference. The same instructions appear, with their roles reversed.

The target is the subtraction version. Watch two things as you read it.
First, check which registers the `sltu` compares. It uses the original words
instead of the result, because that is how a borrow is detected. Second,
notice the order in which the halves are computed, which the scheduler has
changed. Label the four loads and follow each half to its destination
register.

## Your task

Write `func_80221c94` to reproduce the target assembly.

<!-- solution -->
```c
s64 func_80221c94(s64 a, s64 b) {
    return a - b;
}
```
