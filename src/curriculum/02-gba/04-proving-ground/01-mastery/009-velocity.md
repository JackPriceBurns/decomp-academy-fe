---
id: 6e83f171-3359-4d1e-93a8-749ec3efc302
slug: gba-mastery-velocity
title: Integrating Velocity
difficulty: 4
concepts:
  - structs
  - fixed-point
  - narrow-types
hints:
  - "`mov r1, #10` is not a number, it is a struct offset. Thumb's `ldrsh` has
    no immediate-offset form, so the field offset has to be loaded into a
    register first - look at which field of `Actor` lives there."
  - "`mov r0, #128` / `lsl r0, #3` builds 1024, and the `ble` that jumps over
    the `mov` after it is an `if` with its condition inverted. `ldr`/`str`
    touch the 32-bit fields, `ldrsh`/`strh` the 16-bit ones."
  - "One `Actor *` goes in, nothing comes out. Three fields are written; the
    clamped velocity is used for the store and the integration both, and the
    horizontal axis is handled last with no clamp at all."
symbol: func_0841e19c
---

# Gravity, in fixed point

There is no FPU, so a GBA actor's position is an integer holding a fixed-point
number - typically eight fractional bits, so 256 means one pixel. Velocity gets
the same treatment in a narrower field, because a speed needs far less range
than a position does. Every frame the game adds gravity to the vertical speed,
stops it running away by clamping it to a terminal value, and adds the result to
the position.

Reading that narrow field is where the machine gets in the way. Thumb has an
`ldrsh` but only in the register-offset form - there is no `ldrsh r0, [r1, #10]`
- so the compiler has to put the offset in a register before it can load:

```asm
0        mov       r1, #0
2        ldrsh     r0, [r0, r1]
4        bx        lr
```

That `mov r1, #0` is not data. It is a zero index the instruction insists on,
for a field that sits at offset 0. A field further into the struct puts its own
offset in that register, so a `mov rN, #6` next to an `ldrsh` means offset six
in the structure, not the number six.

The clamp is the other half. An `if` that assigns a bound compiles to a compare
and a branch that jumps *over* the assignment, so the condition you read is the
opposite of the one that was written:

```asm
0        ldr       r1, [pc, #16] (->20)
2        cmp       r0, r1
4        bge       8 ~>
6        mov       r0, r1
8      ~>ldr       r1, [pc, #12] (->24)
10       cmp       r0, r1
12       ble       16 ~>
14       mov       r0, r1
16     ~>bx        lr
18       .hword    0
20       .word     4294965248
24       .word     2047
```

Two clamps, two pool words, and the first of them is worth a second look:
4294965248 is how the workspace renders -2048, because pool words print as
unsigned decimals. A pool word within a few thousand of 4294967296 is a small
negative number in the source; subtract it from 2^32 to read it back.

Your target's bound is small enough that agbcc builds it with a `mov` and a
shift instead of spending a pool word, and its narrow field is not at offset
zero. Map every offset back to a field name before you write anything.

## Your task

Write `func_0841e19c` to reproduce the target assembly.

<!-- context -->
```c
typedef struct {
    s32 x;
    s32 y;
    s16 vx;
    s16 vy;
} Actor;
```

<!-- solution -->
```c
void func_0841e19c(Actor *a)
{
    s32 v;

    v = a->vy + 24;
    if (v > 1024) {
        v = 1024;
    }
    a->vy = v;
    a->y += v;
    a->x += a->vx;
}
```
