---
id: fdc4bec5-989e-4411-b139-cba55196ba69
slug: gba-int64-subtract
title: Borrowing
difficulty: 3
concepts:
  - int64
  - arithmetic
  - memory
symbol: func_08394690
hints:
  - There are four loads at +0, +4, +8 and +12, one `sub`/`sbc` pair, and two
    stores at +16 and +20. That is three 64-bit slots, all reached through one
    base register.
  - It takes one parameter, an `s64 *`, and returns nothing. The third slot gets
    the first slot minus the second.
---

# sub, then sbc

Subtraction works the same way as addition. `sub` clears the carry flag when the
low half needs to borrow, and `sbc` subtracts that borrow along with the high
halves. The low half goes first again, for the same reason: the borrow only
moves upward.

Thumb's two-operand encoding decides which pair holds the result, and it is not
always the pair you want:

```asm
0        sub       r2, r0
2        sbc       r3, r1
4        mov       r1, r3
6        mov       r0, r2
8        bx        lr
```

The subtraction happens in `r2:r3`. `sub`/`sbc` overwrite their left operand,
and the left operand of this subtraction is the second argument. The result
then has to be moved back to `r0:r1` with two `mov`s. Expect those two moves at
the end whenever a 64-bit expression starts from a value that is outside the
return pair.

Here is what happens when one operand is a constant:

```asm
0        mov       r3, r1
2        mov       r2, r0
4        mov       r0, #1
6        neg       r0, r0
8        asr       r1, r0, #31
10       add       r0, r2
12       adc       r1, r3
14       bx        lr
```

There is no `sub` and no `sbc` in this listing. The compiler rewrote the
subtraction as an addition of a negative constant, then built that constant as a
pair. `mov r0, #1` / `neg r0, r0` puts -1 in the low half, and
`asr r1, r0, #31` copies its sign bit into every bit of the high half. After
that, the usual `add`/`adc` runs.

`sub`/`sbc` stay only when the compiler cannot fold the value being
**subtracted**. A constant on the right is negated at compile time, and the
whole expression becomes an addition. A constant on the *left* leaves the
`sub`/`sbc` in place, because it is not the operand that would be negated.

Both of your target's operands are in memory, and the offsets tell you how they
are laid out.

## Your task

Write `func_08394690` to reproduce the target assembly.

<!-- solution -->
```c
void func_08394690(s64 *p) {
    p[2] = p[0] - p[1];
}
```
