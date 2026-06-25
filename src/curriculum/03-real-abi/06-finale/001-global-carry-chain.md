---
id: finale-real-global-carry-chain
title: "A 64-bit Global Accumulator"
difficulty: 3
concepts:
  - finale
  - globals
  - sda21
  - 64-bit
  - carry
symbol: tallyBytes
hints:
  - Each 64-bit global occupies two @sda21 slots; the low half is loaded from the
    `+0x4` relocation and the high half from the base symbol.
  - "The low words go through `addc` (records the carry) and the high words
    through `adde` (folds it in) — the same pair you saw introduced for plain
    `u64` addition."
  - Read both globals, add them as one `u64`, store the sum back into the first.
---

# Where the globals chapter meets the 64-bit chapter

Two separate ideas collide in the simplest finale of the tier. From the globals
chapter: a `u64` global is not one `@sda21` slot but **two adjacent words**, and
the assembler reaches the low half through a `symbol+0x4` relocation while the
base symbol names the high half. From the 64-bit chapter: adding two `u64`s is
the `addc`/`adde` carry chain — low words first, carry recorded, high words plus
that carry.

Put them together and a single `+=` on a 64-bit global turns into *four* memory
references (two loads per operand half) wrapped around the carry pair. Consider
`bumpTotals`, which folds a running `u64` counter into a `u64` accumulator:

```asm
lwz   r3, gRunning@sda21+0x4(r13)   # low half of gRunning
lwz   r0, gDelta@sda21+0x4(r13)     # low half of gDelta
lwz   r4, gRunning@sda21(r13)       # high half of gRunning
addc  r0, r3, r0                   # low: sum + record carry
lwz   r3, gDelta@sda21(r13)         # high half of gDelta
stw   r0, gAccum@sda21+0x4(r13)      # store low half of the result
adde  r0, r4, r3                   # high: sum + carry
stw   r0, gAccum@sda21(r13)          # store high half
blr
```

Notice the interleaving: the compiler loads what it needs for the low add, fires
the `addc`, stores the low result, and only then resolves the high words for the
`adde`. The `+0x4` relocations are the giveaway that each symbol is a 64-bit pair
rather than a 32-bit global.

Your `tallyBytes` reads two `u64` globals, adds them as one value, and writes the
sum back into the first. The `addc`/`adde` pair and the four loads tell you it is
64-bit; the `@sda21` relocations tell you the operands and destination are
globals. Trace which symbol each load and store touches.

## Your task

The globals are declared for you: `gPacketBytes` and `gFrameBytes`, both `u64`.
Write `tallyBytes` to reproduce the assembly above. Read the relocations to see
which global is read, which is written, and how the low and high halves pair up.

<!-- starter -->
```c
void tallyBytes(void) {
}
```

<!-- solution -->
```c
void tallyBytes(void) {
    gPacketBytes = gPacketBytes + gFrameBytes;
}
```

<!-- context -->
```c
extern u64 gPacketBytes;
extern u64 gFrameBytes;
```
