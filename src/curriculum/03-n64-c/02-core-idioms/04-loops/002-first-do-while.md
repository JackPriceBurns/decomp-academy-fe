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
  - "The back-edge tests the second argument after a decrement — that's the `while` condition, written exactly as the C states it."
  - "The delay slot holds what happens to the first argument each trip. Read its immediate for the step."
---

# Two instructions, one loop

Time to write one yourself. The anatomy lesson gave you the map; here's the
territory — a complete `do`/`while` in two instructions plus a slot. This is
`drain`, which subtracts 2 from `hp`, `n` times:

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

Match the C to the assembly line by line and notice what rotation did to the
*order*: the C says `hp -= 2` first, `n--` second — the assembly runs `n--`
first and parks `hp -= 2` in the slot. The compiler reordered freely because
the two updates don't touch each other; what it preserved is the *count*.
Each runs exactly once per trip. Decompiling a loop body means collecting
the instructions between top and slot inclusive, then writing them in
whatever order reads naturally — the compiler will re-shuffle to match.

Also see what's *missing*: no guard branch before the loop. The body runs at
least once, unconditionally — that absence is your proof it's `do`/`while`
and not `while`. Write the wrong one and the diff will show a whole extra
branch (or a missing one) at the top.

The target has the same skeleton with different arithmetic in it. Find the
back-edge, un-flip nothing (back-edge tests read straight), collect the two
updates, and mind which register is returned.

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
