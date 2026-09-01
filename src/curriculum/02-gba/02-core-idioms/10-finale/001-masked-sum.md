---
id: 13406e0e-3924-4a30-9264-4bcc42511224
slug: gba-finale-masked-sum
title: Masked, Guarded, Summed
difficulty: 3
concepts:
  - loops
  - bitwise
  - control-flow
symbol: func_082c71b8
hints:
  - Find the back edge first. The conditional branch at the bottom names the top of the body, and everything above that address runs once.
  - "Each `mov` / `and` / `cmp #0` triple is a single bit test. The constant in the `mov` is the mask, and the branch after the `cmp` tells you whether the source had a `!` in front of it."
  - A `u16 *` and an `s32` count in, an `s32` out. One mask decides whether an element counts at all; the other selects the bits that get added.
---

# Four idioms sharing one loop

Everything in this chapter is made of parts you already know. What is new is the
number of them running at once, and the fact that they do not arrive in the order
you wrote them. A loop, a bit test, a guard and an accumulator produce a listing
whose first six instructions belong to three different pieces of the source.

Here is a function that ORs together the low three bits of every byte in an array
that has bit 5 set:

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

Read it back to front. The `blt` at 38 jumps to 16, so 16 is the top of the body
and 34 is the increment. Everything from 0 to 14 runs once: the base pointer is
parked in `r5`, the accumulator and the index are both zeroed, the entry guard at
8 skips the whole loop when the count is not positive, and then two constants are
loaded into `r6` and `r7`.

Those two `mov`s are the masks, hoisted out of the body. gcc will not spend an
instruction per iteration rebuilding a constant it can hold in a register, so the
masks get materialised once and live in callee-saved registers for the duration.
That is the entire reason this function pushes four callee-saved registers
despite calling nothing: the base pointer, the accumulator and both masks all
have to survive every trip.

Inside the body, `mov r0, r7 ; and r0, r2 ; cmp r0, #0` is one thing, not three.
agbcc never emits `tst`, so a bit test is always "copy the mask, AND it, compare
against zero", and the `beq` after it skips the accumulate. The second triple is
the same shape without the compare, because its result is wanted as a value
rather than as a condition.

Two details that read wrong and are right. The entry guard at 8 compares `r4` —
the accumulator — against the count, not `r3`, the index. Both are zero at that
point and gcc picked either one. And the loop here keeps a real subscript,
`add r0, r5, r3` per trip, because a byte element needs no scaling. When the
element is wider the subscript gets strength-reduced into a walking pointer
instead, the index loses its last use, and the loop counts the trip count down to
zero: `add rP, #size ; sub rN, #1 ; cmp rN, #0 ; bne`.

Masks obey the ordinary constant rules. One under 256 fits in a `mov`; one that
is a small number times a power of two becomes `mov` plus `lsl`; anything else
lands in the literal pool as a `.word` you read back as the mask.

Your target runs the same four pieces, and the constant that advances its
pointer will tell you how wide an element is. Expect the countdown skeleton, and
expect both of its masks to have cost more than a single `mov`.

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
