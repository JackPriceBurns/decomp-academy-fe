---
id: 962ffc86-f835-4b54-8122-f6bf31751841
slug: loops-first-do-while
title: "Your First do/while"
difficulty: 1
concepts:
  - loops
  - do-while
  - delay-slots
symbol: func_8018bff0
hints:
  - "The back-edge tests the second argument after a decrement. That is the `while` condition, written exactly as the C states it."
  - "The delay slot holds what happens to the first argument each trip. Read its immediate for the step."
---

# Two instructions, one loop

Now you write one yourself. The anatomy lesson showed you the general shape.
Here is a complete `do`/`while` that uses two instructions plus a delay slot.
This is `drain`, which subtracts 2 from `hp`, `n` times:

```c
s32 drain(s32 hp, s32 n) {
    do {
        hp -= 2;
        n--;
    } while (n > 0);
    return hp;
}
```

```asm
 0:  addiu a1, a1, -1     # n--
 4:  bgtz  a1, 0x0        # n > 0? around again
 8:  addiu a0, a0, -2     # (delay slot) hp -= 2
 c:  or    v0, a0, zero   # result out of a0
10:  jr    ra
14:  nop
```

Match the C to the assembly line by line, and notice what rotation did to the
*order*. The C does `hp -= 2` first and `n--` second. The assembly runs `n--`
first and puts `hp -= 2` in the delay slot. The compiler can reorder them
because the two updates don't depend on each other. What it keeps is the
*count*: each update runs exactly once per trip. To decompile a loop body,
collect the instructions from the loop top down to the delay slot, including
the slot. Then write them in whatever order reads naturally. The compiler will
reorder them to match.

Also notice what is *missing*: there is no guard branch before the loop. The
body always runs at least once. That missing guard tells you the loop is a
`do`/`while` and not a `while`. If you write the wrong one, the diff will show
an extra branch (or a missing one) at the top.

The target has the same structure with different arithmetic. Find the
back-edge and read its test as written (back-edge tests are never flipped).
Collect the two updates, and check which register is returned.

## Your task

Write `func_8018bff0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8018bff0(s32 energy, s32 n) {
    do {
        energy += 5;
        n--;
    } while (n > 0);
    return energy;
}
```
