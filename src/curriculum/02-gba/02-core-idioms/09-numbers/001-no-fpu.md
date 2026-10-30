---
id: f4e6ebb4-33b0-4f79-a05a-40b8a754488b
slug: gba-numbers-no-fpu
title: The Chip Cannot Do Decimals
difficulty: 2
concepts:
  - floating-point
  - soft-float
  - fixed-point
concept: true
---

# No instruction can handle 0.5

The ARM7TDMI has an integer ALU, a barrel shifter and a 32-bit multiplier.
That is all of its arithmetic hardware. There is no divider and no
floating-point unit. There is no disabled FPU and no optional coprocessor
either. No instruction in the ISA works with IEEE-754 numbers.

You can still write `f32`, `*` and `+` in C, and agbcc will compile them. It
turns every float operation into a call to a software routine that does the
work with integer instructions. These routines live in libgcc. Learn their
names, because each one stands for an operator:

```asm
0        push      {lr}
2        ldr       r1, [pc, #8] (->12)
4        bl        __mulsf3-4
8        pop       {r1}
10       bx        r1
12       .word     1061158912
```

This is `x * 0.75f`. The constant is not part of any instruction, because a
Thumb instruction cannot hold a 32-bit value. Instead, its raw bit pattern is
stored in the function's own code as a `.word`, and `ldr r1, [pc, #8]` loads
it. Then `bl __mulsf3` does the multiply. The `-4` on the branch comes from the
way Thumb relocations are displayed. It is not part of the name.

# What a call costs

A `bl` has a cost even before the called routine starts. It overwrites `lr`, so
the function must save `lr` first. That needs a stack frame, which a leaf
function would not have. Any value that must survive the call has to move to a
register the callee will not change. That means pushing callee-saved registers
as well:

```asm
0        push      {r4, lr}
2        mov       r4, r0
4        ldr       r0, [r4, #0]
6        bl        __addsf3-4
10       str       r0, [r4, #0]
12       pop       {r4}
14       pop       {r0}
16       bx        r0
```

The function does one add, one load and one store, and needs five more
instructions for the frame. The pointer had to survive the call, so it moved
into `r4`. Then `r4` had to be saved, because it belongs to the caller.
Remember this rule: **a function with float arithmetic left at run time is
never a leaf.** If you see `push {lr}` and a `bl` to a name that starts with
two underscores, you are reading soft float.

Then there is the cost of the routine itself. `__addsf3` splits each operand
into its sign, exponent and mantissa, lines the two up, adds them, normalises
the result and rounds it. That is tens of instructions, fetched from ROM over a
16-bit bus, for a single `+`.

# Each helper is an operator

The names follow a fixed pattern. Once you know it, you can read any of them:

- `__addsf3`, `__subsf3`, `__mulsf3`, `__divsf3`: the four operators on `f32`.
  `sf` means "single float". The last digit counts the operands plus the
  result, so `3` means a binary operator and `__negsf2` is unary minus.
- `__adddf3`, `__muldf3` and the rest of the `df` family: the same operators on
  `f64`.
- `__ltsf2`, `__lesf2`, `__gtsf2`, `__gesf2`, `__eqsf2`, `__nesf2`: the six
  comparisons.
- `__floatsisf` (signed int to float), `__fixsfsi` (float to signed int),
  `__extendsfdf2` (float to double), `__truncdfsf2` (double to float).

You will not see any `__aeabi_` names, because this is the older libgcc naming
from before the EABI. There is also no `__floatunsisf`. Converting an unsigned
value to float has no helper of its own, so gcc builds it from a sign test, a
step that halves the value, and `__floatsisf`. The result does not look like a
conversion at first.

# What the games did instead

Here is the same scaling by 0.75, done with integers:

```asm
0        mov       r1, r0
2        lsl       r0, r1, #1
4        add       r0, r1
6        lsl       r0, #6
8        asr       r0, #8
10       bx        lr
```

This is six instructions, with no calls and no frame. Only the return takes
more than one ALU cycle. The idea is that you decide the number is scaled. You
keep `x * 256` in an `s32`, and the low eight bits hold the fraction. Then 0.75
is the integer 192, and scaling by it is `(x * 192) >> 8`. gcc has also
replaced the multiply with a shift, an add and another shift, because 192 is
3 << 6.

This format is called **Q8.8**, or just Q8. GBA code uses it everywhere: for
positions, velocities, angles, fades and palette blends. A commercial GBA game
might have no float arithmetic at all in the code that runs every frame.

The rest of this chapter has two halves. First you learn to read soft float,
because it does appear: in tool code, in start-up code, and in the occasional
routine someone wrote in a hurry. Then you learn fixed point, because the code
that runs most often is written in it. You will also see `mul` followed by
`asr` again and again for the rest of your matching work.
