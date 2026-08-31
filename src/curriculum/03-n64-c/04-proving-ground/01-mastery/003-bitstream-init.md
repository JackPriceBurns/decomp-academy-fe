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
  - "`sra` by 3 plus `andi` 0x7 is a length in bits becoming a length in
    bytes, with a check for stragglers. The double store to `4(a0)` is a
    round-up `if`, not two statements."
  - "Five plain field stores follow — map each register to a parameter by the offsets in the context. The `or v0, a0, zero` at the end is a returned pointer."
---

# A round-up, scheduled sideways

This game packs save data and compressed streams bit by bit, through a little
`BitStream` cursor struct. Today's target is its constructor. Most of it is
plain field stores — but the first field is a *computed* one: the stream is
given a length in **bits**, and must derive the length in **bytes**, rounded up
when the bits don't divide evenly.

You know every piece of that: shift right to divide by a power of two, mask to
get the remainder, branch on it. What makes the real function worth reading is
how the scheduler *arranges* the round-up. Here's the same idiom in `gridResize`,
which converts a cell count into full rows of 16:

```asm
 0:  sra   t6, a1, 4       # cells >> 4 — full rows
 4:  andi  t7, a1, 0xf     # cells & 15 — any leftover?
 8:  beqz  t7, 0x18        # none → the rows count is already right
 c:  sw    t6, 0(a0)       #   (slot) store the rounded-DOWN count either way
10:  addiu t9, t6, 1       # leftover: bump…
14:  sw    t9, 0(a0)       # …and overwrite the store that already happened
18:  sw    a1, 4(a0)       # g->cells = cells
1c:  jr    ra
20:  nop
```

The store in the branch's delay slot runs on *both* paths, and the "round up"
path simply stores again on top of it. Two `sw` to the same offset, a few
lines apart, is not two C statements — it's one store plus an
`if (...) field += 1;` whose scheduling folded them together. You saw this
store-then-overwrite move in tier 3's finale; here it is in shipped code.

The target does the same dance with its own shift amount and mask, then fills
in the rest of the struct from the parameters — ending with the constructor's
signature move, handing the stream pointer back in `v0`.

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
