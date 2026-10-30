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
  - A register that is written before it is ever read is scratch space and
    does not hold an argument. Ask yourself why the compiler needed the value it
    saved there.
  - The function takes four `s32` parameters and returns an `s32`. One of them
    is never used. The value saved in the scratch register is the last one the
    expression uses.
---

# Copying an argument out of the way

The two-operand forms overwrite their destination, and the return value has to
end up in `r0`. Together, these mean that `r0` holds the running total for most
expressions. That causes a problem when `r0` also holds an argument that the
expression still needs.

Here is `x - y + z`, which does not have this problem:

```asm
0        sub       r0, r1
2        add       r0, r2
4        bx        lr
```

The first instruction uses `x`, and nothing needs it after that. So `r0` can
hold the running total straight away.

Now the same three values in the other order, `z - y + x`:

```asm
0        mov       r3, r0
2        sub       r0, r2, r1
4        add       r0, r3
6        bx        lr
```

The subtraction has to happen before `x` is used, and its result belongs in
`r0`. So gcc first copies `x` to a spare register. Then it builds the
difference in `r0`, and at the end it adds the saved copy back in.

This `mov` at the start is one of the most common patterns in GBA code, and it
tells you something. It means **the value in `r0` is used late in the
expression, so the destination had to be freed early.** From it, you learn that
the first argument appears near the end of the source expression.

Also look at which register receives the copy. gcc takes the first register
that is really free. So a copy into `r3` means `r0` to `r2` were all in use,
and a copy into `r1` means the second argument register was never used at all.
A register that is written before it is read is scratch space and does not hold
a parameter. When you work out how many parameters there are, you still count
up to the highest argument register the body *reads*.

Your target starts with one of these copies. The register it copies into tells
you something too.

## Your task

Write `func_08041b2c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08041b2c(s32 a, s32 b, s32 c, s32 d) {
    return c + d - a + 20;
}
```
