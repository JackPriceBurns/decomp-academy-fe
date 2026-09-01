---
id: 529230a9-036f-466d-af72-eef545d406f1
slug: gba-arithmetic-shuffle
title: The Copy That Comes First
difficulty: 3
concepts:
  - registers
  - arithmetic
  - operand-order
symbol: func_08041b2c
hints:
  - A register that is written before it is ever read is scratch space, not an
    argument. Ask why the compiler needed the value it saved there.
  - "Four `s32` parameters in, an `s32` out. One of them is never used, and the
    value parked in the scratch register is the one the expression consumes
    last."
---

# A move that is not a move

The two-operand forms overwrite their destination, and the return value has to
end up in `r0`. Put those together and `r0` becomes the accumulator for most
expressions — which is a problem when `r0` also holds an argument that the
expression has not finished with.

Here is `x - y + z`, which has no such problem:

```asm
0        sub       r0, r1
2        add       r0, r2
4        bx        lr
```

`x` is consumed by the very first instruction, so `r0` is free to become the
running total immediately.

Now the same three values in the other order, `z - y + x`:

```asm
0        mov       r3, r0
2        sub       r0, r2, r1
4        add       r0, r3
6        bx        lr
```

The subtraction has to happen before `x` is needed, and its result belongs in
`r0`. So gcc copies `x` out to a spare register first, builds the difference in
`r0`, and folds the saved copy back in at the end.

That opening `mov` is one of the most common sights in GBA code, and it carries
information. It says: **the value in `r0` is used late in the expression, so the
destination had to be freed up early.** Reading it, you learn where the first
argument appears in the source — near the end of it.

Which register receives the copy is worth a second glance too. gcc takes the
first one that is genuinely free, so a copy landing in `r3` means `r0`–`r2` were
all busy, and a copy landing in `r1` means the second argument register was never
in use at all. A register written before it is read is scratch, not a parameter,
but you still count the highest argument register the body *reads* when you work
out how many parameters there are.

Your target opens with one of these copies, and the register it picks is telling
you something.

## Your task

Write `func_08041b2c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08041b2c(s32 a, s32 b, s32 c, s32 d) {
    return c + d - a + 20;
}
```
