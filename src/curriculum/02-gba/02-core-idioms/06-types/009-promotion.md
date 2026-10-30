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
  - Each load and store pair is one statement, and the instruction between them
    is the arithmetic. No instruction narrows the result, so think about which C
    construct does the narrowing for free.
  - "The arguments are a `u8 *` and an `s32`, and there is no return value.
    There are two statements. Each reads a byte, combines it with the `s32`, and
    writes it back."
---

# Integer promotion, and where narrowing happens

C does not have 8-bit arithmetic. Every `u8` or `s16` in an expression is
promoted to `int` first, and the operation happens at full width. On a machine
with 32-bit registers this costs nothing. That is why you have already seen byte
loads going straight into a plain `add`, with no masking.

The compiler only has to behave *as if* the promotion happened. When the result
is about to be narrowed again, it can save instructions. Look at what changes
when an intermediate result is stored in a `u8` variable:

```asm
0        ldrb      r0, [r0, #0]
2        add       r0, r1
4        lsl       r0, #24
6        lsr       r0, #23
8        bx        lr
```

and what happens when the same value stays inside the expression:

```asm
0        ldrb      r0, [r0, #0]
2        add       r0, r1
4        lsl       r0, #1
6        bx        lr
```

Both compute a byte plus an `s32` and then double the result. The second one
doubles with a single `lsl #1`. The first assigns the sum to a `u8` before
doubling. That assignment is a truncation the compiler must respect, because
the doubling has to use the wrapped value.

Look at how the first version does this. Truncating to a byte is `lsl #24` then
`lsr #24`, and doubling is `lsl #1`. gcc combines them into `lsl #24` and
`lsr #23`, which is one shift fewer than the two operations would need
separately. You will see shift pairs with different counts like this all
through agbcc output. They are almost always a truncation combined with another
shift.

The rule to remember is this. Arithmetic happens at 32 bits. Narrowing happens
where C says a value becomes narrow again: an assignment, a store, a cast or a
return. Everywhere else, the width does not appear in the code.

Your target narrows twice, both times in the cheapest way possible.

## Your task

Write `func_081d5f40` to reproduce the target assembly.

<!-- solution -->
```c
void func_081d5f40(u8 *p, s32 n) {
    p[0] = p[0] * n;
    p[1] = p[1] + n;
}
```
