---
id: b7f39526-69a5-446a-920d-ac8742999066
slug: gba-mastery-dma-copy
title: Kicking Off a DMA
difficulty: 3
concepts:
  - hardware-registers
  - literal-pool
  - constants
hints:
  - Three pool words, one per register. 67109076 is 0x040000D4 and the other two
    step on from it four bytes at a time, so each store gets its own address
    rather than walking one base.
  - "`mov #132` / `lsl #24` is 0x84000000 - the enable bit plus the 32-bit
    transfer bit. The `lsr #2` in front of the `orr` converts a size into the
    units the count field is measured in."
  - "Two pointers and a `u32` byte count go in, nothing comes out. Source is
    written first, then destination, then the control word that starts the
    transfer."
symbol: func_0842ff6c
---

# Handing the copy to the DMA unit

The GBA's DMA channel 3 is how anything large moves: tile data into VRAM, a
palette into the background palette, the output of a decompressor into work RAM.
You give it a source in 0x040000D4, a destination in 0x040000D8, and then write
a control word to 0x040000DC - and the write itself is the trigger. Bit 31
enables the channel, bit 26 selects 32-bit units, and the low sixteen bits hold
how many units to move.

Everything about the listing is about how those four numbers get into registers.
Write constants to the three registers and agbcc loads one pool word and walks
it:

```asm
0        ldr       r1, [pc, #20] (->24)
2        mov       r0, #192
4        lsl       r0, #19
6        str       r0, [r1, #0]
8        add       r1, #4
10       mov       r0, #160
12       lsl       r0, #19
14       str       r0, [r1, #0]
16       add       r1, #4
18       mov       r0, #0
20       str       r0, [r1, #0]
22       bx        lr
24       .word     67109040
```

One pool word - 67109040 is 0x040000B0 - and two `add r1, #4` steps to reach the
other two registers. The *values* being stored need no pool at all: 0x06000000
is 192 shifted left 19, and 0x05000000 is 160 shifted left 19. The GBA memory
map is laid out so every region base is a byte times a power of two, which is
why VRAM addresses are cheap and register addresses are not.

A control word is a different matter:

```asm
0        ldr       r2, [pc, #8] (->12)
2        ldr       r1, [pc, #12] (->16)
4        orr       r1, r0
6        str       r1, [r2, #0]
8        bx        lr
10       .hword    0
12       .word     67109048
16       .word     2147484160
```

2147484160 is 0x80000200, and no single byte shifted anywhere produces it, so it
costs a pool word of its own. Flag words that happen to be a byte followed by
zeros get the two-instruction treatment instead; the difference is worth
checking before you assume a constant must be pooled.

Now the part that catches people. Your target writes three adjacent registers
the same way, with *arguments* instead of constants - and the address chain
disappears. Each store loads its own pool word, so the pool has three entries
four bytes apart from each other. Nothing in the C accounts for it; it falls
out of how many values gcc 2.9 has live at once, and it is not something you
can talk it out of. Reproduce the three pool words rather than trying to find
the C that collapses them.

## Your task

Write `func_0842ff6c` to reproduce the target assembly.

<!-- context -->
```c
#define REG_DMA3SAD (*(vu32 *)0x040000D4)
#define REG_DMA3DAD (*(vu32 *)0x040000D8)
#define REG_DMA3CNT (*(vu32 *)0x040000DC)
```

<!-- solution -->
```c
void func_0842ff6c(void *src, void *dst, u32 count)
{
    REG_DMA3SAD = (u32)src;
    REG_DMA3DAD = (u32)dst;
    REG_DMA3CNT = (count >> 2) | 0x84000000;
}
```
