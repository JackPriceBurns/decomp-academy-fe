---
id: advanced-volatile-hwreg
title: Volatile Hardware Registers
difficulty: 4
concepts:
  - volatile
  - hardware-register
  - vu32
  - memory-mapped
symbol: read_status
hints:
  - Cast the fixed address through `vu32` (volatile u32) so each dereference is
    a real load.
  - Expect `lis r3, 0xCC00` then two `lwz r?, 0x3000(r3)` — the volatile
    prevents merging them.
---

# Reading a memory-mapped register

The GameCube exposes hardware through **memory-mapped registers** — fixed
addresses like `0xCC003000` where each read returns live device state. The
idiomatic access is a cast through a `volatile` pointer: `*(vu32*)0xCC003000`
(`vu32` is `volatile u32`). The `volatile` is load-bearing in the most literal
sense — without it, reading the register twice would CSE to one load and you'd
miss whatever changed between reads.

Two reads of the same hardware register therefore stay two reads:

```asm
lis r3, 0xCC00      # build the high half of the address (shown as -13312)
lwz r0, 0x3000(r3)  # first read of the register
lwz r3, 0x3000(r3)  # SECOND read -- volatile keeps it
add r3, r0, r3
blr
```

Note `lis` materializes the upper 16 bits of `0xCC003000` and the `lwz`
displacement carries the lower `0x3000`. (objdump prints the `lis` immediate as
the signed `-13312`: the bit pattern `0xCC00` is `52224` read unsigned but
`-13312` as a signed 16-bit value — `lis` shifts it left 16 to give
`0xCC000000`, and the `0x3000` displacement completes `0xCC003000`.) Every
access reloads. This repeated
load-from-a-fixed-address pattern, with no store between the loads, is the
signature of polling a hardware register — and recovering it means typing the
pointer `volatile`, not bolting on a workaround.

## Your task

Write `read_status` to match the assembly above. The `vu32` typedef is part
of the shared preamble. Both loads must survive as separate `lwz`.

<!-- starter -->
```c
int read_status(void) {
    return 0;
}
```

<!-- solution -->
```c
int read_status(void) {
    int a = *(vu32*)0xCC003000;
    int b = *(vu32*)0xCC003000;
    return a + b;
}
```
