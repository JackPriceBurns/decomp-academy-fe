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

# Nothing in this machine understands 0.5

The ARM7TDMI has an integer ALU, a barrel shifter and a 32-bit multiplier.
That is the whole arithmetic unit. There is no divider, and there is no
floating-point unit — not a disabled one, not an optional coprocessor, none at
all. No instruction in the ISA has ever seen an IEEE-754 number.

C does not care. You can write `f32` and `*` and `+` all day, and agbcc will
compile them, by turning every single operation into a call to a software
routine that does the work with integer instructions. Those routines live in
libgcc and they have names you will learn to read like operators:

```asm
0        push      {lr}
2        ldr       r1, [pc, #8] (->12)
4        bl        __mulsf3-4
8        pop       {r1}
10       bx        r1
12       .word     1061158912
```

That is `x * 0.75f`. The constant is not in any instruction — Thumb cannot
encode a 32-bit value — so its raw bit pattern sits in the function's own text
as a `.word`, and `ldr r1, [pc, #8]` fetches it. Then `bl __mulsf3` does the
multiply. The `-4` on the branch is a Thumb relocation artifact, not part of
the name.

# What a call costs you

A `bl` is not free even before the callee runs. It clobbers `lr`, so the
function has to save it, which means a stack frame where a leaf function needed
none. Anything that must stay alive across the call has to move somewhere the
callee will not touch, which means pushing callee-saved registers too:

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

One add, one load, one store, and five instructions of frame around them. The
pointer had to survive the call, so it went into `r4`, and `r4` had to be saved
because it belongs to the caller. This is the structural consequence to
internalise now: **a function whose float arithmetic survives to run time is
never a leaf.** If you see `push {lr}` and a `bl` to a name starting with two
underscores, you are reading soft float.

Then there is the routine itself. `__addsf3` unpacks two sign/exponent/mantissa
triples, aligns them, adds, renormalises and rounds — tens of instructions,
fetched from ROM over a 16-bit bus, for one `+`.

# The helper is the operator

The names follow a scheme, and once you know it, reading them is mechanical:

- `__addsf3`, `__subsf3`, `__mulsf3`, `__divsf3` — the four operators on
  `f32`. `sf` is "single float"; the trailing digit counts operands plus
  result, so `3` means binary and `__negsf2` is the unary minus.
- `__adddf3`, `__muldf3`, and the rest of the `df` family — the same operators
  on `f64`.
- `__ltsf2`, `__lesf2`, `__gtsf2`, `__gesf2`, `__eqsf2`, `__nesf2` — the six
  comparisons.
- `__floatsisf` (signed int to float), `__fixsfsi` (float to signed int),
  `__extendsfdf2` (float to double), `__truncdfsf2` (double to float).

There is no `__aeabi_` anything here — this is pre-EABI libgcc naming. And
there is no `__floatunsisf`: unsigned-to-float has no helper of its own, so gcc
builds it from a sign test, a halving trick and `__floatsisf`, in a shape you
would never guess was a conversion.

# What the games actually did

Here is the same 0.75 scaling, written as integers:

```asm
0        mov       r1, r0
2        lsl       r0, r1, #1
4        add       r0, r1
6        lsl       r0, #6
8        asr       r0, #8
10       bx        lr
```

Six instructions, no calls, no frame, and only the return costs more than an
ALU cycle. The trick
is to agree with yourself that the number is scaled: keep `x * 256` in an `s32`
and the low eight bits are the fraction. Then 0.75 is the integer 192, and
scaling by it is `(x * 192) >> 8` — which gcc has additionally strength-reduced
into a shift, an add and a shift, because 192 is 3 << 6.

That format is called **Q8.8**, or just Q8, and it is everywhere in GBA code:
positions, velocities, angles, fades, palette blends. A commercial GBA game
might contain no float arithmetic at all in its per-frame code.

The rest of this chapter is in two halves. First you learn to read soft float,
because it does appear — in tools code, in start-up code, in the odd routine
somebody wrote in a hurry. Then you learn fixed point, because that is what the
hot paths are made of, and because `mul` followed by `asr` is a shape you will
be recognising for the rest of your matching career.
