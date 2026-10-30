---
id: 1795bd4f-d3ef-4eb0-b538-926612c1ac97
slug: gba-division-unsigned
title: Unsigned Has Its Own Helper
difficulty: 2
concepts:
  - division
  - helper-calls
  - signedness
symbol: func_08093880
hints:
  - The multiply comes after the `bl`, so 100 never reaches the helper. Work out
    which value it multiplies.
  - Two `u32` parameters in, a `u32` out. The first is divided by the second and
    the quotient is multiplied by 100.
---

# The type is in the name

On a machine with a divide instruction, the opcode says whether a division is
signed or unsigned: there is one mnemonic for each. The ARM7TDMI has neither, so
the difference moves into the name of the routine gcc calls. `__divsi3` divides
signed operands, and `__udivsi3` divides unsigned ones. Nothing else in the
frame changes.

gcc picks the helper from the operand types after C's usual arithmetic
conversions. It does this at compile time, so the helper name in a target tells
you something certain about the original declarations. Here is a difference
divided by a third value, with every declaration unsigned:

```asm
0        push      {lr}
2        sub       r0, r1
4        mov       r1, r2
6        bl        __udivsi3-4
10       pop       {r1}
12       bx        r1
```

Now the same expression with every declaration signed:

```asm
0        push      {lr}
2        sub       r0, r1
4        mov       r1, r2
6        bl        __divsi3-4
10       pop       {r1}
12       bx        r1
```

The two functions differ by one letter. Read the helper name before anything
else. It tells you at once whether the operands are signed, and nothing else in
the listing says anything about types.

The two helpers really do different work. `__udivsi3` runs a plain restoring
division loop over the bits. `__divsi3` records the sign of each operand,
negates them, runs the same loop, and then negates the quotient back. The
signed one is slower, and that is one real reason GBA code declares counters and
sizes as `u32`.

Now look at the `sub`. It comes before the `bl` and works on `r0`, the register
the helper takes its dividend from. So it is part of what gets divided. An
instruction after the call works on the value that came back instead. Your
target does some arithmetic of its own around the call. Whether that arithmetic
comes before or after the `bl` decides what it applies to.

## Your task

Write `func_08093880` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_08093880(u32 a, u32 b) {
    return a / b * 100;
}
```
