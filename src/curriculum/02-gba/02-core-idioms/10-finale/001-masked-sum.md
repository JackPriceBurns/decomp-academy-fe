---
id: 13406e0e-3924-4a30-9264-4bcc42511224
slug: gba-finale-masked-sum
title: A Masked, Guarded Sum
difficulty: 3
concepts:
  - loops
  - bitwise
  - control-flow
symbol: func_082c71b8
hints:
  - Find the back edge first. The conditional branch at the bottom jumps to the top of the body. Everything above that address runs only once.
  - "Each `mov` / `and` / `cmp #0` group is one bit test. The constant in the `mov` is the mask. The branch after the `cmp` tells you whether the source had a `!` in front of the test."
  - The function takes a `u16 *` and an `s32` count, and returns an `s32`. One mask decides whether an element counts at all. The other mask selects the bits that get added.
---

# Four idioms sharing one loop

Every function in this chapter is built from parts you already know. What is
new is that several of them run in the same function, and the compiler does not
emit them in the order you wrote them. A loop, a bit test, a guard and an
accumulator together give a listing whose first six instructions come from
three different parts of the source.

Here is a function that walks an array of bytes. For every byte that has bit 5
set, it ORs the low three bits of that byte into a result:

```asm
0        push      {r4, r5, r6, r7, lr}
2        mov       r5, r0
4        mov       r4, #0
6        mov       r3, #0
8        cmp       r4, r1
10       bge       40 ~>
12       mov       r7, #32
14       mov       r6, #7
16     ~>add       r0, r5, r3
18       ldrb      r2, [r0, #0]
20       mov       r0, r7
22       and       r0, r2
24       cmp       r0, #0
26       beq       34 ~>
28       mov       r0, r6
30       and       r0, r2
32       orr       r4, r0
34     ~>add       r3, #1
36       cmp       r3, r1
38       blt       16 ~>
40     ~>mov       r0, r4
42       pop       {r4, r5, r6, r7}
44       pop       {r1}
46       bx        r1
```

Read it from the bottom up. The `blt` at 38 jumps back to 16, so 16 is the top
of the loop body and 34 is the increment. Everything from 0 to 14 runs only
once. It keeps the base pointer in `r5` and sets the accumulator and the index
to zero. The entry guard at 8 skips the whole loop when the count is not
positive. Then two constants are loaded into `r6` and `r7`.

Those two `mov`s are the masks, hoisted out of the body. gcc does not spend an
instruction on every iteration to rebuild a constant that it can keep in a
register. So it builds each mask once, before the loop, and keeps it in a
callee-saved register until the function returns. This is the only reason the
function pushes four callee-saved registers even though it calls nothing. The
base pointer, the accumulator and both masks must all stay alive through every
iteration.

Inside the body, the three instructions `mov r0, r7 ; and r0, r2 ; cmp r0, #0`
form one bit test. agbcc never emits `tst`, so a bit test always has the same
three steps: copy the mask, AND it with the value, and compare the result with
zero. The `beq` after it skips the accumulate. The second group has the same
shape without the compare. Its result is the value that gets ORed into the
accumulator, so there is no condition to test.

Two details look wrong but are correct. First, the entry guard at 8 compares
`r4`, the accumulator, against the count. You might expect `r3`, the index.
Both registers hold zero at that point, so either one works, and gcc chose
`r4`. Second, this loop keeps a real subscript, with `add r0, r5, r3` on every
iteration, because a byte element needs no scaling. When the element is wider,
gcc strength-reduces the subscript into a walking pointer instead. The index
then has no uses left, and the loop counts the trip count down to zero:
`add rP, #size ; sub rN, #1 ; cmp rN, #0 ; bne`.

Masks follow the usual rules for constants. A mask under 256 fits in a `mov`. A
mask that is a small number times a power of two becomes a `mov` followed by an
`lsl`. Any other mask goes in the literal pool as a `.word`, and you read that
word as the mask.

Your target uses the same four pieces. The constant that advances its pointer
tells you how wide each element is. Expect the countdown loop shape, and expect
each of its two masks to need more than a single `mov`.

## Your task

Write `func_082c71b8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_082c71b8(u16 *p, s32 n) {
    s32 i;
    s32 sum = 0;
    for (i = 0; i < n; i++) {
        if (p[i] & 0x8000) sum += p[i] & 0x7FFF;
    }
    return sum;
}
```
