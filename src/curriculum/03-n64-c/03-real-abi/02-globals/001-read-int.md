---
id: 09870dde-c37b-48fe-afac-6edc0439c849
slug: globals-read-int
title: Reading a Global
difficulty: 1
concepts:
  - globals
  - hi-lo
  - relocations
symbol: func_80261c34
hints:
  - "The symbol name inside `%hi(…)` and `%lo(…)` is the global your C reads — it's already declared for you."
  - "One `return` statement produces both instructions; don't try to write the address math yourself."
---

# Two instructions per global

So far every value has come from a register or the stack. Real games keep their
state in **globals** — variables at fixed addresses in memory. And on MIPS,
reaching a fixed 32-bit address takes two steps, because no single instruction
has room for 32 bits of address.

Here's `readTimer`, which returns the global `s32` `gTimer`:

```asm
lui   v0, %hi(gTimer)      # upper half of the address
lw    v0, %lo(gTimer)(v0)  # + lower half, and load
jr    ra
nop
```

`lui` — **l**oad **u**pper **i**mmediate — puts a 16-bit value into the *top*
half of a register, zeroing the bottom. That handles the address's upper half.
The `lw` then supplies the lower half in its offset field and loads from
`upper + lower` in one go. Two instructions, one global read. This exact
`lui`/`lw` pair is how *every* global access in this game begins — the game was
compiled with all small-data optimizations off, so there are no shortcuts.

What's `%hi(gTimer)`? A **relocation**: at this point the final address of
`gTimer` isn't decided yet — the linker picks it when the whole game is glued
together. So the diff shows a placeholder naming the symbol and which half of
its address goes in which slot. Your compiled C gets the same placeholders, and
matching only requires that you name the same global. (There's a subtle wrinkle
in how the two halves add up — next lesson.)

The target reads a different global the same way. The `extern` declaration is
already provided; your job is one line of C.

## Your task

`extern s32 gFuel;` is declared for you. Write `func_80261c34` to reproduce the
target assembly.

<!-- solution -->
```c
s32 func_80261c34(void) {
    return gFuel;
}
```

<!-- context -->
```c
extern s32 gFuel;
```
