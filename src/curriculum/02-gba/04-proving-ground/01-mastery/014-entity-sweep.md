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
  - "The `add r2, #12` is the struct's size, so offsets 0, 2 and 8 name three
    of its fields. Everything set up before the loop (the `mov r6, #1` and the
    pool load into `r7`) is a constant that the compiler moved out of the body.
    That includes constants moved out of branches that almost never run."
  - "`ldrh [r2, #2]` and the later `ldrsh [r2, r1]`, with `r1` holding 2, read
    the same field twice. The flags halfword loaded at the top of the body is
    still live when the mask is applied near the bottom, so it is never loaded
    again."
  - "An `Entity *` and an `s32` count go in, and an `s32` comes out. Bit 0 of
    `flags` marks an entity as live, 32 is added to `vy` on every pass, and an
    entity whose `y` goes past 0x9000 is cleared and counted."
---

# The sweep

Every game has one of these. Once per frame, it goes through the entity array.
It skips the slots that are not in use and updates the ones that are. It
removes anything that has fallen out of the world, and it reports how many were
removed. That needs a loop, a flag test, some fixed-point arithmetic and a
counter. This chapter has taught all four, and here they are in one function.

Start with the loop. Take a `for` over an array of structs, where the index is
used only for addressing. The compiler removes its index completely:

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

The guard at the top handles a count of zero. The pointer moves by
`add r2, #8`, which is the size of one element, and the trip counter counts down
to zero. The stride in that `add` is the most useful number in the whole
listing. It tells you how big the structure is before you have read a single
field.

Now the part that is most likely to stop you. A narrow signed field that is
written and then read back is loaded twice, with different instructions:

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

The first load only goes through a subtraction and a store, so the cheaper
`ldrh` is enough. The second use adds the field into a 32-bit value, so the
field must be sign-extended. Instead of sign-extending the register it already
holds, agbcc goes back to memory with `ldrsh`. So one field, with one C
statement per line, gives two loads four instructions apart, with two different
opcodes. If you try to write C that loads the field only once, you will never
match this.

The last part is clearing a flag:

```asm
0        ldrh      r2, [r0, #0]
2        ldr       r1, [pc, #8] (->12)
4        and       r1, r2
6        strh      r1, [r0, #0]
8        bx        lr
10       .hword    0
12       .word     65531
```

In `&= ~4`, the complement is calculated at compile time, and the resulting
mask is narrowed to the width of the access. So the pool holds 65531, which is
0xFFFB: sixteen bits instead of thirty-two. A pool constant just below 65536
next to a `strh` is nearly always a `~` applied to a small constant.

Your target has all three, plus one thing that none of the examples show. The
mask that only the innermost, rarely taken branch needs is loaded before the
loop begins, and it stays in `r7` for the whole sweep. gcc 2.9 moves anything
loop-invariant out of the loop, however deep in the body it is used. It will
even use up a callee-saved register to do this. That is why the function starts
by pushing `r4` through `r7`, and why the pool load is above the loop instead
of next to the store that uses it.

Work through it in the order the machine runs it: first the loop structure,
then the early exit in the body, then the arithmetic, and then the path that
removes an entity.

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
