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
symbol: accumulate
hints:
  - Two @sda21 loads land in scratch registers, the arithmetic runs between them,
    and a single @sda21 store sends the result home.
  - The reads and the write are three independent globals — read the relocation
    name on each line to see which is which.
---

# The load–compute–store shape

By now most of the global functions you'll meet boil down to one shape. Something
gets read out of a global, gets munged a little, and the answer gets written to
another global. Nothing about the individual loads and stores changes. They're
the same `@sda21` accesses from the first lessons, just several of them sharing a
body and passing values through scratch registers.

You can spot the shape from the relocations alone. When a couple of `lwz
...@sda21` lines flow into an arithmetic op, and that op flows into a `stw
...@sda21` line, what you're looking at is a couple of globals read, mashed
together, and one written back. The relocation on a line tells you which global
that line touches, so honestly the reloc list does most of the decompiling for
you.

Take `blend2()`. It reads two int globals, subtracts one from the other, and
drops the difference into a third:

```asm
lwz   r3, gLo@sda21(r13)    # read global gLo
lwz   r0, gHi@sda21(r13)    # read global gHi
subf  r0, r3, r0            # r0 - r3 = gHi - gLo   (subf rD,rA,rB = rB - rA)
stw   r0, gDelta@sda21(r13) # gDelta = gHi - gLo
blr
```

So that's two loads, an arithmetic instruction, a store, and three relocation
names that never repeat. Ignore the *load order* while you're reading it. MWCC
fetched `gLo` before `gHi` even though `gHi` is written first in the expression,
simply because it reorders loads at will and trusts `subf` to sort the operands
out afterward. The exercise hands you this same shape with one twist, a
*different* operator binding its two inputs. The opcode between the loads and the
store is where you find it.

## Your task

The globals are declared for you: `gAlpha`, `gBeta`, `gTotal` (all `int`). Write
`accumulate` (no arguments, no return) to reproduce the assembly above.

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
