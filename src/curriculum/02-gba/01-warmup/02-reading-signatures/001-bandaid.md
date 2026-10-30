---
id: 05d072c9-4ae2-47a7-a7f1-5607e7f5fe89
slug: gba-signatures-bandaid
title: Starting From an Empty Editor
difficulty: 1
concepts:
  - calling-convention
  - workflow
  - mental-model
concept: true
---

# What the earlier exercises gave you

Every exercise so far gave you the first line of the function. It showed the
name, the return type and the arguments, and you wrote the body:

```c
s32 add2(s32 a, s32 b) {
    // you write this part
}
```

That line was there to help you while you learned. In real decompilation work,
**nobody gives you that line.** A disassembly is a list of instructions at the
address where the linker placed them, and nothing else. You have to work out
from the assembly how many arguments the function takes, what types they are,
and whether it returns anything. You need those answers before you can write
any C.

# What changes from now on

From now on, **the editor starts empty and the function names give you no
clues.** Each exercise is named after its address: `func_` followed by eight hex
digits. This is the name a real decomp project gives to a function that nobody
has worked out yet.

The digits always start with `08`, and there is a reason for that. The GBA maps
the game cartridge at address `0x08000000`, so all ROM code is somewhere between
`0x08000000` and `0x09FFFFFF`. A function named `func_0803f1a4` is the one that
starts 0x3f1a4 bytes into the ROM. Real GBA decomp projects name their
unfinished functions in exactly this way. (Code that is copied into fast
internal RAM gets `03…` names instead, but you will not need that until much
later.)

The header shows you that address and nothing else. You work out the rest
yourself.

# A fixed set of rules

The **ABI** (the calling convention) is a fixed set of rules. It says where the
arguments arrive when a function starts, and where the result goes when it
returns. You already know the main rules:

- the arguments arrive in **`r0`, `r1`, `r2`, `r3`**, in order;
- the result is returned in **`r0`**.

Once you can apply those rules to a disassembly, you can almost always read the
signature from the first few instructions.

The first exercises keep things simple. For now, **every value is a plain
32-bit `s32`**. So the return type is either `s32` or nothing, and the only
questions that change from one function to the next are:

- **how many arguments there are**, and
- **which registers they arrive in**.

Narrow types, pointers, floats and less common return types each have their own
signs in the assembly, and later chapters cover them. First, learn to count the
arguments. Once you can do that, you are doing the same work as a real decomp
project.
