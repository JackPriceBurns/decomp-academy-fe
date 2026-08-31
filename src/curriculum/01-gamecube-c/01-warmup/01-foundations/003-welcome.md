---
id: 8f8a31d5-a023-52db-b11a-7dada58d740b
slug: foundations-welcome
title: Your First Match
difficulty: 1
concepts:
  - registers
  - return-value
  - workflow
symbol: answer
hints:
  - The function should return the literal value 42.
  - A one-line `return` of that value is all it takes — the `li`/`blr` is the
    compiler's job.
---

# Your first match

You've seen `li` and `blr`. One more fact ties them together: `r3` is where a
function's **return value** lives. So a function that just returns a constant
has almost nothing to do — load the constant into `r3`, then `blr`.

```asm
li   r3, 7       # put the constant 7 in r3
blr              # return
```

In C, that's just:

```c
int answer(void) {
    return 7;
}
```

## Your task

For the exercise we've changed the value, so yours won't be a 7. Check the
**Target asm** and write the C. Hit **Compile & Check** (or ⌘/Ctrl + Enter) to
see how you did.

<!-- starter -->
```c
int answer(void) {
    // return the right number
    return 0;
}
```

<!-- solution -->
```c
int answer(void) {
    return 42;
}
```
