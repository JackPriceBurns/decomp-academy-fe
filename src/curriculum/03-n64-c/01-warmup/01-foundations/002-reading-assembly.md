---
id: ec2713f1-e160-445d-b965-1a4e889a90cc
slug: foundations-reading-assembly
title: How to Read MIPS Assembly
difficulty: 1
concepts:
  - assembly
  - registers
  - delay-slots
  - mental-model
concept: true
---

# Reading a line of assembly

Assembly is the code the machine runs, written out in a form that a person can
read. On this site it looks like this:

```asm
0:   addiu  v0, zero, 7
4:   jr     ra
8:   nop
```

There are three lines and three instructions. Assembly has **one instruction per
line**, and it runs from top to bottom.

## The numbers down the left are addresses

Notice first that the numbers on the left don't count up 1, 2, 3. They go up by
4, and they are written in hex. Each number is the **address** of its
instruction, which is the place in memory where that instruction is stored.
They are not line numbers. Every MIPS instruction is exactly 4 bytes, so the
addresses are evenly spaced. Addresses will matter in later lessons. For now you
can ignore the exact values and only need to know what they are.

## Mnemonic and operands

Every instruction is a **mnemonic** followed by zero or more **operands**.

- The **mnemonic** is *what the instruction does*: load a value, add, subtract,
  branch, return, and so on.
- The **operands** are the *arguments* it works on.

Take the first line, `addiu v0, zero, 7`. The mnemonic is `addiu`, which means
**add immediate**. (An "immediate" is a constant written directly into the
instruction.) The operands are `v0`, `zero`, and `7`. By MIPS convention the
**destination comes first**, so this line computes `zero + 7` and puts the
result in `v0`.

`zero` is a register, and a special one: it *always reads as 0*. So `zero + 7`
is `7`, and this instruction puts the constant `7` into `v0`. This is how MIPS
loads a constant. There is no separate "load a number" instruction, so the
compiler adds the number to the register that always holds nothing. (Some tools
print this pattern with the shorthand `li`, "load immediate". On this site you
will always see the real instruction.)

## The registers have names

`v0` and `zero` are **registers**. Registers are the small, fast storage slots
inside the processor, where it keeps the values it is working with right now.
MIPS has 32 of them. Unlike some CPUs, MIPS gives them *names*, and each name
tells you the register's job:

- **`zero`**: always reads as 0. Anything written to it is thrown away. It gives
  the hardware a free constant, and you just saw it do real work.
- **`v0`, `v1`**: function return **v**alues.
- **`a0` to `a3`**: the first four function **a**rguments.
- **`t0` to `t9`**: **t**emporaries, scratch registers the compiler uses freely.
- **`s0` to `s7`**: **s**aved registers. A function must put these back the way
  it found them.
- **`at`**: the **a**ssembler **t**emporary, a scratch register the compiler
  uses when an operation needs a helper value.
- **`sp`**: the **s**tack **p**ointer.
- **`ra`**: the **r**eturn **a**ddress, where a function goes back to.
- A few you will rarely see: `k0`/`k1` belong to the kernel, and `gp` and `fp`
  are not used in this game's code.

Floating-point values are kept apart from all of these, in their own bank of
registers `$f0` to `$f31` on the FPU. Later chapters cover them.

## The return, and the line after it

`jr ra` is the **return**. It means "**j**ump to the address in **r**egister
`ra`", and `ra` holds the address in the caller to go back to. Nearly every
function you decompile ends with one.

Look at the listing again, though. `jr ra` is not the last line. There is a
`nop` after it. This is the most important MIPS rule you will learn today:

**The instruction after every jump or branch always executes.** The CPU has
already fetched it by the time the jump takes effect, so it runs whether the
jump is taken or not. That position right after a branch is called the
**delay slot**. When the compiler has useful work for it, it puts a real
instruction there. When it doesn't, it fills the slot with `nop` ("no
operation"), an instruction that does nothing.

So read `jr ra` and the line after it **as a pair**: "return, and on the way
out, do this." In the listing above, the instruction in that slot does nothing.
Later you will see delay slots that hold real instructions, and knowing to look
there is a large part of reading MIPS.

## One more form to recognize

When an instruction accesses memory, you will see an operand like `0(a0)`. This
is **offset(base)** form, and it means "the address in `a0`, plus 0".
`lw v0, 4(a0)` reads the word at `a0 + 4` into `v0`. You don't need to do
anything with it yet. Only learn to recognize the form when it appears.

## You don't have to memorize any of this

There are a lot of mnemonics, and you will meet them a few at a time. You don't
need to keep them all in your head. **Hover any instruction in the diff** and a
tooltip explains what it does, with that line's own registers and values filled
in. Use it as much as you like. You will learn the common ones soon enough.

---

This is a simplified picture. MIPS has many more than three instructions, and
you will learn the rest when a lesson needs them. It is enough to read your
first target, though. Next, you will match your first C function.
