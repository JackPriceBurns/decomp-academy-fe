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
  - One register is pushed alongside `lr`, so subtract those eight bytes from
    the load's offset before working out which argument slot it reads.
  - Five `s32` parameters in, an `s32` out. The stack argument joins the first
    one, the second and third make a difference, and the fourth is added last.
---

# Where argument five lives

`r0`-`r3` hold four arguments and there is no fifth argument register, so
everything past four travels in memory. The caller writes those words into a
block at the bottom of its own frame and branches; on entry to the callee they
sit immediately above `sp`, in order, four bytes apart.

In a function that has not moved `sp` at all, that makes argument five
`[sp, #0]`, argument six `[sp, #4]`, and so on. This leaf reads its fifth
argument and its first:

```asm
0        mov       r1, r0
2        ldr       r0, [sp, #0]
4        lsl       r0, #2
6        add       r0, r1
8        bx        lr
```

But `sp` rarely stays put. Every register the prologue pushes moves `sp` down
four bytes, and every one of those bytes is added to the offset of every
incoming stack argument. The same fifth argument, in a function that saved `lr`:

```asm
0        push      {lr}
2        ldr       r0, [sp, #4]
4        bl        tune-4
8        pop       {r1}
10       bx        r1
```

So the constant in `ldr rN, [sp, #C]` is not the argument index and not four
times the argument index. It is

    C = 4 * (registers pushed) + (frame size) + 4 * (index - 5)

and recovering the index means undoing the prologue first. Behind
`push {r4, r5, lr}` the fifth argument reads as `[sp, #12]`; behind
`push {r4, lr}` plus a `sub sp, #16` it reads as `[sp, #24]`. Miscount the
prologue and you will invent an argument that does not exist.

Notice also *when* the load happens: right at the top, before any call. An
incoming stack argument is read once, early, and kept in a register for the rest
of the function — which is why a function that only needs one at the very end
still pays for a callee-saved register to hold it from the start.

## Your task

Write `func_082ef4cc` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_082ef4cc(s32 a, s32 b, s32 c, s32 d, s32 e) {
    return (a + e) * (b - c) + d;
}
```
