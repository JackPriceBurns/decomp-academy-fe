---
id: a0e989cd-567e-43c9-b907-a1e0e4523250
slug: gba-finale-fixed-accumulate
title: "Capstone: Fixed-Point Accumulate"
difficulty: 5
concepts:
  - fixed-point
  - structs
  - loops
symbol: func_082d8f88
hints:
  - "Read the three instructions between the load and the accumulate as one unit: a multiply, a bias and a shift. The shift amount gives the Q format, and the bias is half of one unit in that format."
  - "The `mov` / `and` / `cmp #0` group at the top of the body is a bit test on a field. Its mask was hoisted into a callee-saved register before the loop started. The `beq` after it skips the whole accumulate."
  - The function takes a `Mover *`, an `s32` count and an `s32` scale, and returns an `s32`. Only movers with one particular flag bit set are added. Each one adds its speed, multiplied by the third argument in Q8 and rounded.
---

# Everything at once

This is the last function of the tier. It is built from five things that you
have already matched one at a time: a guarded loop, a struct stride, a narrow
signed load, a bit test on a flags field, and a fixed-point multiply. None of
them is harder than it was on its own. The hard part is that they share
registers, and the shortage of free registers (register pressure) changes how
the parts are arranged.

Start with the fixed-point core by itself. Here is a function that scales every
element of a halfword array in place, and rounds each result:

```asm
0        push      {r4, lr}
2        cmp       r1, #0
4        ble       28 ~>
6        mov       r3, r0
8      ~>mov       r4, #0
10       ldrsh     r0, [r3, r4]
12       mul       r0, r2
14       add       r0, #8
16       asr       r0, #4
18       strh      r0, [r3, #0]
20       add       r3, #2
22       sub       r1, #1
24       cmp       r1, #0
26       bne       8 ~>
28     ~>pop       {r4}
30       pop       {r0}
32       bx        r0
```

Addresses 12 to 16 hold the whole idea. `mul` forms the product, `asr #4`
scales it back down, and the `add #8` between them is the rounding bias. Read
the shift first. A shift down by 4 means the scale factor was in Q4, where
sixteen units make 1.0. Then compare the bias with it. The bias, 8, is half of
16, so it is half a unit. Adding half a unit before the shift turns a
truncating shift into rounding to the nearest value. If there is no `add`
between the `mul` and the shift, the source truncated.

The shift is `asr` because the expression is signed. A negative product
shifted with `lsr` would become a huge positive number. So the compiler's
choice between `asr` and `lsr` tells you directly whether the types in the C
are signed.

All of this is much cheaper than a float version would be. An `f32` multiply
is `bl __mulsf3`, with `__floatsisf` to convert the input and `__fixsfsi` to
convert the result back. It also needs a frame around all three calls, and
callee-saved registers for any value that has to survive them. The fixed-point
version needs only two instructions and a shift. That is why real GBA code
keeps its fractions in integers.

The loop around it shows one more useful detail. The entry guard at 2 is
`cmp r1, #0`, which tests the count directly, because this function has no
other register that holds zero. A function that also accumulates does have
one, and gcc will often compare that zeroed accumulator against the count
instead. It is the same guard, but it uses a register that looks like the wrong
one.

Watch for one more pattern in the target. Sometimes the body needs a low
register that still holds a parameter. The setup code then copies that
parameter to another register first, and the loop counts down a different
register from the one the count arrived in. Read the code between the entry
guard and the top of the loop carefully. Every `mov` there is either a hoisted
constant or a parameter being moved out of the way. Neither one is part of the
body.

Your target runs that fixed-point core at a different scale. It sits inside a
loop over an array, and you have to read the stride and field offsets from the
listing. A flag test decides whether each element counts at all.

## Your task

Write `func_082d8f88` to reproduce the target assembly.

<!-- context -->
```c
typedef struct {
    s16 speed;
    u16 flags;
} Mover;
```

<!-- solution -->
```c
s32 func_082d8f88(Mover *m, s32 n, s32 scale) {
    s32 i;
    s32 total = 0;
    for (i = 0; i < n; i++) {
        if (m[i].flags & 4) total += (m[i].speed * scale + 128) >> 8;
    }
    return total;
}
```
