---
id: a593e84e-bfc8-4d60-8904-580ed043d924
slug: gba-globals-capstone
title: "Capstone: Global State"
difficulty: 5
concepts:
  - globals
  - literal-pool
  - branches
symbol: func_08356038
hints:
  - Three pool words in the order they were first needed - the guard's global,
    the array, and the one added at the end. Address 40 is the other way out.
  - "An `s32` in, an `s32` out. The `cmp` at address 6 weighs the argument against the global and the `bge` at 8 jumps to the early exit, so the exit is the greater-or-equal case."
---

# Where the pool goes when the code branches

Everything in this chapter has assumed the pool sits after the return, which
holds for a function that runs straight through. The actual rule is looser: the
compiler drops pool words wherever the instruction stream stops falling forward,
which means at any unconditional branch. In a function with an `if`, that place
can be the middle.

`pickMode` returns one of two globals:

```asm
0        cmp       r0, #0
2        bne       12 ~>
4        ldr       r0, [pc, #0] (->8)
6        b         14 ~>
8        .word     gAlt
12     ~>ldr       r0, [pc, #4] (->20)
14     ~>ldr       r0, [r0, #0]
16       bx        lr
18       .hword    0
20       .word     gMode
```

Address 8 is data and address 12 is code, with nothing but the `b` at address 6
to tell them apart. The false arm loads `&gAlt`, jumps over its own pool word,
and lands at 14. The true arm loads `&gMode` and falls into the same row. Both
arms share the dereference at 14 — one `ldr r0, [r0, #0]` serves two different
globals, because by then the difference is entirely in the register.

Note also the fillers. Each pool site gets its own alignment padding if it needs
it, so `.hword 0` can appear more than once in a function, and a
one-instruction error anywhere before a pool site moves everything after it.

Your target has three pool words, all of them stranded in the middle of the
function, and its early exit pushed past them to the very end. Work out the
guard first, from the comparison and the branch condition; the rest is shapes
you already know, stacked.

## Your task

Write `func_08356038` to reproduce the target assembly.

<!-- context -->
```c
extern s32 gEntries[32];
extern s32 gCount;
extern s32 gBase;
```

<!-- solution -->
```c
s32 func_08356038(s32 i) {
    if (i >= gCount) {
        return 0;
    }
    return gEntries[i] + gBase;
}
```
