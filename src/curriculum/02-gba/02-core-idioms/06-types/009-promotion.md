---
id: d05499a5-e7c8-4727-905c-677b97c5f60d
slug: gba-types-promotion
title: Everything Becomes an int
difficulty: 3
concepts:
  - narrow-types
  - promotion
  - stores
symbol: func_081d5f40
hints:
  - Each pair of load and store is one statement, and the instruction between
    them is the arithmetic. Nothing narrows the result, so ask which construct
    in C does the narrowing for free.
  - "A `u8 *` and an `s32`, no return value, and two statements that read a
    byte, combine it with the `s32`, and write it back."
---

# Promotion, and where it stops costing anything

C does not have 8-bit arithmetic. Every `u8` or `s16` in an expression is
promoted to `int` first, and the operation happens at full width. On a machine
with 32-bit registers that costs nothing, which is why you have already seen
byte loads feeding a plain `add` with no masking in sight.

The compiler only has to behave *as if* the promotion happened. Where the result
is about to be narrowed again, it takes the shortcut. Look at what changes when
an intermediate result is parked in a `u8` variable:

```asm
0        ldrb      r0, [r0, #0]
2        add       r0, r1
4        lsl       r0, #24
6        lsr       r0, #23
8        bx        lr
```

and what happens when the same value stays in the expression:

```asm
0        ldrb      r0, [r0, #0]
2        add       r0, r1
4        lsl       r0, #1
6        bx        lr
```

Both compute a byte plus an `s32` and then double it. The second one doubles
with a single `lsl #1`. The first assigns the sum to a `u8` on the way, and that
assignment is a truncation the compiler has to honour, because the doubling must
see the wrapped value.

Look closely at how it pays for it. Truncating to a byte is `lsl #24` then
`lsr #24`, and doubling is `lsl #1`; gcc folds them into `lsl #24` and
`lsr #23`, one shift short of what the two operations would cost separately.
Mismatched shift counts like that are everywhere in agbcc output, and they are
almost always a truncation with another shift baked into it.

The rule to carry forward: arithmetic happens at 32 bits, and narrowing happens
where C says a value becomes narrow again - an assignment, a store, a cast, a
return. Everywhere else the width is invisible.

Your target narrows twice, and in the cheapest way there is.

## Your task

Write `func_081d5f40` to reproduce the target assembly.

<!-- solution -->
```c
void func_081d5f40(u8 *p, s32 n) {
    p[0] = p[0] * n;
    p[1] = p[1] + n;
}
```
