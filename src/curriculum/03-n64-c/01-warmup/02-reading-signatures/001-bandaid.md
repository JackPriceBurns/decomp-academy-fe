---
id: a4c967ab-1da1-4cf3-9ccd-99d938176a6e
slug: signatures-bandaid
title: Finding the Signature Yourself
difficulty: 1
concepts:
  - calling-convention
  - workflow
  - mental-model
concept: true
---

# Until now, the signature was given to you

Every exercise so far gave you the first line of the function: the name, the
return type and the arguments. You only had to fill in the body:

```c
s32 add2(s32 x, s32 y) {
    // you write this part
}
```

That line was extra help. When you decompile a real game, **nobody gives you
that line.** A disassembly is a list of instructions stored at an address that
the linker chose, such as `func_80241a2c`, and nothing else. The "name" is only
that address with a prefix. It tells you *where* the function is. It tells you
nothing about what the function does. You have to work out from the assembly
how many arguments the function takes, what type they are, and whether it
returns anything at all. You must do this *yourself* before you can write any
C.

# From now on, you work it out

It is best to learn early how to read a signature from the assembly. So from
here on, **the editor starts empty and the names no longer help.** Each exercise
is now named after its address: `func_` followed by eight hex digits. This is
the name a real decomp project gives a function that nobody has worked out yet.
The header shows you this name and nothing more. You derive everything else.

This is more mechanical than it sounds. The **ABI** (the calling convention) is
a fixed set of rules about where arguments arrive and where the result is
returned. You already know the main rule: arguments arrive in `a0` to `a3`, and
the result is returned in `v0`. Once you learn to apply these rules to the
disassembly, you can almost always read the signature from the first few
instructions. IDO also does you a favor that most compilers do not. The next
lesson explains it.

You will start with simple cases. For a while, **every value is a plain 32-bit
`s32`**. So the return type is always `s32`, and only two things change from
one function to the next:

- **how many arguments there are, and**
- **which registers they arrive in.**

Floats, pointers and other return types each leave their own signs in the
assembly, and later lessons cover them. First, learn to count arguments. Once
you can do that, you are doing the same work as a real decomp project.
