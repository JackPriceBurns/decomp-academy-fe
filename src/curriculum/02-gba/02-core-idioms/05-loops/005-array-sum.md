---
id: 76d2a0f6-16d2-4f8d-a264-e29c6b04bea1
slug: gba-loops-array-sum
title: Summing an Array
difficulty: 3
concepts:
  - loops
  - arrays
  - strength-reduction
hints:
  - The cursor advances by 2 each trip, so the elements are two bytes wide, and
    `ldrh` brings them in zero-extended.
  - Write the loop with an index and a subscript. The compiler creates the cursor
    and the countdown by itself, so you do not write them.
  - A `u16 *` and an `s32` count in, `s32` out. It is the plain
    `for (i = 0; i < n; i++)` sum of the elements.
symbol: func_081811a4
---

# The index that becomes a cursor

If you compute it literally, `a[i]` is an address calculation. You take the
base, scale the index by the element size, and add the two. Done that way, it
costs a shift and an add on every trip, and it keeps both the base and the index
live for the whole loop. gcc usually avoids this. It sees that the address moves
by a fixed amount each trip, so it keeps the *address* in a register instead of
the index. At the end of the body, it advances the address by the element size.
The scaling is gone, and usually the index is gone too. A pointer that is used
like this is called a cursor.

Here is a loop that fills a halfword array with 32:

```asm
0        cmp       r1, #0
2        ble       16 ~>
4        mov       r2, #32
6      ~>strh      r2, [r0, #0]
8        add       r0, #2
10       sub       r1, #1
12       cmp       r1, #0
14       bne       6 ~>
16     ~>bx        lr
```

The body is a store through r0 at offset zero, followed by `add r0, #2`. Nothing
is multiplied. r0 arrived as the array pointer, and the loop moves it forward
through the array. The count in r1 does the countdown from the previous lesson.
Together, these two registers hold all the state the loop needs.

The amount the cursor moves each trip is called the stride. It is the element
size, which makes it the most useful number in the listing. `add rP, #2` means
halfwords, `#1` means bytes, and `#4` means words. Once you read the stride, you
know the pointer type before you have read anything else.

`mov r2, #32` is above the loop, outside the body. Thumb's `strh` cannot store
an immediate value, so the value needs a register. The value never changes, so
gcc builds it once in the preheader, which is the space between the guard and
the loop top. Constants that appear there are loop-invariant values (values
that are the same on every trip) that gcc moved out of the body.

Expect one variation. Sometimes the cursor is the argument register itself, as
it is here. Other times gcc first copies the pointer into a different register,
with a `mov` after the guard. It makes that copy when the body needs the
argument register for something else, such as holding a loaded value.

Your target's loop is built the same way, with a load where this one has a
store. Read its stride first. Then work out what the body does with each value
it loads.

## Your task

Write `func_081811a4` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081811a4(u16 *a, s32 n) {
    s32 i;
    s32 t = 0;
    for (i = 0; i < n; i++)
        t += a[i];
    return t;
}
```
