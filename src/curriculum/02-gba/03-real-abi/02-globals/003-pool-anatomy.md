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
  - Two pool rows means two values that no instruction could encode. One of
    them is an address. The other is a plain number, printed in decimal.
  - "It takes no arguments and returns an `s32`. 23130 is 0x5A5A, and `eor` is C's `^`."
---

# What the rows after the code mean

Every row of the pool belongs to the function, and the diff compares it. If
your pool is wrong, your listing does not match. There are four things worth
learning to read.

**The `(->N)` annotation** is the workspace doing the PC-relative address
calculation for you. An `ldr rN, [pc, #imm]` computes its address like this:
take the address of the instruction + 4, round it *down* to a multiple of four,
then add the immediate. People often miss the rounding. A load two bytes past a
multiple of four rounds back down, so it uses the same base as the instruction
before it.

**A `.word` row** is four bytes of data placed in the instruction stream. It
never runs as code, because the function has already branched or returned
before execution reaches it.

**A `.hword 0` row** is two bytes of padding. A `.word` must start on a
four-byte boundary. If an odd number of two-byte instructions comes before the
pool, the compiler adds a filler halfword.

**The pool's position** follows from the fact that it never runs. The words go
where the instruction stream stops running straight ahead. For a function
without branches, that is right after the return.

`setScore` stores the value it was passed straight into a global. That takes
three instructions, which is an odd count, so a filler halfword sits between
the code and the pool word:

```asm
0        ldr       r1, [pc, #4] (->8)
2        str       r0, [r1, #0]
4        bx        lr
6        .hword    0
8        .word     gHiScore
```

If the function doubles the value first, the extra instruction takes the place
of the filler. The pool and everything else stay the same:

```asm
0        ldr       r1, [pc, #4] (->8)
2        lsl       r0, #1
4        str       r0, [r1, #0]
6        bx        lr
8        .word     gHiScore
```

So the filler row is a quick check on whether your instruction count is odd or
even. If your attempt has a `.hword 0` and the target does not, your
instruction *count* is wrong by one, even if the opcodes look right.

Now look at `primeScore`, which stores a constant too large for a `mov`:

```asm
0        ldr       r1, [pc, #4] (->8)
2        ldr       r0, [pc, #8] (->12)
4        str       r0, [r1, #0]
6        bx        lr
8        .word     gHiScore
12       .word     1193046
```

The pool has two rows, one of each kind: an address, printed as a symbol name,
and a constant, printed in decimal. The two `ldr`s compute the same base. The
first is at address 0, and 0 + 4 is already a multiple of four. The second is
at address 2, and 2 + 4 rounds down to 4. So the immediates `#4` and `#8` are
the only thing that decides which row each load reads.

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
