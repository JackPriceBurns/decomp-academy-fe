---
id: 3e5eafaa-3d30-4348-ba35-3d46b5a01615
slug: gba-optimizer-dead-code
title: Code That Left No Trace
difficulty: 3
concepts:
  - optimizer
  - dead-code
  - calls
symbol: func_083c588c
hints:
  - Nothing in the listing reads what the callee returned, so the call is made
    purely for its side effect. The frame is there because two values have to
    outlive it.
  - "`extern s32 refresh(s32 n);` is declared for you. Two parameters in, an
    `s32` out: a pointer whose first element is read after the call, and a
    count that is both passed in and added afterwards."
---

# What is not there

Dead-code elimination is the one optimizer pass that actively destroys
evidence. A local that is assigned and never read does not become a shorter
instruction sequence — it becomes nothing at all, and the target you are
matching contains no hint that the original C ever mentioned it.

gcc 2.9 knows which operations are side-effect free, and that list includes the
libgcc helpers. So an unused divide leaves nothing at all: the `bl __divsi3`
goes, and the whole frame it would have needed goes with it.

Here are two functions that differ in one character — whether the final sum
reads `v` or `t`:

```asm
0        add       r0, r1
2        bx        lr
```

That is `s32 t = v / w; return v + w;`. The division is gone. No helper call,
no `push`, no interworking epilogue: two instructions, because nothing ever
looks at `t`.

```asm
0        push      {r4, lr}
2        mov       r4, r1
4        bl        __divsi3-4
8        add       r0, r4
10       pop       {r4}
12       pop       {r1}
14       bx        r1
```

Same divide, now read once, and the function costs seven instructions and a
callee-saved register. The lesson for matching is blunt: never add an operation
to your C because you feel it ought to be there. If the target does not show
it, the target does not contain it.

A call is the exception, and it goes the other way. gcc cannot prove an
external function is side-effect free, so a `bl` survives even when its result
is discarded — and discarding the result changes nothing about the frame. What
the frame pays for is the values that must still be alive when the callee
returns: each one gets copied into a callee-saved register on the way in and
read back on the way out.

Your target makes that call and ignores what comes back. Work out from the
`push` list how many values had to survive it, and notice that one of them is
handed to the callee as well.

## Your task

Write `func_083c588c` to reproduce the target assembly.

<!-- context -->
```c
extern s32 refresh(s32 n);
```

<!-- solution -->
```c
s32 func_083c588c(s32 *p, s32 n) {
    refresh(n);
    return p[0] + n;
}
```
