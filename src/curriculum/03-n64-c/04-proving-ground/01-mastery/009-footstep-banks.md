---
id: 14d68724-6ba0-4e80-9e65-e568355fa683
slug: mastery-footstep-banks
title: Footstep Sounds, Table-Dispatched
difficulty: 3
concepts:
  - real-code
  - switch
  - jump-table
  - hi-lo
symbol: func_80135a1c
hints:
  - "`sltiu at, a0, 6` means six table entries, cases 0 through 5. The reloc in each body names the bank it returns. Write one `case` per body."
  - "Two different case values return the same bank as the default. Follow where the table sends case 0, and note which body the out-of-range path shares."
---

# Which sound does grass make?

When a character's foot lands, the game looks up a *bank* of footstep sounds
(grass, stone, water, snow), and this function picks the bank. It is a `switch`
over the bank index, and every case returns **the address of a global array**.
This lesson is about that combination: jump-table dispatch (tier 3) where each
case body builds an address (`lui`/`addiu` with `%hi`/`%lo`) instead of a
constant.

Here is the same idea in a smaller function, `pickTrack`, with three music
tables and a fallback. It has too few cases for a jump table, so IDO uses a
chain of compares. The *bodies* still have exactly the shape you will see in
the target:

```asm
 0:  addiu at, zero, 1
 4:  beq   a0, at, 0x2c           # case 1?
 8:  lui   v0, %hi(gCalmTrack)    #   (slot) upper half, done speculatively
 c:  addiu at, zero, 2
10:  beq   a0, at, 0x34           # case 2?
14:  lui   v0, %hi(gBattleTrack)  #   (slot) each test preloads ITS half
18:  addiu at, zero, 3
1c:  beq   a0, at, 0x3c           # case 3?
20:  lui   v0, %hi(gBossTrack)
24:  b     0x44                   # nothing matched → default
28:  lui   v0, %hi(gCalmTrack)
2c:  jr    ra
30:  addiu v0, v0, %lo(gCalmTrack)
34:  jr    ra
38:  addiu v0, v0, %lo(gBattleTrack)
3c:  jr    ra
40:  addiu v0, v0, %lo(gBossTrack)
44:  addiu v0, v0, %lo(gCalmTrack)
48:  jr    ra
4c:  nop
```

An array's address is built in two halves, and the scheduler often splits
them. The `lui` goes in a branch's delay slot, while the matching `addiu %lo`
sits in the case body. Pair them **by symbol name**, never by position. The
relocs make each pair clear, and each name tells you exactly which global that
case returns. As usual, the relocs document the code for you.

The target has enough cases for a real jump table: an `sltiu` bounds check,
then `sll`/`lw`/`jr` through the table, then the bodies in case order. Read
each body's symbol and notice which bodies are *shared*, because the original
`switch` sends two labels to the same return. Also note that the
out-of-range default returns a value too. All five banks are declared in the
context.

## Your task

Write `func_80135a1c` to reproduce the target assembly.

<!-- solution -->
```c
u16 *func_80135a1c(s32 bank) {
    switch (bank) {
        case 1:
            return gFootstepSfxBank1;
        case 2:
            return gFootstepSfxBank2;
        case 3:
            return gFootstepSfxBank3;
        case 4:
            return gFootstepSfxBank4;
        case 5:
            return gFootstepSfxBank5;
        case 0:
        default:
            return gFootstepSfxBank3;
    }
}
```

<!-- context -->
```c
extern u16 gFootstepSfxBank1[36];
extern u16 gFootstepSfxBank2[36];
extern u16 gFootstepSfxBank3[36];
extern u16 gFootstepSfxBank4[36];
extern u16 gFootstepSfxBank5[10];
```
