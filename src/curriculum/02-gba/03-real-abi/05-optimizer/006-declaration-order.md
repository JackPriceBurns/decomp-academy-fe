---
id: efee6c86-78d4-46c6-a14e-7b73a78bee00
slug: gba-optimizer-declaration-order
title: The Order You Declare Them
difficulty: 4
concepts:
  - optimizer
  - registers
  - calls
symbol: func_083ce774
hints:
  - The `sub` writes `r4`, not `r0`, which is why the function needs a
    `mov r0, r4` before the epilogue. That happens when the value being
    subtracted *from* was produced by the earlier call.
  - "`extern s32 lower(s32 x);` and `extern s32 upper(s32 x);` are declared for
    you. One `s32` in, one `s32` out, and the same argument goes to both
    calls."
---

# The order the calls happen in

On MWCC and GameCube, reordering local declarations is a standard matching
lever — move a variable up in the declaration list and the stack layout moves
with it. gcc 2.9 ignores declaration order completely. Swap two declarations
without touching the statements under them and the object file does not change
by a byte.

What does move the bytes is the order the calls happen in. A value produced
before a `bl` and read after it has to survive the call, so it is copied into a
callee-saved register on the way in and read back out afterwards. A value
produced by the *last* call is already sitting in `r0` when the arithmetic
starts, and nothing has to move it.

That decides where the final result ends up. Arithmetic that accumulates into
`r0` needs no epilogue fixup; arithmetic that accumulates into the callee-saved
register needs a `mov r0, rN` before the pops to place the return value. Two
functions with the same arithmetic can differ by a whole instruction purely
because of which call was written first.

Here is `callAFirst`, which calls `sampleA` before `sampleB` and shifts the
result of the first call:

```asm
0        push      {r4, r5, lr}
2        mov       r4, r0
4        bl        sampleA-4
8        mov       r5, r0
10       mov       r0, r4
12       bl        sampleB-4
16       lsl       r5, #2
18       add       r5, r0
20       mov       r0, r5
22       pop       {r4, r5}
24       pop       {r1}
26       bx        r1
```

`sampleA`'s result has to live across the second `bl`, so it goes to `r5` at
address 8. The shift and the add then land in `r5`, and address 20 has to move
the answer into `r0`.

Now `callBFirst`, the same expression with the two calls swapped, so the value
that gets shifted comes from the second call:

```asm
0        push      {r4, r5, lr}
2        mov       r4, r0
4        bl        sampleB-4
8        mov       r5, r0
10       mov       r0, r4
12       bl        sampleA-4
16       lsl       r0, #2
18       add       r0, r5
20       pop       {r4, r5}
22       pop       {r1}
24       bx        r1
```

`sampleB` runs first and its result takes `r5`. The value that gets shifted is
already sitting in `r0` when the arithmetic starts, so it accumulates there and
the trailing `mov` is gone. The function is two bytes shorter for a change that
alters nothing about what it computes.

Read your target the same way: the register the final `sub` writes into tells
you which of the two call results is the left-hand operand, and therefore which
call the C made first.

## Your task

Write `func_083ce774` to reproduce the target assembly.

<!-- context -->
```c
extern s32 lower(s32 x);
extern s32 upper(s32 x);
```

<!-- solution -->
```c
s32 func_083ce774(s32 x) {
    s32 hi = upper(x);
    s32 lo = lower(x);
    return hi - lo * 2;
}
```
