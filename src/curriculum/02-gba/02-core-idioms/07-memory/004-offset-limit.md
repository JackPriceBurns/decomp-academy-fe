---
id: fe6ce0df-2c80-4b15-9a43-89443544caf0
slug: gba-memory-offset-limit
title: The Offset Ceiling
difficulty: 2
concepts:
  - addressing
  - arrays
  - encoding-limits
symbol: func_082029c8
hints:
  - The `add` in the middle is not something the C wrote. It is one element
    access whose offset would not fit in the load.
  - One `u32 *` in, a `u32` out. Both halves of the sum are elements of that
    one array; work out each index by dividing its byte offset by four.
---

# Where the offset field runs out

The offset inside `ldr rD, [rB, #n]` is five bits wide, so it counts 0 to 31,
and the hardware multiplies it by the access size. For a word that is 0 to 124
in steps of four. 124 is the largest offset a word load or store can encode,
and one element further along the addressing mode simply cannot express the
address.

What happens then is that the compiler builds the address itself:

```asm
0        str       r1, [r0, #120]
2        add       r0, #140
4        str       r1, [r0, #0]
6        bx        lr
```

The first store is element 30 at offset 120, which fits. The second is element
35 at offset 140, which does not, so the offset moves out of the store and into
a separate `add` on the base — and the base is clobbered in place, because
nothing needs the original pointer afterwards. The store that follows uses
`[r0, #0]`, the same shape you saw for a plain dereference.

The ceiling is not a fixed number of bytes. It is always 31 times the access
size, so it moves with the load width: 124 for words, 62 for halfwords, 31 for
bytes. On an 8-bit array the index and the byte offset are the same number,
which makes the wall easy to read:

```asm
0        ldrb      r1, [r0, #31]
2        add       r0, #100
4        ldrb      r0, [r0, #0]
6        sub       r1, r0
8        mov       r0, r1
10       bx        lr
```

Element 31 is the last one a byte load can name, so element 100 gets an `add`
of its own. The number of elements you can reach is 32 for every width; the
width only changes the byte figure printed in the offset.

Whether the `add` lands on the pointer itself or on a copy depends on whether
the original is still wanted. When it is, you get the `mov` from the previous
lesson in front of the pair, and the bump goes to the copy.

The thing to internalise is that an `add rB, #N` feeding a load or store at
`[rB, #0]` is **not** pointer arithmetic in the C. It is one array element or
one field whose offset overflowed the encoding, and you write it as an ordinary
index.

Your target straddles the wall: one access encodes its offset, the next one
cannot.

## Your task

Write `func_082029c8` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_082029c8(u32 *p) {
    return p[31] + p[32];
}
```
