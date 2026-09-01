---
id: d1c56b51-f632-41c4-8848-51ae3b17c677
slug: gba-mastery-entity-sweep
title: "Grand Capstone: The Entity Sweep"
difficulty: 5
concepts:
  - loops
  - structs
  - narrow-types
  - bitwise
symbol: func_084346e0
hints:
  - "The `add r2, #12` is the struct's size, so offsets 0, 2 and 8 name three of its fields. Everything set up before the loop - the `mov r6, #1` and the pool load into `r7` - is a constant hoisted out of the body, including out of branches that hardly ever run."
  - '"`ldrh [r2, #2]` and the later `ldrsh [r2, r1]` with `r1` holding 2 are the same field read twice. The flags halfword loaded at the top of the body is still live when the mask is applied near the bottom, so it is never reloaded.'
  - '"An `Entity *` and an `s32` count go in, an `s32` comes out. Bit 0 of `flags` marks an entity live, 32 is added to `vy` every pass, and an entity whose `y` passes 0x9000 is cleared and counted.'
---

# The sweep

Every game has one of these. Once a frame, walk the entity array; skip the slots
that are not in use; advance the ones that are; retire anything that has fallen
out of the world, and report how many went. It is a loop, a flag test, some
fixed-point arithmetic and a counter - all four things this chapter has taught,
in one function.

Start with the loop. A `for` over an array of structs whose index is used for
nothing but addressing loses its index entirely:

```asm
0        mov       r3, #0
2        cmp       r3, r1
4        bge       24 ~>
6        mov       r2, r0
8      ~>ldrh      r0, [r2, #0]
10       cmp       r0, #3
12       bne       16 ~>
14       add       r3, #1
16     ~>add       r2, #8
18       sub       r1, #1
20       cmp       r1, #0
22       bne       8 ~>
24     ~>mov       r0, r3
26       bx        lr
```

The guard at the top handles a count of zero, the pointer walks by `add r2, #8`
- the size of one element - and the trip counter runs down to zero. The stride
in that `add` is the most useful number in the whole listing: it tells you how
big the structure is before you have read a single field.

Now the piece that will stop you. A narrow signed field that is written and then
read back gets loaded twice, with different instructions:

```asm
0        ldrh      r2, [r0, #0]
2        sub       r2, #3
4        strh      r2, [r0, #0]
6        mov       r3, #0
8        ldrsh     r2, [r0, r3]
10       ldr       r0, [r1, #0]
12       sub       r0, r2
14       str       r0, [r1, #0]
16       bx        lr
```

The first load only has to survive a subtraction and a store, so the cheap
`ldrh` will do. The second use folds the field into a 32-bit value, which needs
the sign, and rather than sign-extend the register it is already holding, agbcc
goes back to memory with `ldrsh`. One field, one C statement per line, two
loads four instructions apart with two different opcodes. If you try to write C
that loads it once you will never match this.

The last piece is clearing a flag:

```asm
0        ldrh      r2, [r0, #0]
2        ldr       r1, [pc, #8] (->12)
4        and       r1, r2
6        strh      r1, [r0, #0]
8        bx        lr
10       .hword    0
12       .word     65531
```

`&= ~4` has its complement folded at compile time, and the folded mask is
narrowed to the width of the access - so the pool holds 65531, which is 0xFFFB,
sixteen bits rather than thirty-two. A pool constant just below 65536 next to a
`strh` is nearly always a `~` on a small constant.

Your target has all three, plus one thing none of the examples show: the mask
that only the innermost, rarely-taken branch needs is loaded before the loop
begins and parked in `r7` for the whole sweep. gcc 2.9 hoists anything
loop-invariant however deep in the body it is used, and it will spend a
callee-saved register to do it - which is why the function opens by pushing
`r4` through `r7`, and the pool load sits above the loop instead of beside the
store that uses it.

Take it in the order the machine does: the frame of the loop first, then the
body's early exit, then the arithmetic, then the retire path.

## Your task

Write `func_084346e0` to reproduce the target assembly.

<!-- context -->
```c
typedef struct {
    u16 flags;
    s16 vy;
    s32 x;
    s32 y;
} Entity;
```

<!-- solution -->
```c
s32 func_084346e0(Entity *list, s32 count)
{
    s32 i;
    s32 gone;

    gone = 0;
    for (i = 0; i < count; i++) {
        if (list[i].flags & 1) {
            list[i].vy += 32;
            list[i].y += list[i].vy;
            if (list[i].y > 0x9000) {
                list[i].flags &= ~1;
                gone++;
            }
        }
    }
    return gone;
}
```
