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
  - "The value in `mov r1, #10` is a struct offset. Thumb's `ldrsh` has no
    immediate-offset form, so the field offset has to be loaded into a register
    first. Check which field of `Actor` is at that offset."
  - "`mov r0, #128` / `lsl r0, #3` builds 1024. The `ble` that jumps over the
    `mov` after it is an `if` with its condition inverted. `ldr`/`str` access
    the 32-bit fields, and `ldrsh`/`strh` access the 16-bit ones."
  - "One `Actor *` goes in, and nothing comes out. Three fields are written. The
    clamped velocity is used twice, for the store and for the integration. The
    horizontal axis is handled last, with no clamp."
symbol: func_0841e19c
---

# Gravity in fixed point

The GBA has no FPU, so an actor's position is an integer that holds a
fixed-point number. It usually has eight fractional bits, so 256 means one
pixel. Velocity is stored the same way in a narrower field, because a speed
needs much less range than a position. Every frame, the game adds gravity to
the vertical speed. It clamps that speed to a terminal value so it cannot keep
growing. Then it adds the result to the position.

Loading the narrow field takes an extra step on this machine. Thumb has
`ldrsh`, but only in the register-offset form, where the offset comes from a
register. There is no `ldrsh r0, [r1, #10]`, so the compiler has to put the
offset in a register before it can load:

```asm
0        mov       r1, #0
2        ldrsh     r0, [r0, r1]
4        bx        lr
```

Here `mov r1, #0` loads the offset that the instruction requires. This field is
at offset 0, so the offset is zero. For a field further into the struct, that
register holds the field's offset instead. So when you see a `mov rN, #6` next
to an `ldrsh`, read the six as an offset into the structure.

The second thing to know is how a clamp compiles. An `if` that assigns a bound
becomes a compare and a branch that jumps *over* the assignment. So the
condition you read in the assembly is the opposite of the one in the source:

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

This code has two clamps, and each one loads its bound from a pool word. Look
closely at the first one. 4294965248 is how the workspace shows -2048, because
pool words are printed as unsigned decimal numbers. If a pool word is within a
few thousand of 4294967296, it is a small negative number in the source.
Subtract it from 2^32 to read it back.

In your target, the bound is small enough that agbcc builds it with a `mov` and
a shift, so it needs no pool word. Its narrow field is also not at offset zero.
Before you write anything, match every offset to a field name.

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
