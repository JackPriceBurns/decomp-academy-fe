---
id: efee6c86-78d4-46c6-a14e-7b73a78bee00
slug: gba-optimizer-declaration-order
title: Declaration Order and Call Order
difficulty: 4
concepts:
  - optimizer
  - registers
  - calls
symbol: func_083ce774
hints:
  - The `sub` writes `r4` instead of `r0`, so the function needs a `mov r0, r4`
    before the epilogue. That happens when the value being subtracted *from*
    came from the earlier call.
  - "`extern s32 lower(s32 x);` and `extern s32 upper(s32 x);` are declared for
    you. The function takes one `s32` and returns an `s32`. The same argument
    is passed to both calls."
---

# The order the calls happen in

With MWCC on the GameCube, reordering local declarations is a standard way to
fix a match. If you move a variable up in the declaration list, the stack
layout changes with it. gcc 2.9 ignores declaration order completely. If you
swap two declarations and leave the statements below them alone, the object
file does not change by a single byte.

What does change the bytes is the order of the calls. A value that is produced
before a `bl` and read after it has to survive the call. So it is copied into a
callee-saved register before the call and read back afterwards. A value
produced by the *last* call is already in `r0` when the arithmetic starts, so
nothing has to move it.

This decides where the final result ends up. If the arithmetic builds its
result in `r0`, the epilogue needs no fix. If it builds the result in the
callee-saved register, it needs a `mov r0, rN` before the pops to put the
return value in place. So two functions with the same arithmetic can differ by
a whole instruction, only because of which call was written first.

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

The result of `sampleA` has to survive the second `bl`, so address 8 copies it
to `r5`. The shift and the add then write to `r5`, and the instruction at
address 20 has to move the answer into `r0`.

Now here is `callBFirst`. It is the same expression with the two calls swapped,
so the value that gets shifted comes from the second call:

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

`sampleB` runs first, and its result goes to `r5`. The value that gets shifted
is already in `r0` when the arithmetic starts, so the result is built there and
the final `mov` is gone. The function is two bytes shorter, and it still
computes exactly the same thing.

Read your target the same way. The register that the final `sub` writes to
tells you which of the two call results is the left-hand operand. That tells
you which call the C made first.

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
