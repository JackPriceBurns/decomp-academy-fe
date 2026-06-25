---
id: advanced-hwreg-switch
title: "Chain: Switch on a Hardware Register"
difficulty: 4
concepts:
  - volatile
  - hardware-register
  - switch
  - compare-chain
  - chaining
symbol: decode_irq
hints:
  - One volatile `lwz` from the 0xCC00xxxx range produces the value, then the
    sparse switch bisects *that loaded value* — not r3.
  - The probe constants are powers of two far apart, so it stays a compare chain;
    read each `cmpwi` to recover a case label and each `li r3, N` for its result.
---

# Read the device, then branch on what it said

Hardware polling rarely stops at the read. You fetch a status word from a
memory-mapped register, then *act on its value* — and "act on" is frequently a
`switch`. This chains two idioms you've met: the **volatile hardware read**
(lesson 7) supplies the value, and a **switch** (lessons 1–2) dispatches on it.
The density rule still decides table-vs-chain, applied to the register's value.

Consider `classify_port(void)`, which reads the SI controller register at
`0xCC006400` and bisects four scattered status codes:

```asm
lis   r3, -13312     # 0xCC000000 high half
lwz   r0, 25600(r3)  # single volatile read (0x6400 = 25600) -> r0 = status
cmpwi r0, 32         # the switch probes the LOADED value, not an argument
beq-  .case32
bge-  .hi
cmpwi r0, 8
beq-  .case8
b     .default
.hi:
cmpwi r0, 128
beq-  .case128
b     .default
.case8: li r3, 1  blr   # each arm is the usual li/blr
```

Two fingerprints stacked: the `lis`/`lwz` from the `0xCC00` range is the
volatile read, and the `cmpwi`/`beq-`/`bge-` staircase that follows is a sparse
switch — note it compares `r0` (the value just loaded), never `r3`. The probe
constants are far apart, so MWCC bisects rather than building a table. The asm
hands you everything: the `lwz` displacement is the register offset, each
`cmpwi` is a case label, each `li r3, N` is a return value.

## Your task

Write `decode_irq(void)` to reproduce the assembly above. Read the address off
the `lis`/`lwz` to recover which register is polled, then read the `cmpwi`
probes and `li r3, N` arms to recover the switch. The `vu32` typedef is in the
shared preamble; the single volatile read must feed the compare chain.

<!-- starter -->
```c
int decode_irq(void) {
    return 0;
}
```

<!-- solution -->
```c
int decode_irq(void) {
    int id = *(vu32*)0xCC003000;
    switch (id) {
        case 4:   return 1;
        case 16:  return 2;
        case 64:  return 3;
        case 256: return 4;
        default:  return 0;
    }
}
```
