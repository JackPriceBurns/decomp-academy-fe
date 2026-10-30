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
  - "There are three pool words, in the order they were first needed: the guard's global, the array, and the one added at the end. Address 40 is the other exit."
  - "It takes an `s32` and returns an `s32`. The `cmp` at address 6 compares the argument with the global, and the `bge` at 8 jumps to the early exit. So the exit is the case where the argument is greater than or equal to the global."
---

# Where the pool goes when the code branches

So far, every pool in this chapter has come after the return. That is true for
a function that runs straight through without branching. The full rule is
wider. The compiler can place pool words anywhere execution cannot fall through
into them, which means after any unconditional branch. In a function with an
`if`, that place can be in the middle of the function.

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

Address 8 is data and address 12 is code. Only the `b` at address 6 tells you
which is which. The false arm loads `&gAlt`, jumps over its own pool word, and
lands at 14. The true arm loads `&gMode` and then continues into the same row.
Both arms share the dereference at 14. A single `ldr r0, [r0, #0]` reads two
different globals, because by that point the only difference is which address
is in the register.

Notice the filler halfwords too. Each pool site gets its own alignment padding
if it needs it, so `.hword 0` can appear more than once in a function. An error
of one instruction anywhere before a pool site moves everything after it.

Your target has three pool words, all in the middle of the function, and its
early exit comes after them at the very end. Work out the guard first, from the
comparison and the branch condition. The rest uses patterns you already know,
one after another.

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
