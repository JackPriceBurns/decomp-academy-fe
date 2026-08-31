---
id: a4c967ab-1da1-4cf3-9ccd-99d938176a6e
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
s32 add2(s32 x, s32 y) {
    // you write this part
}
```

Those were training wheels. When you decompile for real, **nobody gives you that
line.** A disassembly is a pile of instructions filed under whatever address the
linker parked it at — `func_80241a2c` — and nothing else. Even the "name" is
just that address wearing a prefix; it tells you *where* the function lives, and
not one thing about what it does. How many arguments it takes, what type they
are, whether it even returns anything at all: that's for *you* to work out, from
the assembly, before you can write a single line of C.

# So we're ripping the band-aid off

Painful as it may be, the sooner you learn to read a signature straight off the
machine, the better — so from here on, **the editor starts empty and the names
stop helping.** Every exercise now goes by its address, `func_` plus eight hex
digits — exactly what a real decomp project calls a function nobody has figured
out yet. The header hands you that placeholder and nothing more. Everything else
is yours to derive.

The good news is that it's far more mechanical than it sounds. The **ABI** — the
calling convention — is a fixed set of rules about where arguments arrive and
where results come back, and you already know the headline: arguments ride in
`a0`–`a3`, the result leaves in `v0`. Learn to read those rules off the
disassembly once and a signature falls out of the first few instructions almost
every time. IDO even does you a favor most compilers don't — but that's the
next lesson's story.

We'll start gently. For the next while **every value is a plain 32-bit `s32`**, so
the return type is always `s32` and the only question that changes from one
function to the next is:

- **how many arguments there are, and**
- **which registers they arrive in.**

Floats, pointers, and stranger return types have tells of their own, and we'll
come back for them later. Get counting arguments down first — then you're not
doing exercises anymore, you're doing the real thing.
