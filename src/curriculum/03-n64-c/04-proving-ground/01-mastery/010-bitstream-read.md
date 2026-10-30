---
id: 68f20238-938b-4c0c-b0f2-ab20127f0ae1
slug: mastery-bitstream-read
title: The Leftover Debug Print
difficulty: 3
concepts:
  - real-code
  - loops
  - bitwise
  - dead-code
symbol: func_8023c808
hints:
  - "Before the loop, `bitPos` and `bitLength` are loaded and compared once, and nothing uses the result. The original code had a failure log there, which the build stripped out. Reproduce its guard as an `if` with an empty body."
  - "Loop body: split `bitPos` with `sra` 3 / `andi` 7, take one bit out of the byte, shift it left with `sllv` by a counter that starts at 0, and OR it into the result. The counter and `bitPos` both go up by one each time. `n` counts down, with the `andi 0xff` re-mask."
---

# The statement you cannot see

`func_8023c808` reads `n` bits from the stream of lesson 003 and packs them
into an integer, lowest bit first. The bit handling uses material from tier 2.
This function is worth studying for another reason. It contains a statement
that **compiled to nothing** and still changed the assembly.

The original source logs a failure when a read starts past the end of the
stream. In the shipped build, the logging macro expands to nothing, which
leaves `if (condition) { }` with an empty body. IDO deletes the useless
comparison. However, the fact that it *saw* the comparison changes what the
register allocator does. Compare `rangeWidth` built with and without a leftover
empty `if` above the subtraction:

```asm
lw   v1, 4(a0)        # with the empty if: hi and lo land in v1 and a1
lw   a1, 0(a0)
subu v0, v1, a1
jr   ra
nop
```

```asm
lw   t6, 4(a0)        # without it: same instructions, different registers
lw   t7, 0(a0)
subu v0, t6, t7
jr   ra
nop
```

Both versions have the same four instructions with different register
choices, and the diff view checks registers. A function can be *logically*
identical to the original and still not match, because a dead statement is
missing and the allocator chooses differently without it. Real decomp projects
run into this all the time. The fix is to keep the leftover code, with a
comment that explains why it is there.

Here is the bit extraction on its own, in `testBit`, which reads one bit from a
byte array:

```asm
sra  t6, a1, 3        # idx >> 3: which byte
addu t7, t6, a0
lbu  t8, 0(t7)        # the byte
andi t9, a1, 0x7      # idx & 7: which bit inside it
srav v0, t8, t9       # shift that bit to the bottom
andi t0, v0, 0x1      # keep just it
or   v0, t0, zero
jr   ra
nop
```

The target runs that extraction in a loop with two exit conditions: no bits
left to read, and the end of the stream. It builds the result with
`sllv`/`or`, starting from zero. The counter `n` gets the `andi 0xff` re-mask
after its decrement, as you learned in tier 2. Somewhere before the loop is the
leftover empty `if`. Leave room for it in your C.

## Your task

Write `func_8023c808` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_8023c808(BitStream *stream, u8 n) {
    u32 data;
    s32 i;
    s32 byteIdx;
    s32 bitIdx;
    u8 bit;

    data = 0;
    i = 0;

    if (stream->bitLength <= stream->bitPos) {
        // A debug print lived here. The build stripped it; its if remains.
    }

    while (n != 0 && stream->bitPos < stream->bitLength) {
        byteIdx = stream->bitPos >> 3;
        bitIdx = stream->bitPos & 7;

        bit = (stream->data[byteIdx] >> bitIdx) & 1;
        data |= bit << i;

        i++;
        stream->bitPos++;
        n--;
    }

    return data;
}
```

<!-- context -->
```c
typedef struct {
    /*00*/ u8 *data;
    /*04*/ s32 byteLength;
    /*08*/ s32 bitLength;
    /*0C*/ s32 capacity;
    /*10*/ s32 bitPos;
} BitStream;
```
