---
id: 69ed4882-6b29-4ca4-8395-54bada82a7cd
slug: gba-globals-pool-anatomy
title: Reading the Pool
difficulty: 3
concepts:
  - literal-pool
  - globals
  - constants
symbol: func_08324e3c
hints:
  - Two pool rows means two things the instruction set could not encode - one
    of them is an address, the other is a plain number printed in decimal.
  - "Nothing goes in, an `s32` comes out. 23130 is 0x5A5A; `eor` is C's `^`."
---

# What the rows after the code mean

The pool is not decoration. Every row of it belongs to the function, the diff
compares it, and a listing with the wrong pool is a listing that does not match.
Four things are worth knowing how to read.

**The `(->N)` annotation** is the workspace resolving the PC-relative arithmetic
for you. An `ldr rN, [pc, #imm]` computes its address as (address of the
instruction + 4), rounded *down* to a multiple of four, plus the immediate. The
rounding is the part that catches people: a load sitting two bytes past a
multiple of four rounds back down, so it shares its base with the instruction
before it.

**A `.word` row** is four bytes of data sitting in the instruction stream. It
never executes; the function has already branched or returned before control
reaches it.

**A `.hword 0` row** is two bytes of padding. A `.word` has to sit on a
four-byte boundary, so an odd number of two-byte instructions before the pool
forces a filler halfword.

**The pool's position** follows from that: the words go where the instruction
stream stops running straight ahead, which for a function without branches is
right after the return.

`setScore` hands a value it was given straight to a global. That is three
instructions, an odd count, so a filler halfword sits between the code and the
pool word:

```asm
0        ldr       r1, [pc, #4] (->8)
2        str       r0, [r1, #0]
4        bx        lr
6        .hword    0
8        .word     gHiScore
```

Double the value on the way through and the extra instruction swallows the
filler — same pool, same everything else:

```asm
0        ldr       r1, [pc, #4] (->8)
2        lsl       r0, #1
4        str       r0, [r1, #0]
6        bx        lr
8        .word     gHiScore
```

That makes the filler row a free parity check while you are matching. If your
attempt has a `.hword 0` and the target does not, your instruction *count* is
wrong by one, whatever the opcodes say.

Now `primeScore`, which stores a constant too large for a `mov`:

```asm
0        ldr       r1, [pc, #4] (->8)
2        ldr       r0, [pc, #8] (->12)
4        str       r0, [r1, #0]
6        bx        lr
8        .word     gHiScore
12       .word     1193046
```

Two rows of pool, one of each kind: an address, printed as a symbol name, and a
constant, printed in decimal. The two `ldr`s compute the same base — the first
sits at address 0 and 0 + 4 is already a multiple of four, the second sits at
address 2 and 2 + 4 rounds back down to 4 — so the immediates `#4` and `#8` are
the whole difference between the rows they land on.

Your target has two pool rows as well.

## Your task

Write `func_08324e3c` to reproduce the target assembly.

<!-- context -->
```c
extern s32 gSeed;
```

<!-- solution -->
```c
s32 func_08324e3c(void) {
    return gSeed ^ 0x5A5A;
}
```
