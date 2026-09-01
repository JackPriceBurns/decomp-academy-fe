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
  - Four loads at +0, +4, +8 and +12, one `sub`/`sbc` pair, two stores at +16
    and +20. Three 64-bit slots reached through one base register.
  - One parameter, an `s64 *`, and nothing returned. The third slot receives the
    first slot minus the second.
---

# sub, then sbc

Subtraction mirrors addition. `sub` clears the carry flag when the low half
needs to borrow, and `sbc` subtracts that borrow along with the high halves.
Low half first again, for the same reason: the borrow only travels upward.

The pair the result lands in is decided by Thumb's two-operand encoding, and it
is not always the pair you want:

```asm
0        sub       r2, r0
2        sbc       r3, r1
4        mov       r1, r3
6        mov       r0, r2
8        bx        lr
```

The subtraction happens in `r2:r3`, because `sub`/`sbc` overwrite their left
operand and the left operand of this subtraction is the second argument. The
result then has to be carried home to `r0:r1` with two `mov`s. Expect that
trailing pair of moves whenever a 64-bit expression starts from a value that is
already sitting outside the return pair.

Now watch what happens when one operand is a constant:

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

No `sub` and no `sbc` anywhere. The compiler rewrote the subtraction as an
addition of a negative constant, then built that constant as a pair:
`mov r0, #1` / `neg r0, r0` gives -1 in the low half, and `asr r1, r0, #31`
smears its sign bit across the high half. Only then does the familiar
`add`/`adc` run. `sub`/`sbc` survive only when the value being **subtracted** is
one the compiler cannot fold: a constant on the right gets negated at compile
time and the whole expression turns into an addition, while a constant on the
*left* leaves the `sub`/`sbc` in place, because that is not the operand being
negated.

Your target's operands are both in memory, and the offsets tell you how they are
laid out.

## Your task

Write `func_08394690` to reproduce the target assembly.

<!-- solution -->
```c
void func_08394690(s64 *p) {
    p[2] = p[0] - p[1];
}
```
