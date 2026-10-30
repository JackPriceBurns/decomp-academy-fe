---
id: ab7d1eb8-de58-44f1-90a1-8aa9c306896c
slug: gba-mastery-checksum
title: A Save-File Checksum
difficulty: 4
concepts:
  - loops
  - masks
  - narrow-types
symbol: func_084152b4
hints:
  - "The 65535 from the pool is loaded once before the loop and used on every
    pass. The `lsr #16` beside it is the other half of the same idea. Together
    they fold a sum that has grown past sixteen bits back into sixteen bits."
  - "`mvn` is `~`. The `lsl #16` / `lsr #16` after it narrows the value to the
    return type and is not part of the arithmetic. The accumulator that feeds
    it is wider than the value that comes out."
  - "A `u16 *` and an `s32` count go in, and a `u16` comes out. The accumulator
    is a `u32`, and the loop body has two statements: add the element, then
    fold."
---

# A checksum over save data

A GBA cartridge's save RAM is a single chip, one byte wide, with no error
correction. If the power goes off during a write, a block can be left half
written, and this does happen. So every game that saves also stores a checksum,
and it refuses to load a block whose sum does not match.

The pattern in your target is the same one that every network stack uses. It
adds into a value wider than the checksum. After each addition, it takes
anything that went above bit 15 and folds it back down, adding it in at bit 0.
Nothing is lost, and the result stays within sixteen bits however long the data
is.

Before you read the target, look at what gcc 2.9 does to an accumulating loop
in general. Here is one that works on bytes:

```asm
0        push      {r4, lr}
2        mov       r4, r0
4        mov       r3, #90
6        mov       r2, #0
8        cmp       r2, r1
10       bge       26 ~>
12     ~>add       r0, r4, r2
14       ldrb      r0, [r0, #0]
16       eor       r0, r3
18       add       r3, r0, #3
20       add       r2, #1
22       cmp       r2, r1
24       blt       12 ~>
26     ~>mvn       r0, r3
28       lsl       r0, #24
30       lsr       r0, #24
32       pop       {r4}
34       pop       {r1}
36       bx        r1
```

`mov r3, #90` is the starting value of the accumulator. The `cmp r2, r1` /
`bge` before the loop is the guard for a count of zero. With a variable trip
count, the compiler cannot know whether the body runs at all. Inside the loop,
the index stays, and the address is calculated again with `add r0, r4, r2` on
every pass. The counter increases, and `blt` repeats the loop. `mvn` at the end
is `~`, and the `lsl #24` / `lsr #24` after it narrows the result to the
declared return type.

Your target's loop looks different, and the width of one element is what causes
this. Indexing a byte array costs a single `add` however you compute it, so gcc
keeps the index. With wider elements, the index would also need a shift. So gcc
strength-reduces the index away and steps the pointer with the `add` in the
loop body. It also reverses what is left of the counter so that it counts
*down* to zero, and the loop ends on `bne`. The `for` in the source is the same.
The element width decides the structure.

One more thing to expect. The zero that starts the accumulator and the zero that
the guard compares against are in the same register. `mov r1, #0` sets up the
comparison, the `bge` uses it, and then the loop body starts adding into it. If
you read the guard as a test on the accumulator, you will misread the loop.

## Your task

Write `func_084152b4` to reproduce the target assembly.

<!-- solution -->
```c
u16 func_084152b4(u16 *data, s32 count)
{
    u32 sum;
    s32 i;

    sum = 0;
    for (i = 0; i < count; i++) {
        sum += data[i];
        sum = (sum & 0xFFFF) + (sum >> 16);
    }
    return ~sum;
}
```
