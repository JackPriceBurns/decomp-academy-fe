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
  - "The symbol name inside `%hi(…)` and `%lo(…)` is the global your C reads. It is already declared for you."
  - "One `return` statement produces both instructions. Don't try to write the address math yourself."
---

# Two instructions per global

So far every value has come from a register or the stack. Real games keep their
state in **globals**: variables at fixed addresses in memory. On MIPS, reaching
a fixed 32-bit address takes two steps, because no single instruction has room
for 32 bits of address.

Here is `readTimer`, which returns the global `s32` `gTimer`:

```asm
lui   v0, %hi(gTimer)      # upper half of the address
lw    v0, %lo(gTimer)(v0)  # + lower half, and load
jr    ra
nop
```

`lui` (**l**oad **u**pper **i**mmediate) puts a 16-bit value into the *top*
half of a register and sets the bottom half to zero. That handles the upper half
of the address. The `lw` then supplies the lower half in its offset field, and
loads from `upper + lower` in the same instruction. So one global read takes two
instructions. Every global access in this game starts with this same `lui`/`lw`
pair. The game was compiled with all small-data optimizations turned off, so
there are no shorter forms.

`%hi(gTimer)` is a **relocation**. When the function is compiled, the final
address of `gTimer` is not decided yet. The linker chooses it later, when it
joins the whole game together. So the diff shows a placeholder that names the
symbol and says which half of its address goes in which instruction. Your
compiled C gets the same placeholders, so to match you only need to name the
same global. (There is one more detail in how the two halves add up. The next
lesson covers it.)

The target reads a different global in the same way. The `extern` declaration is
already provided, so you only need to write one line of C.

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
