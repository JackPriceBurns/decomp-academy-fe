---
id: 3e5eafaa-3d30-4348-ba35-3d46b5a01615
slug: gba-optimizer-dead-code
title: Unused Code Is Removed
difficulty: 3
concepts:
  - optimizer
  - dead-code
  - calls
symbol: func_083c588c
hints:
  - Nothing in the listing reads the value the callee returned, so the call is
    made only for its side effect. The function has a frame because two values
    must survive the call.
  - "`extern s32 refresh(s32 n);` is declared for you. The function takes two
    parameters and returns an `s32`. The first is a pointer whose first element
    is read after the call. The second is a count that is passed to the call
    and also added afterwards."
---

# What is not there

Dead-code elimination is the one optimizer pass that destroys evidence. If a
local is assigned and never read, the compiler removes it completely, with no
instructions left behind. The target you are matching has no sign that the
original C ever mentioned that local.

gcc 2.9 knows which operations have no side effects, and that list includes the
libgcc helpers. So an unused divide leaves nothing behind. The `bl __divsi3` is
removed, and so is the whole frame that the call would have needed.

Here are two functions that differ in one character. The only difference is
whether the final sum reads `v` or `t`:

```asm
0        add       r0, r1
2        bx        lr
```

That is `s32 t = v / w; return v + w;`. The division is gone. There is no
helper call, no `push` and no interworking epilogue. The function is two
instructions, because nothing ever reads `t`.

```asm
0        push      {r4, lr}
2        mov       r4, r1
4        bl        __divsi3-4
8        add       r0, r4
10       pop       {r4}
12       pop       {r1}
14       bx        r1
```

This is the same divide, but now its result is read once. The function needs
seven instructions and a callee-saved register. The rule for matching follows
from this. Never add an operation to your C only because you feel it should be
there. If the target does not show it, the target does not contain it.

A call to another function is the exception. gcc cannot prove that an external
function has no side effects, so a `bl` stays even when its result is thrown
away. Throwing the result away does not change the frame either. The frame
exists for the values that must still be alive when the callee returns. Each of
those values is copied into a callee-saved register before the call and read
back after it.

Your target makes such a call and ignores the value it returns. Use the `push`
list to work out how many values had to survive the call. Notice that one of
them is also passed to the callee.

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
