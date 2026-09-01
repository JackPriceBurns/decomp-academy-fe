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
  - "The `mov r4, #0` at the top of the body is not a variable being reset. It is the branch target, and the zero it builds is the offset register the load needs."
  - The cursor advances by 2 and the load sign-extends, so the elements are signed 16-bit.
  - An `s16 *` and an `s32` count in, `s32` out - a plain indexed sum, with a narrower element type than the ones you have summed so far.
---

# What the element width costs you

Word arrays get the best code this compiler produces. Everything narrower pays,
and the two narrow widths pay in different ways.

Bytes lose the walking pointer. With a stride of one, gcc's induction pass
declines to build a cursor and recomputes the address from base plus index every
single trip. Here is a loop that ors a run of bytes together:

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

Look at what follows from that one decision. The base has to stay live for the
whole loop, so it moves to r4 and the function stops being a leaf. The index has
to stay live too, because the address needs it, so the countdown rewrite is off
and `i` runs up with `blt`. Written over a word array the same source compiles
to eleven instructions with a cursor and no push; over bytes it is sixteen.

Halfwords keep the cursor, and unsigned ones cost nothing extra: `ldrh` has an
immediate-offset form, so `ldrh rD, [rP, #0]` works and the walk looks like any
other. Signed halfwords are where it gets strange.

Thumb's `ldrsh` exists only as `ldrsh rD, [rN, rM]` — register offset, no
immediate form at all. To load through a cursor at offset zero, gcc needs a
register that contains zero, and it builds one *inside* the loop, as the first
instruction of the body, so the back-edge branches to it. The zero is
reconstructed every trip and the register holding it has to be saved.

That is the recognition to take away: a `mov rX, #0` at the top of a loop body,
immediately followed by a load that uses rX as an index, is an addressing mode
rather than a variable. Nothing in the source resets anything there.

So read your target's load instruction and its stride together, and let the pair
of them settle what the elements are before you write a line.

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
