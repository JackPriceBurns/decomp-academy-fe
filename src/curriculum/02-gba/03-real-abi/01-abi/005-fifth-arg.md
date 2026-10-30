---
id: 26622c5a-0081-4365-8545-639a6d0bbb33
slug: gba-abi-fifth-arg
title: The Fifth Argument
difficulty: 4
concepts:
  - abi
  - arguments
  - stack
symbol: func_082ef4cc
hints:
  - One register is pushed along with `lr`. Subtract those eight bytes from the
    load's offset before you work out which argument slot it reads.
  - The function takes five `s32` parameters and returns an `s32`. The stack
    argument is paired with the first one, the second and third form a
    difference, and the fourth is added last.
---

# Where argument five lives

`r0` to `r3` hold four arguments, and there is no register for a fifth. So
every argument after the fourth is passed in memory. The caller writes those
words into a block at the bottom of its own frame, and then branches. When the
callee starts, they sit just above `sp`, in order, four bytes apart.

In a function that has not moved `sp` at all, this puts argument five at
`[sp, #0]`, argument six at `[sp, #4]`, and so on. This leaf reads its fifth
argument and its first:

```asm
0        mov       r1, r0
2        ldr       r0, [sp, #0]
4        lsl       r0, #2
6        add       r0, r1
8        bx        lr
```

But `sp` rarely stays where it started. Each register the prologue pushes moves
`sp` down four bytes, and those bytes are added to the offset of every incoming
stack argument. Here is the same fifth argument in a function that saved `lr`:

```asm
0        push      {lr}
2        ldr       r0, [sp, #4]
4        bl        tune-4
8        pop       {r1}
10       bx        r1
```

So the constant in `ldr rN, [sp, #C]` does not equal the argument index, or
four times the argument index. It is:

    C = 4 * (registers pushed) + (frame size) + 4 * (index-5)

To find the index, you must first undo the effect of the prologue. After
`push {r4, r5, lr}`, the fifth argument is at `[sp, #12]`. After
`push {r4, lr}` and a `sub sp, #16`, it is at `[sp, #24]`. If you miscount the
prologue, you will invent an argument that does not exist.

Also notice *when* the load happens: right at the top, before any call. gcc
reads an incoming stack argument once, early, and keeps it in a register for
the rest of the function. So a function that needs a stack argument only at the
very end still pays for a callee-saved register to hold it from the start.

## Your task

Write `func_082ef4cc` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_082ef4cc(s32 a, s32 b, s32 c, s32 d, s32 e) {
    return (a + e) * (b - c) + d;
}
```
