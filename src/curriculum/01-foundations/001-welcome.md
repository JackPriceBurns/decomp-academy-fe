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

# Welcome to decompilation

**Decompiling** is the art of recovering the original C source from a compiled
binary. Here you don't guess — you *prove* it. You write C, the real
**Metrowerks CodeWarrior GC/2.0** compiler turns it into PowerPC assembly, and
we compare it, instruction for instruction, against the target. When every
instruction lines up, you have a **100% match**. Even a single extra
instruction counts as a mismatch, so small choices like a variable's type
matter more than you might expect.

## The first piece of PowerPC to know

The GameCube's CPU returns a function's result in register **`r3`**. A function
that returns an integer constant therefore does just two things:

```asm
li   r3, 42      # load immediate 42 into r3
blr              # branch to link register = "return"
```

`li` means *load immediate* and `blr` (*branch to link register*) is how every
function returns. You'll see `blr` at the end of almost everything.

## Your task

The target on the right is exactly those two instructions. Write `answer` to
match them. Hit **Compile & Check** (or ⌘/Ctrl + Enter).

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
