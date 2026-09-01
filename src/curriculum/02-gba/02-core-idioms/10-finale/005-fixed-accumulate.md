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
  - Read the three instructions between the load and the accumulate as one unit — a multiply, a bias and a shift. The shift amount is the Q format, and the bias is half of one unit in that format.
  - "The `mov` / `and` / `cmp #0` triple at the top of the body is a bit test on a field, and its mask was hoisted into a callee-saved register before the loop started. The `beq` after it skips the whole accumulate."
  - A `Mover *`, an `s32` count and an `s32` scale in, an `s32` out. Only movers with one particular flag bit set contribute, and what each contributes is its speed scaled by the third argument in Q8, rounded.
---

# Everything at once

This is the last function of the tier, and it is built from five things you have
already matched separately: a guarded loop, a struct stride, a narrow signed
load, a bit test on a flags field, and a fixed-point multiply. None of them is
harder than it was on its own. What is harder is that they share registers, and
the register pressure rearranges the parts.

Start with the fixed-point core on its own. Here is a function that scales every
element of a halfword array in place, rounding as it goes:

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

Addresses 12 to 16 are the whole idea. `mul` forms the product, `asr #4` scales
it back down, and the `add #8` in between is the rounding bias. Read the shift
first: shifting down by 4 means the scale factor was Q4, sixteen units to 1.0.
Then read the bias against it — 8 is half of 16, half a unit, which is exactly
what turns a truncating shift into round-to-nearest. A core with no `add` between
the `mul` and the shift is a source that truncated.

The shift is `asr` and not `lsr`, and that is the signedness of the expression
showing through. A negative product shifted with `lsr` would come back as an
enormous positive number, so the compiler's choice here is a direct readout of
the types in the C.

Everything about this is cheaper than the float version would be. A `f32`
multiply is `bl __mulsf3`, with `__floatsisf` on the way in and `__fixsfsi` on
the way out, a frame around all three, and callee-saved registers for anything
that has to survive them. Two instructions and a shift is why real GBA code
keeps its fractions in integers.

The loop around it holds one more detail worth having. The entry guard at 2 is
`cmp r1, #0`, testing the count directly, because this function has no other
zeroed register lying around. A function that also accumulates does have one, and
gcc will often compare the zeroed accumulator against the count instead — the
same guard, written against a register that looks like the wrong one.

Now the thing that will catch you in the target. When the body needs a low
register that a parameter is currently sitting in, the setup block copies that
parameter somewhere else first, and the loop ends up counting down a register
other than the one the count arrived in. Read the block between the entry guard
and the loop's top carefully: every `mov` in there is either a hoisted constant
or a parameter getting out of the way, and neither one is part of the body.

Your target runs that fixed-point core at a different scale, inside a walk whose
stride and field offsets you have to read off the listing, with a flag test
deciding whether each element counts at all.

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
