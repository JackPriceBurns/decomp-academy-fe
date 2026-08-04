---
id: 853ef028-bd8f-5e0d-b5f6-e95a97528a0f
slug: advanced-hwreg-switch
title: "Chain: Switch on a Hardware Register"
difficulty: 4
concepts:
  - volatile
  - hardware-register
  - switch
  - compare-chain
  - chaining
symbol: func_8014fbc0
hints:
  - One volatile `lwz` from the 0xCC00xxxx range produces the value, then the
    sparse switch bisects *that loaded value* — not r3.
  - The probe constants are powers of two far apart, so it stays a compare chain;
    read each `cmpwi` to recover a case label and each `li r3, N` for its result.
---

# Read the device, then branch on what it said

Polling hardware almost never ends at the read itself. You pull a status word out
of a memory-mapped register and then do something with it, and that something is
very often a `switch`. So this lesson is the volatile hardware read from lesson 7
feeding straight into a `switch` from lessons 1 and 2. Whether that switch becomes
a table or a compare chain still comes down to the same density rule, only now
it's applied to the value the register handed back.

Take `classify_port(void)`, which reads the SI controller register at
`0xCC006400` and then bisects four scattered status codes.

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

There are two fingerprints sitting on top of each other here. The `lis`/`lwz`
pair against the `0xCC00` range is the volatile read, and the
`cmpwi`/`beq-`/`bge-` staircase after it is a sparse switch, comparing `r0`, the
value that was just loaded, rather than `r3`. Because the probe constants are
spread far apart, MWCC bisects them instead of building a table. Everything you
need is sitting in the assembly: the `lwz` displacement gives the register
offset, each `cmpwi` gives a case label, and each `li r3, N` gives a return
value.

## Your task

Write `func_8014fbc0` to reproduce the assembly above. Read the address off the
`lis`/`lwz` to recover which register is polled, then read the `cmpwi` probes and
`li r3, N` arms to recover the switch. The `vu32` typedef is in the shared
preamble; the single volatile read must feed the compare chain.

<!-- solution -->
```c
int func_8014fbc0(void) {
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
