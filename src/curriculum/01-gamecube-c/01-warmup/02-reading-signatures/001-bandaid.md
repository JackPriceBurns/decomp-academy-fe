---
id: 6d80da0c-fa58-4837-b4ed-277079230657
slug: signatures-bandaid
title: The Band-Aid Comes Off
difficulty: 1
concepts:
  - calling-convention
  - workflow
  - mental-model
concept: true
---

# We've been holding your hand

Every exercise so far has handed you a function to fill in — the name, the return
type, the arguments, all laid out:

```c
int add2(int a, int b) {
    // you write this part
}
```

Those were training wheels. When you decompile for real, **nobody gives you that
line.** A disassembly is a pile of instructions and a symbol name — `add2` — and
nothing else. How many arguments it takes, what type they are, whether it even
returns anything at all: that's for *you* to work out, from the assembly, before
you can write a single line of C.

# So we're ripping the band-aid off

Painful as it may be, the sooner you learn to read a signature straight off the
machine, the better — so from here on, **the editor starts empty.** You get the
one thing you genuinely get in real decomp: the function's *name*, waiting for you
up in the header. Everything else is yours to derive.

The good news is that it's far more mechanical than it sounds. The **ABI** — the
calling convention — is a fixed set of rules about where arguments arrive and
where results come back. Learn the rules once and a signature falls out of the
first few instructions almost every time.

We'll start gently. For the next while **every value is a plain 32-bit `int`**, so
the return type is always `int` and the only question that changes from one
function to the next is:

- **how many arguments there are, and**
- **which registers they arrive in.**

Floats, pointers, and stranger return types have tells of their own, and we'll
come back for them later. Get counting arguments down first — then you're not
doing exercises anymore, you're doing the real thing.
