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
  - Write the loop with an index and a subscript. The cursor and the countdown
    are both things the compiler does to it, not things you write.
  - A `u16 *` and an `s32` count in, `s32` out - the plain
    `for (i = 0; i < n; i++)` sum of the elements.
symbol: func_081811a4
---

# The index that becomes a cursor

Written out literally, `a[i]` is an address calculation: take the base, scale
the index by the element size, add. Done that way it costs a shift and an add
every trip, and it keeps the base and the index both live for the whole loop.
gcc usually avoids it. It notices the address moves by a fixed amount each trip
and keeps the *address* in a register instead of the index, advancing it by the
element size at the end of the body. The scaling is gone and so, usually, is the
index.

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

The body is a store through r0 at offset zero, then `add r0, #2`. Nothing
multiplies anything. r0 arrived as the array pointer and is being walked forward
across the loop, and the count in r1 is doing the countdown from the previous
lesson, so the two of them together carry all the state the loop needs.

The stride is the element size, and that makes it the most useful number in the
listing. `add rP, #2` means halfwords; `#1` means bytes; `#4` means words. Read
the stride and you know the pointer type before you have read anything else.

`mov r2, #32` sits above the loop rather than inside it. Thumb's `strh` has no
immediate source operand, so the value needs a register, and since it never
changes gcc materializes it once in the preheader — the space between the guard
and the loop top. Constants that appear there are loop-invariant values hoisted
out of the body.

One variation to expect: sometimes the cursor is the argument register itself,
as here, and sometimes gcc copies the pointer into a different register first
with a `mov` after the guard. It makes the copy when the body needs the argument
register for something else, such as holding a loaded value.

Your target's loop is built the same way, with a load where this one has a
store. Read its stride first, then work out what the body does with each value
it brings in.

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
