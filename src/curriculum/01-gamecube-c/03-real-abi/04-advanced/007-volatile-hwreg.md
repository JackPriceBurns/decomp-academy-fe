---
id: e894a620-acc0-51de-8efa-8c3df359c191
slug: advanced-volatile-hwreg
title: Volatile Hardware Registers
difficulty: 4
concepts:
  - volatile
  - hardware-register
  - vu32
  - memory-mapped
symbol: func_80225298
hints:
  - Cast the fixed address through `vu32` (volatile u32) so each dereference is
    a real load.
  - Expect `lis r3, 0xCC00` then two `lwz r?, 0x3000(r3)` — the volatile
    prevents merging them.
---

# Reading a memory-mapped register

The GameCube wires its hardware into the address space, so a block of fixed
addresses up in the `0xCC000000` range act as memory-mapped registers whose reads
return whatever the device is doing right now. To get at one you cast its
address through a `volatile` pointer, which is what the `vu32` typedef
(`volatile u32`) is for. That `volatile` is doing real work here, because if you
dropped it the compiler would CSE two reads of the register into a single load
and you would never see whatever changed in between.

So two reads of the same register stay two reads in the output. The example below
reads `0xCC005000`, the DMA controller, twice and adds the two results together.

```asm
lis r3, -13312       # build the high half of the address (0xCC000000)
lwz r0, 20480(r3)   # first read of the register (0x5000 = 20480)
lwz r3, 20480(r3)   # second read — volatile keeps it
add r3, r0, r3
blr
```

The `lis` builds the upper 16 bits of the address and the `lwz` displacement
supplies the lower half. One detail trips people up: objdump shows the `lis`
immediate as a signed `-13312`, because the bit pattern `0xCC00` reads as `52224`
unsigned but as `-13312` when interpreted as a signed 16-bit value, and `lis`
shifts whichever it is left by 16 to land on `0xCC000000`, with the displacement
filling in the rest. Either way, every access goes back out to the device. When
you see the same fixed address loaded again and again with no store in between,
you are looking at code polling a hardware register, and the way to bring it back
is to cast that address through a `volatile` pointer.

## Your task

Write `func_80225298` to match the assembly above. The `vu32` typedef is part of
the shared preamble. Both loads must survive as separate `lwz`.

<!-- solution -->
```c
int func_80225298(void) {
    int a = *(vu32*)0xCC003000;
    int b = *(vu32*)0xCC003000;
    return a + b;
}
```
