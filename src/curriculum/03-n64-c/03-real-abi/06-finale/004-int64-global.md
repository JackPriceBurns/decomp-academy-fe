---
id: ffea4dc2-9914-4697-b50b-c7ef15a7eddb
slug: finale-int64-global
title: A 64-bit Global, Read-Modify-Write
difficulty: 4
concepts:
  - int64
  - globals
  - carry
  - hi-lo
  - sign-extension
symbol: func_803fa934
hints:
  - "The `sra` by 31 says the value being added started life narrower than 64 bits — and signed. It's the parameter."
  - "Offsets 0 and 4 off one `%lo`-completed address, loaded and stored: one 64-bit global, high word first, updated in place."
---

# Two words at one address

A 64-bit global fuses the last two chapters directly: one `%hi`/`%lo`
address, *four* memory operations. Here's `nextFrame()`, which adds 1 to
the global `u64` `gFrames`:

```asm
lui    v0, %hi(gFrames)
addiu  v0, v0, %lo(gFrames)   # full address again — four memory ops need it
lw     t7, 4(v0)              # low word
lw     t6, 0(v0)              # high word
addiu  t9, t7, 1              # low + 1
sltiu  at, t9, 1              # the immediate wrap check you know
addu   t8, t6, at             # high + carry
sw     t8, 0(v0)              # both halves go home
sw     t9, 4(v0)
jr     ra
nop
```

Everything is a rerun, recombined. The address is completed with `addiu`
up front — four memory ops will use it, same reasoning as the float
lesson. The global's high word lives at offset 0 and its low word at
offset 4, exactly the order register pairs taught you. And the payload is
the `addiu`/`sltiu`/`addu` add-a-constant chain, operating on loaded
words instead of argument registers. In C, all eleven instructions are
one statement: *global = global + 1*.

When you meet this shape in a diff, anchor on the memory ops: two loads
and two stores, offsets 0 and 4, one symbol — a 64-bit global being
updated in place. Then read the middle as ordinary 64-bit arithmetic,
asking the usual questions. Is there a carry chain? Is one operand being
widened on the fly? Every answer maps to a piece of the C expression.

The target updates a different 64-bit global — and what it adds isn't a
constant this time. One extra fingerprint from the int64 chapter tells
you where the addend comes from and what its type must be.

## Your task

`extern s64 gTicks;` is declared for you. Write `func_803fa934` to reproduce
the target assembly.

<!-- solution -->
```c
void func_803fa934(s32 delta) {
    gTicks = gTicks + delta;
}
```

<!-- context -->
```c
extern s64 gTicks;
```
