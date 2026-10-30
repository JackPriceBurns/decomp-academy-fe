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
  - "A one-line `return` of that value is all you need. The compiler produces the `addiu` and the `jr ra`/`nop` pair."
---

# Your first match

You have met `addiu`, the zero register, `jr ra`, and the delay slot. One new
fact connects them: `v0` is where a function's **return value** goes. So a
function that returns a constant has very little to do. It adds the constant to
`zero` and puts the result in `v0`. Then it returns, with a `nop` in the delay
slot. Here is what that looks like:

```asm
addiu  v0, zero, 7    # v0 = 0 + 7, the constant
jr     ra             # return
nop                   # delay slot: nothing to do
```

In C, that is:

```c
s32 answer(void) {
    return 7;
}
```

(That `s32` is this project's name for a signed 32-bit integer. The game's code
uses type names like `s32` and `u32` everywhere, so this course does too. They
are already defined for you in every exercise.)

## Your task

The exercise uses a different value, so your function won't be exactly the
same. Look closely at the **Target asm** and write the C. Press
**Compile & Check** (or ⌘/Ctrl + Enter) to check your result.

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
