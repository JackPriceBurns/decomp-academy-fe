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
  - "There are three pool words, one for each register. 67109076 is
    0x040000D4, and the other two follow it at steps of four bytes. So each
    store gets its own address, instead of stepping from one base."
  - "`mov #132` / `lsl #24` is 0x84000000: the enable bit plus the 32-bit
    transfer bit. The `lsr #2` before the `orr` converts a size into the units
    that the count field uses."
  - "Two pointers and a `u32` byte count go in, and nothing comes out. The
    source is written first, then the destination, then the control word that
    starts the transfer."
symbol: func_0842ff6c
---

# Handing the copy to the DMA unit

The GBA's DMA channel 3 is used to move any large block of data: tile data into
VRAM, a palette into the background palette, or the output of a decompressor
into work RAM. You give it a source in 0x040000D4 and a destination
in 0x040000D8. Then you write a control word to 0x040000DC, and that write
starts the transfer. Bit 31 enables the channel, bit 26 selects 32-bit units,
and the low sixteen bits hold the number of units to move.

The whole listing is about how those four numbers get into registers. If you
write constants to the three registers, agbcc loads one pool word and steps it
from one register to the next:

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

There is one pool word (67109040 is 0x040000B0), and two `add r1, #4` steps
reach the other two registers. The *values* being stored do not need the pool
at all. 0x06000000 is 192 shifted left by 19, and 0x05000000 is 160 shifted
left by 19. The GBA memory map is laid out so that every region base is a byte
times a power of two. That is why VRAM addresses are cheap to build and
register addresses are not.

A control word is different:

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

2147484160 is 0x80000200. No single byte, shifted by any amount, produces it,
so it needs a pool word of its own. Flag words that are a byte followed by
zeros are built with two instructions instead. Check for this before you assume
that a constant must come from the pool.

Now the part that often confuses people. Your target writes three adjacent
registers in the same way, with *arguments* instead of constants, and the
address chain disappears. Each store loads its own pool word, so the pool has
three entries, each four bytes apart. The C source does not cause this
directly. It is a result of how many values gcc 2.9 has live at once, and you
cannot write the source in a way that avoids it. Reproduce the three pool
words, and do not try to find C that merges them.

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
