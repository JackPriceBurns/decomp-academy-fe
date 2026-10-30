---
id: 66190136-7bd7-41a9-a1bb-e1b1a1be65fb
slug: gba-loops-narrow-elements
title: Loops Over Narrow Data
difficulty: 4
concepts:
  - loops
  - arrays
  - types
symbol: func_081a4d44
hints:
  - "The `mov r4, #0` at the top of the body does not reset a variable. It is the branch target, and the zero it builds is the offset register that the load needs."
  - The cursor advances by 2 and the load sign-extends, so the elements are signed 16-bit.
  - An `s16 *` and an `s32` count in, `s32` out. It is a plain indexed sum, with a narrower element type than the ones you have summed so far.
---

# What the element width costs you

Arrays of words get the best code this compiler produces. Narrower elements cost
more, and bytes and halfwords cost more in different ways.

Byte arrays lose the cursor. With a stride of one, gcc's induction pass (the
optimization that turns an index into a cursor) does not build a cursor.
Instead, the address is recomputed from base plus index on every trip. Here is
a loop that ORs a run of bytes together:

```asm
0        push      {r4, lr}
2        mov       r4, r0
4        mov       r3, #0
6        mov       r2, #0
8        cmp       r3, r1
10       bge       24 ~>
12     ~>add       r0, r4, r2
14       ldrb      r0, [r0, #0]
16       orr       r3, r0
18       add       r2, #1
20       cmp       r2, r1
22       blt       12 ~>
24     ~>mov       r0, r3
26       pop       {r4}
28       pop       {r1}
30       bx        r1
```

That one decision has several effects. The base has to stay live for the whole
loop, so it moves to r4 and the function stops being a leaf. The index has to
stay live too, because the address needs it. So gcc cannot use the countdown,
and `i` counts up with `blt`. Over a word array, the same source compiles to
eleven instructions with a cursor and no push. Over bytes it is sixteen.

Halfword arrays keep the cursor, and unsigned halfwords cost nothing extra.
`ldrh` has a form with an immediate offset, so `ldrh rD, [rP, #0]` works and the
loop looks like any other. Signed halfwords are the unusual case.

Thumb's `ldrsh` exists only as `ldrsh rD, [rN, rM]`, with a register offset. It
has no immediate form at all. To load through a cursor at offset zero, gcc needs
a register that holds zero. It builds that zero *inside* the loop, as the first
instruction of the body, so the back-edge branches to it. The zero is rebuilt on
every trip, and the register holding it has to be saved.

This is the pattern to remember. A `mov rX, #0` at the top of a loop body,
followed straight away by a load that uses rX as an index, is part of the
addressing mode. It gives the load its zero offset. Nothing in the source resets
a variable there.

So read your target's load instruction and its stride together. Use the two of
them to decide what the elements are before you write any code.

## Your task

Write `func_081a4d44` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081a4d44(s16 *a, s32 n) {
    s32 i;
    s32 t = 0;
    for (i = 0; i < n; i++)
        t += a[i];
    return t;
}
```
