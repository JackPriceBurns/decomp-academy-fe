---
id: foundations-welcome
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

You've met `li` and `blr`. Here's the one new fact that brings them together: `r3`
is a special register — it's where a function's **return value** lives. So a
function that just returns a constant has very little to do: it loads that
constant into `r3` and finishes with `blr`. Take a look:

```asm
li   r3, 7       # put the constant 7 in r3
blr              # return
```

It loads `7` into `r3`, then ends with `blr`. Written in C, that's just simply:
```c
int answer(void) {
    return 7;
}
```

## Your task

For the exercise we've changed the value, so it won't be exactly the same. Look
closely at the **Target asm** and write the C. Hit **Compile & Check** (or
⌘/Ctrl + Enter) to check your result.

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
