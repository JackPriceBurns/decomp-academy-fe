---
id: 2d21aadd-d8f5-4421-919d-eb68679fff77
slug: gba-foundations-welcome
title: Your First Match
difficulty: 1
concepts:
  - registers
  - return-value
  - workflow
symbol: answer
hints:
  - The number the target moves into r0 is the number the function returns.
  - A one-line `return` of that value is the whole function — the `mov` and the
    `bx lr` are the compiler's job, not yours.
---

# Your first match

One more fact ties the last lesson together: **`r0` is where a function's return
value lives**. Whatever sits in `r0` when `bx lr` runs is what the caller
receives.

So a function that returns a constant has almost nothing to do. Drop the number
into `r0`, return. Here is one that hands back seven:

```asm
0        mov       r0, #7
2        bx        lr
```

Written in C, that is simply:

```c
s32 answer7(void) {
    return 7;
}
```

(`s32` is this course's name for a signed 32-bit integer. Real GBA projects use
`s8`/`u8`/`s16`/`u16`/`s32`/`u32` names everywhere rather than `int` and `short`,
so this course does too. They are already defined for you in every exercise.)

## Your task

Your target uses a different number, so read the **Target asm** panel and write
the C. Hit **Compile & Check** (or ⌘/Ctrl + Enter) to see how you did.

<!-- starter -->
```c
s32 answer(void) {
    // return the right number
    return 0;
}
```

<!-- solution -->
```c
s32 answer(void) {
    return 42;
}
```
