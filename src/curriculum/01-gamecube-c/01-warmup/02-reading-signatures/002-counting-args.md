---
id: a529d50a-60a6-4352-8ea5-655e4affb012
slug: signatures-counting-args
title: Counting the Arguments
difficulty: 1
concepts:
  - calling-convention
  - registers
  - arguments
concept: true
---

# Where the arguments live

The GameCube ABI hands a function its first several integer arguments in the
registers **`r3, r4, r5, r6, r7, r8, r9, r10`** — in that order. The first
argument is in `r3`, the second in `r4`, the third in `r5`, and so on. The result
comes back in `r3` too, which is why it has doubled as the return register in
every lesson so far.

That fixed mapping is the whole trick: if you can see which registers a function
reads, you know which arguments it has.

## Counting from the assembly

Here is a function that adds its second and fourth arguments together:

```asm
add   r3, r4, r6
blr
```

Read the two source registers: `r4` and `r6`. By the mapping, `r4` is the **2nd**
argument and `r6` is the **4th**. So this function takes (at least) four integer
arguments, and the C that produced it was:

```c
int combine(int a, int b, int c, int d) {
    return b + d;
}
```

Look closely and you'll notice `a` and `c` appear *nowhere* in the assembly. **An
argument that arrives but is never used generates no code at all** — it is
invisible in the disassembly. You don't spot `a` and `c` directly; you *deduce*
them, because `d` sits in `r6`, and nothing can be the fourth argument unless
three arguments come before it.

## The rule

> Find the **highest-numbered argument register** the function touches. Its
> position is your argument count. Declare every argument up to it — including the
> ones in between that the code skips straight over.

That is the entire skill for now. A lone `r3` → one argument. Reads up to `r5` →
three arguments, even if `r4` is nowhere in sight. Reads `r7` → five. Work out
that number, give each parameter the type `int`, return an `int`, and the
signature is reconstructed.
