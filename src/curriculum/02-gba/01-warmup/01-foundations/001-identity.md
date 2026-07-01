---
id: gba-foundations-identity
title: Arguments Live in Registers Too
difficulty: 1
concepts:
  - registers
  - calling-convention
symbol: identity
hints:
  - The argument `x` arrives in r0, which is also the return register.
  - Returning it unchanged needs no work at all — agbcc emits just `bx lr`.
---

# Where do arguments come from?

The Game Boy Advance runs an ARM7TDMI, and these lessons compile to its compact
**Thumb** instruction set. The first integer argument arrives in `r0` — the very
same register a function hands its result back in. That overlap has a funny
consequence: a few functions give the compiler nothing to emit beyond the return.

```asm
bx	lr
```

One `bx lr`, and that is a whole valid function. Further integer and pointer
arguments stack up in `r1`, `r2`, and `r3`; anything past the fourth spills onto
the stack. The return address rides in `lr`, the *link register*, so `bx lr` is
simply "branch back to whoever called us".

So when the assembly is just a `bx lr` with nothing touching `r0`, here is the
question to ask: what would the input and output have to be for no work to be
needed at all?

## Your task

Write `identity`, taking an `int x`, to reproduce the assembly above.

<!-- starter -->
```c
int identity(int x) {
    return 0;
}
```

<!-- solution -->
```c
int identity(int x) {
    return x;
}
```
