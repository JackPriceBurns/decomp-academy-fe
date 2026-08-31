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
  - "`sltiu at, a0, 6` — six table entries, cases 0 through 5. Each body's
    reloc names the bank it returns; write one `case` per body."
  - "Two different case values end up returning the same bank as the default. Follow where the table sends case 0, and note which body the out-of-range path shares."
---

# Which sound does grass make?

When a character's foot lands, the game looks up a *bank* of footstep sounds —
grass, stone, water, snow — and this function picks the bank. It's a `switch`
over the bank index where every case returns **the address of a global array**.
That combination is the lesson: jump-table dispatch (tier 3) where each case
body is an address build (`lui`/`addiu` with `%hi`/`%lo`), not a constant.

Here's the same idea at compare-chain scale — `pickTrack`, three music tables
and a fallback. Too few cases for a table, so IDO compares, but the *bodies*
have exactly the shape you'll meet in the target:

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

Returning an array's address takes two halves, and the scheduler loves to
split them: the `lui` rides a branch's delay slot while the matching
`addiu %lo` waits at the case body. Pair them **by symbol name**, never by
adjacency — the relocs make each pairing unambiguous, and each name tells you
exactly which global that case returns. Free documentation, as always.

The target has enough cases for a real jump table: `sltiu` bounds check,
`sll`/`lw`/`jr` through the table, bodies in case order. Read each body's
symbol, notice which bodies are *shared* — the original `switch` lets two
labels fall to the same return — and mind that the out-of-range default
returns something too. All five banks are declared in the context.

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
