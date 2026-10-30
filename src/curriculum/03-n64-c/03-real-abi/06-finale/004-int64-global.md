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
  - "The `sra` by 31 shows that the value being added was originally narrower than 64 bits, and signed. It is the parameter."
  - "Offsets 0 and 4 from one address completed with `%lo`, both loaded and stored: this is one 64-bit global, high word first, updated in place."
---

# Two words at one address

A 64-bit global combines the last two chapters directly: one `%hi`/`%lo`
address is used by *four* memory operations. Here is `nextFrame()`, which
adds 1 to the global `u64` `gFrames`:

```asm
lui    v0, %hi(gFrames)
addiu  v0, v0, %lo(gFrames)   # full address again: four memory ops need it
lw     t7, 4(v0)              # low word
lw     t6, 0(v0)              # high word
addiu  t9, t7, 1              # low + 1
sltiu  at, t9, 1              # the wrap check against the immediate, as before
addu   t8, t6, at             # high + carry
sw     t8, 0(v0)              # store both halves back
sw     t9, 4(v0)
jr     ra
nop
```

Every part of this is something you have seen before. The address is
completed with `addiu` up front, because four memory ops will use it. This is
the same reason as in the float lesson. The global's high word is at offset 0
and its low word at offset 4, in the same order you learned for register
pairs. The arithmetic is the `addiu`/`sltiu`/`addu` chain for adding a
constant, working on loaded words instead of argument registers. In C, all
eleven instructions are one statement: *global = global + 1*.

When you see this shape in a diff, start with the memory ops. Two loads and
two stores at offsets 0 and 4, all on one symbol, mean a 64-bit global
updated in place. Then read the middle as ordinary 64-bit arithmetic and ask
the usual questions. Is there a carry chain? Is one operand being widened as
it is used? Each answer gives you a piece of the C expression.

The target updates a different 64-bit global, and this time the value it adds
is not a constant. One extra fingerprint from the int64 chapter tells you
where that value comes from and what its type must be.

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
