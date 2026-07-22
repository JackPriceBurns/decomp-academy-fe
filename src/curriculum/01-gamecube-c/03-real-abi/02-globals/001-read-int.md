---
id: c08496b3-fbaa-519e-a215-cee05abfb4a6
slug: globals-read-int
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

# Globals live a short hop from r13

Here is the problem. A GameCube address is 32 bits, and a single PowerPC
instruction has nowhere to put all of them, so you cannot `lwz` a global from its
absolute address. The **Small Data Area** is how MWCC gets around that. Boot code
points register **`r13`** at one fixed base, and the globals a game leans on most
are packed into a window that a signed 16-bit offset off `r13` can cover. It is
not a big window, just 64 KB, ±32 KB to either side. Spill past it on a large
game and a global has to take the long way around with `@ha`/`@l`, which shows up
later. While it fits, one load does the job, and the linker bakes the offset in:

```asm
lwz   r3, g@sda21(r13)   # load global g, r13-relative
blr
```
```
R_PPC_EMB_SDA21   g
```

The `@sda21` is a **relocation**, not a real address. An unlinked object
disassembles to `lwz r3, 0(0)` plus a dangling `R_PPC_EMB_SDA21 g` line, because
the offset and base register stay unresolved until link time. That
`R_PPC_EMB_SDA21` line is your tell for a plain, non-array global, and it shows up
the same way whether the global is `extern` or defined right here.

## Your task

Declare nothing yourself — `extern int gFrameCount;` is already provided. Write
`readFrameCount` to match the target assembly above.

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
