---
id: globals-read-int
title: Reading a Global Through the Small Data Area
difficulty: 2
concepts:
  - globals
  - sda
  - sda21
  - r13
symbol: readFrameCount
hints:
  - A global int is loaded with a single `lwz` relative to r13 (the SDA base).
  - "`return gFrameCount;` compiles to `lwz r3, gFrameCount@sda21(r13)` —
    relocation R_PPC_EMB_SDA21."
---

# How a global is addressed

A 32-bit GameCube address won't fit in an instruction, so the compiler can't just
`lwz` a global by its absolute address. MWCC's answer is the **Small Data Area
(SDA)**: at startup, register **`r13`** is pointed at a fixed base, and frequently
used globals are gathered into a window reachable by a signed 16-bit offset from
it. That window is only 64 KB wide (±32 KB from the base), so on a large game
some globals spill out and have to be reached the longer way (the `@ha`/`@l`
addressing a few lessons from now). For anything that fits, reading one is a
single load with that offset baked in by the linker:

```asm
lwz   r3, g@sda21(r13)   # load global g, r13-relative
blr
```
```
R_PPC_EMB_SDA21   g
```

The `@sda21` operand is a **relocation** — in an unlinked object the disassembler
prints `lwz r3, 0(0)` with an attached `R_PPC_EMB_SDA21 g` line, because the
offset and base register aren't filled in until link time. That `R_PPC_EMB_SDA21`
line is the unmistakable signature of an ordinary (non-array) global. Whether the
global is `extern` or defined in this file, the access looks identical.

## Your task

Declare nothing yourself — `extern int gFrameCount;` is already provided. Write
`readFrameCount` to match the target assembly above.

<!-- starter -->
```c
int readFrameCount(void) {
    return 0;
}
```

<!-- solution -->
```c
int readFrameCount(void) {
    return gFrameCount;
}
```

<!-- context -->
```c
extern int gFrameCount;
```
