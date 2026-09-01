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
  - "The pooled 65535 is loaded once before the loop and used on every pass. The `lsr #16` beside it is the other half of the same idea - together they fold a sum that has outgrown sixteen bits back into sixteen."
  - '"`mvn` is `~`. The `lsl #16` / `lsr #16` after it is the return type being narrowed, not part of the arithmetic, and the accumulator that feeds it is wider than what comes out.'
  - '"A `u16 *` and an `s32` count go in and a `u16` comes out. The accumulator is a `u32` and the loop body is two statements - add the element, then fold.'
---

# A checksum over save data

A GBA cartridge's save RAM is one byte-wide chip with no error correction, and a
half-written block during a power-off is a real thing. So every game that saves
also checksums, and refuses to load a block whose sum does not match.

The pattern in your target is the one every network stack uses too: accumulate
into a value wider than the checksum, then after each addition fold whatever
climbed above bit 15 back down into bit 0. Nothing is thrown away, and the
result stays inside sixteen bits no matter how long the data is.

Before you read it, look at what gcc 2.9 does to an accumulating loop in
general. Here is a byte-wide one:

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

`mov r3, #90` is the accumulator's seed. The `cmp r2, r1` / `bge` before the
loop is the guard for a count of zero - with a variable trip count the compiler
cannot know the body runs at all. Inside, the index survives, the address is
rebuilt with `add r0, r4, r2` every pass, and the counter climbs with `blt`.
`mvn` at the end is `~`, and the `lsl #24` / `lsr #24` after it narrows the
result to the declared return type.

Your target's loop looks different, and what decides that is the width of one
element. Indexing a byte array costs a single `add` however you compute it, so
gcc leaves the index where it is. Make the elements wider and the index would
need a shift as well, so gcc strength-reduces it away, walks the pointer with
the `add` in the loop body, and flips what is left of the counter to run *down*
to zero, ending on `bne`. The same `for` in the source; the element width picks
the skeleton.

One more thing to expect: the zero that seeds the accumulator and the zero the
guard compares against are the same register. `mov r1, #0` sets up the
comparison, the `bge` uses it, and then the loop body starts adding into it. If
you read the guard as a test on the accumulator you will chase your tail.

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
