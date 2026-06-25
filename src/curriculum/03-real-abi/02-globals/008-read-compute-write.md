---
id: globals-read-compute-write
title: "Read Two Globals, Compute, Write Back"
difficulty: 3
concepts:
  - globals
  - sda21
  - chaining
  - load-compute-store
symbol: accumulate
hints:
  - Two @sda21 loads land in scratch registers, the arithmetic runs between them,
    and a single @sda21 store sends the result home.
  - The reads and the write are three independent globals — read the relocation
    name on each line to see which is which.
---

# The load–compute–store shape

Almost every interesting global function has the same skeleton: pull one or more
globals into registers, do some arithmetic, and store the result back. Each
access is still the plain `@sda21` load or store from the opening lessons — the
only new thing is that several of them appear in one body, threaded through
scratch registers.

The tell is the *pattern of relocations*. A run of `lwz ...@sda21` lines feeding
an arithmetic op that feeds a `stw ...@sda21` line is "read some globals, combine
them, write one global." The relocation name on each line names the global it
touches, so you can read the C straight off the reloc list.

Consider `blend2()`, which reads two int globals, subtracts one from the other,
and parks the difference in a third:

```asm
lwz   r3, gLo@sda21(r13)    # read global gLo
lwz   r0, gHi@sda21(r13)    # read global gHi
subf  r0, r3, r0            # r0 - r3 = gHi - gLo   (subf rD,rA,rB = rB - rA)
stw   r0, gDelta@sda21(r13) # gDelta = gHi - gLo
blr
```

Two loads, one arithmetic instruction, one store — and three distinct relocation
names. (Don't read the *load order* as meaningful: MWCC fetched `gLo` first even
though `gHi` is written first in the expression — it schedules the loads however
it likes, then `subf` puts the operands back in the right order.) The target
assembly for this lesson has the same shape but combines its two inputs with a
*different* operator. Read the opcode between the loads and the store to recover
it.

## Your task

The globals are declared for you: `gAlpha`, `gBeta`, `gTotal` (all `int`). Write
`accumulate` (no arguments, no return) to reproduce the assembly above.

<!-- starter -->
```c
void accumulate(void) {
    // read two globals, combine them, store the result in the third
}
```

<!-- solution -->
```c
void accumulate(void) {
    gTotal = gAlpha + gBeta;
}
```

<!-- context -->
```c
extern int gAlpha;
extern int gBeta;
extern int gTotal;
```
