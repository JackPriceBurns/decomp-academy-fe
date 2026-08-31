---
id: 68f20238-938b-4c0c-b0f2-ab20127f0ae1
slug: mastery-bitstream-read
title: The Ghost of a Debug Print
difficulty: 3
concepts:
  - real-code
  - loops
  - bitwise
  - dead-code
symbol: func_8023c808
hints:
  - "Before the loop, `bitPos` and `bitLength` get loaded and compared once with nothing depending on the result. The original guarded a (stripped) failure log there — reproduce the guard as an `if` with an empty body."
  - "Loop body: split `bitPos` with `sra` 3 / `andi` 7, pull one bit out of
    the byte, `sllv` it up by a counter that starts at 0, OR it in. Both the
    counter and `bitPos` step by one; `n` counts down with the `andi 0xff`
    re-mask."
---

# The statement you can't see

`func_8023c808` pulls `n` bits off the stream from lesson 003 and packs them
into an integer, lowest bit first. The bit-plumbing is tier-2 material. What
makes this function famous-shaped is something else: it contains a statement
that **compiled to nothing** — and still changed the assembly.

The original source logs a failure when a read starts past the end of the
stream. In the shipped build, the logging macro expands to nothing, leaving
`if (condition) { }` — an empty body. IDO deletes the useless comparison…
but having *seen* it changes what the register allocator does. Compare
`rangeWidth` built with and without a vestigial empty `if` above the
subtraction:

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

Same four instructions, different register choices — and the diff view checks
registers. A function can be *logically* identical to the original and still
not match because a dead statement isn't there to nudge the allocator. Real
decomp projects hit this constantly; the fix is to keep the vestigial code,
with a comment explaining the fossil.

The bit extraction itself, in isolation — `testBit`, which reads one bit from
a byte array:

```asm
sra  t6, a1, 3        # idx >> 3 — which byte
addu t7, t6, a0
lbu  t8, 0(t7)        # the byte
andi t9, a1, 0x7      # idx & 7 — which bit inside it
srav v0, t8, t9       # shift that bit to the bottom
andi t0, v0, 0x1      # keep just it
or   v0, t0, zero
jr   ra
nop
```

The target runs that extraction in a loop with two exit conditions — bits
remaining, and end of stream — accumulating with `sllv`/`or` into a result
that starts at zero. The counter `n` gets the `andi 0xff` re-mask after its
decrement, exactly as tier 2 promised. And somewhere before the loop:
the ghost. Leave room for it.

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
