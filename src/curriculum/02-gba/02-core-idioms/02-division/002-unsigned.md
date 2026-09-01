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
  - The multiply sits after the `bl`, so 100 never reaches the helper. Work out
    what it is scaling.
  - Two `u32` parameters in, a `u32` out. The first is divided by the second and
    the quotient is scaled by 100.
---

# The type is in the name

On a machine with a divide instruction, the signedness of a division is part of
the opcode — one mnemonic for signed, another for unsigned. The ARM7TDMI has
neither, so that distinction moves into the name of the routine gcc calls.
`__divsi3` divides signed operands; `__udivsi3` divides unsigned ones. Nothing
else in the frame changes.

The choice is made from the operand types after C's usual arithmetic
conversions, and it is made at compile time, so the helper name in a target is a
fact about the original declarations. Here is a difference divided by a third
value, with every declaration unsigned:

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

One letter of difference across the whole function. Read the helper name before
you read anything else: it settles the signedness of the operands in a glance,
and nothing else in the listing mentions types again.

The two helpers do genuinely different work. `__udivsi3` runs a plain
restoring-division loop over the bits; `__divsi3` records the sign of each
operand, negates them, calls the same loop, and negates the quotient back. The
signed one is slower, which is a real reason GBA code declares counters and
sizes `u32`.

While you are here, read the `sub`. It sits in front of the `bl`, working on
`r0` — the register the helper takes its dividend from — so it is part of what
gets divided. An instruction that sits after the call works on whatever came
back instead. Your target does arithmetic of its own around the call, and which
side of the `bl` it falls on decides what it applies to.

## Your task

Write `func_08093880` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_08093880(u32 a, u32 b) {
    return a / b * 100;
}
```
