---
id: fe6ce0df-2c80-4b15-9a43-89443544caf0
slug: gba-memory-offset-limit
title: The Offset Limit
difficulty: 2
concepts:
  - addressing
  - arrays
  - encoding-limits
symbol: func_082029c8
hints:
  - The C did not write the `add` in the middle. It comes from one element
    access whose offset does not fit in the load.
  - It takes one `u32 *` and returns a `u32`. Both values in the sum are
    elements of that array. Divide each byte offset by four to get its index.
---

# Where the offset field runs out

The offset inside `ldr rD, [rB, #n]` is five bits wide, so it counts from 0
to 31. The hardware multiplies it by the access size. For a word, that gives 0
to 124 in steps of four. 124 is the largest offset a word load or store can
encode. For the next element along, the addressing mode cannot express the
address.

When that happens, the compiler builds the address itself:

```asm
0        str       r1, [r0, #120]
2        add       r0, #140
4        str       r1, [r0, #0]
6        bx        lr
```

The first store is element 30 at offset 120, which fits. The second is element
35 at offset 140, which does not fit. So the offset moves out of the store and
into a separate `add` on the base. The `add` changes the base register in
place, because nothing needs the original pointer afterwards. The store that
follows uses `[r0, #0]`, the same form you saw for a plain dereference.

The limit is not a fixed number of bytes. It is always 31 times the access
size, so it changes with the load width: 124 for words, 62 for halfwords, 31
for bytes. On an 8-bit array the index and the byte offset are the same number,
which makes the limit clear to see:

```asm
0        ldrb      r1, [r0, #31]
2        add       r0, #100
4        ldrb      r0, [r0, #0]
6        sub       r1, r0
8        mov       r0, r1
10       bx        lr
```

Element 31 is the last one a byte load can reach, so element 100 gets its own
`add`. You can reach 32 elements at every width. The width only changes the
byte value printed in the offset.

Whether the `add` goes to the pointer itself or to a copy depends on whether
the original is still needed. If it is, you get the `mov` from the previous
lesson before the pair, and the `add` goes to the copy.

The important point is that an `add rB, #N` feeding a load or store at
`[rB, #0]` is **not** pointer arithmetic in the C. It is one array element or
one field whose offset was too large for the encoding. You write it as an
ordinary index.

Your target crosses the limit: one access encodes its offset, and the next one
cannot.

## Your task

Write `func_082029c8` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_082029c8(u32 *p) {
    return p[31] + p[32];
}
```
