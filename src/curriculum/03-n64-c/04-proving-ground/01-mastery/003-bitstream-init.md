---
id: 0f0defc2-3747-42e9-a875-4dfa255759ec
slug: mastery-bitstream-init
title: Bits Into Bytes
difficulty: 2
concepts:
  - real-code
  - bitwise
  - delay-slots
symbol: func_803c37bc
hints:
  - "`sra` by 3 plus `andi` 0x7 turns a length in bits into a length in bytes, with a check for leftover bits. The double store to `4(a0)` is a round-up `if`. Do not write it as two separate statements."
  - "Five plain field stores follow. Map each register to a parameter using the offsets in the context. The `or v0, a0, zero` at the end is a returned pointer."
---

# A round-up, reordered by the scheduler

This game packs save data and compressed streams bit by bit, using a small
`BitStream` cursor struct. This target is its constructor. Most of it is plain
field stores, but the first field is *computed*. The stream is given a length
in **bits**, and it must work out the length in **bytes**, rounded up when the
bits do not divide evenly.

You know every piece of that. A right shift divides by a power of two, a mask
gives the remainder, and a branch tests the remainder. The part worth reading
in the real function is how the scheduler *arranges* the round-up. Here is the
same idiom in `gridResize`, which converts a cell count into full rows of 16:

```asm
 0:  sra   t6, a1, 4       # cells >> 4: full rows
 4:  andi  t7, a1, 0xf     # cells & 15: any leftover?
 8:  beqz  t7, 0x18        # none → the rows count is already right
 c:  sw    t6, 0(a0)       #   (slot) store the rounded-DOWN count either way
10:  addiu t9, t6, 1       # leftover: bump…
14:  sw    t9, 0(a0)       # …and overwrite the store that already happened
18:  sw    a1, 4(a0)       # g->cells = cells
1c:  jr    ra
20:  nop
```

The store in the branch's delay slot runs on *both* paths, and the "round up"
path stores again on top of it. So two `sw` to the same offset, a few lines
apart, come from one store plus an `if (...) field += 1;`. The scheduler folded
the two together. Do not read them as two separate C statements. You saw this
pattern, a store followed by an overwrite, in tier 3's finale. Here it is in
shipped code.

The target does the same thing with its own shift amount and mask. It then
fills in the rest of the struct from the parameters. Look at the last
instructions to see what the function leaves in `v0`.

## Your task

Write `func_803c37bc` to reproduce the target assembly.

<!-- solution -->
```c
BitStream *func_803c37bc(BitStream *stream, u8 *data, s32 bitLength, s32 capacity) {
    stream->byteLength = bitLength >> 3;
    if (bitLength & 7) {
        stream->byteLength += 1;
    }

    stream->bitLength = bitLength;
    stream->capacity = capacity;
    stream->data = data;
    stream->bitPos = 0;

    return stream;
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
