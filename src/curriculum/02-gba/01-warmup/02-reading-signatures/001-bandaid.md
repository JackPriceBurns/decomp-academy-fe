---
id: 05d072c9-4ae2-47a7-a7f1-5607e7f5fe89
slug: gba-signatures-bandaid
title: The Band-Aid Comes Off
difficulty: 1
concepts:
  - calling-convention
  - workflow
  - mental-model
concept: true
---

# We have been holding your hand

Every exercise so far handed you a function to fill in — the name, the return
type, the arguments, all laid out:

```c
s32 add2(s32 a, s32 b) {
    // you write this part
}
```

Those were training wheels. When you decompile for real, **nobody gives you that
line.** A disassembly is a pile of instructions filed under whatever address the
linker parked them at, and nothing else. How many arguments the function takes,
what types they are, whether it returns anything at all — that is for you to work
out, from the assembly, before you can write a line of C.

# So we are ripping it off

From here on, **the editor starts empty and the names stop helping.** Every
exercise goes by its address: `func_` followed by eight hex digits, exactly what
a real decomp project calls a function nobody has figured out yet.

Those digits will always start `08`, and that is not decoration. The GBA maps the
game cartridge at address `0x08000000`, so every byte of ROM code lives somewhere
in `0x08000000`–`0x09FFFFFF`. A function named `func_0803f1a4` is simply the one
that begins 0x3f1a4 bytes into the ROM. Open a real GBA decomp project and the
undone functions are named exactly this way. (Code copied into fast internal RAM
gets `03…` names instead, but that is a detail for much later.)

The header hands you that address and nothing more. Everything else is yours.

# It is more mechanical than it sounds

The **ABI** — the calling convention — is a fixed set of rules about where
arguments arrive and where results leave, and you already know the headline:

- arguments ride in **`r0`, `r1`, `r2`, `r3`**, in order;
- the result leaves in **`r0`**.

Learn to read those rules off a disassembly once and a signature falls out of the
first few instructions almost every time.

We will start gently. For the next while **every value is a plain 32-bit `s32`**,
so the return type is either `s32` or nothing at all, and the only questions that
change from function to function are:

- **how many arguments there are**, and
- **which registers they arrive in**.

Narrow types, pointers, floats and stranger returns all have tells of their own,
and later chapters come back for them. Get counting down first — then you are not
doing exercises any more, you are doing the real thing.
