---
id: a1acd5e2-c933-4018-9dcb-3a769feb13cb
slug: foundations-welcome
title: Your First Match
difficulty: 1
concepts:
  - registers
  - return-value
  - workflow
symbol: answer
hints:
  - "The function should return the constant the target adds to `zero`."
  - "A one-line `return` of that value is all it takes — the `addiu` and the `jr ra`/`nop` pair are the compiler's job."
---

# Your first match

You've met `addiu`, the zero register, `jr ra`, and the delay slot. Here's the
one new fact that brings them together: `v0` is where a function's **return
value** lives. So a function that just returns a constant has very little to do:
it adds the constant to `zero`, lands the result in `v0`, and returns with a
`nop` riding in the delay slot. Take a look:

```asm
addiu  v0, zero, 7    # v0 = 0 + 7 — the constant, loaded
jr     ra             # return
nop                   # delay slot — nothing to do
```

Written in C, that's just simply:

```c
s32 answer(void) {
    return 7;
}
```

(That `s32` is this project's name for a signed 32-bit integer — the game's code
uses `s32`/`u32`-style type names everywhere, so this course does too. They're
already defined for you in every exercise.)

## Your task

For the exercise we've changed the value, so it won't be exactly the same. Look
closely at the **Target asm** and write the C. Hit **Compile & Check** (or
⌘/Ctrl + Enter) to check your result.

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
