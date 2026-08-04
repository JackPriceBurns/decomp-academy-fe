---
id: 32d2bfed-7a45-565c-833f-81854fcfdfc4
slug: globals-read-compute-write
title: "Read Two Globals, Compute, Write Back"
difficulty: 3
concepts:
  - globals
  - sda21
  - chaining
  - load-compute-store
symbol: func_800b4afc
hints:
  - Two @sda21 loads land in scratch registers, the arithmetic runs between them,
    and a single @sda21 store sends the result home.
  - The reads and the write are three independent globals — read the relocation
    name on each line to see which is which.
---

# The load–compute–store shape

By now most global functions you'll meet boil down to one shape: read from a
global, munge it, write the answer to another global. Nothing about the individual
loads and stores changes — same `@sda21` accesses, just several sharing a body and
passing values through scratch registers.

You can spot the shape from the relocations alone. When a couple of
`lwz ...@sda21` lines flow into an arithmetic op, and that op flows into a
`stw ...@sda21`, you're looking at globals read, mashed together, and one written
back. The relocation on each line tells you which global it touches, so the reloc
list does most of the decompiling.

Take `blend2()`. It reads two int globals, subtracts one from the other, and drops
the difference into a third:

```asm
lwz   r3, gLo@sda21(r13)    # read global gLo
lwz   r0, gHi@sda21(r13)    # read global gHi
subf  r0, r3, r0            # r0 - r3 = gHi - gLo   (subf rD,rA,rB = rB - rA)
stw   r0, gDelta@sda21(r13) # gDelta = gHi - gLo
blr
```

Two loads, an arithmetic instruction, a store, and three relocation names that
never repeat. Ignore load order while reading. MWCC fetched `gLo` before `gHi` even
though `gHi` is written first in the expression, because it reorders loads and
trusts `subf` to sort operands afterward. The target has the same shape with a
different operator binding the inputs. Find it in the opcode between the loads and
the store.

## Your task

The globals are declared for you: `gAlpha`, `gBeta`, `gTotal` (all `int`). Write
`func_800b4afc` (no arguments, no return) to reproduce the assembly above.

<!-- solution -->
```c
void func_800b4afc(void) {
    gTotal = gAlpha + gBeta;
}
```

<!-- context -->
```c
extern int gAlpha;
extern int gBeta;
extern int gTotal;
```
