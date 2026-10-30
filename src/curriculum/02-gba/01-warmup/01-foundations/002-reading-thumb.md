---
id: a0a21269-097f-45fd-a458-c8244277137c
slug: gba-foundations-reading-thumb
title: How to Read Thumb Assembly
difficulty: 1
concepts:
  - assembly
  - registers
  - thumb
  - mental-model
concept: true
---

# Reading a line of assembly

Assembly is the code the machine runs, written out in a form that people can
read. On this site it looks like this:

```asm
0        mov       r0, #7
2        bx        lr
```

That is two lines and two instructions. Assembly has **one instruction per
line**, and the instructions run from top to bottom.

## The numbers on the left are addresses

They are not line numbers. Each one is the **address** of its instruction: where
that instruction is in memory, counted in bytes from the start of the function.

They go up by **2**, because a Thumb instruction is exactly **two bytes** wide.
That is the reason Thumb exists. ARM's normal instructions are four bytes, and
the GBA's cartridge bus can only fetch sixteen bits at a time. A 32-bit
instruction needs two fetches from ROM, and a 16-bit one needs only one. Halving
the code size roughly doubles the speed of code that runs from the cartridge,
and that is why almost all GBA game code is Thumb.

Fitting an instruction into sixteen bits has costs, though, and you will deal
with them throughout this course.

## Mnemonic and operands

Every instruction is a **mnemonic** followed by its **operands**.

- The **mnemonic** says what the instruction does, such as move, add, load or
  branch.
- The **operands** are the values and registers it works on.

Take `mov r0, #7`. The mnemonic is `mov`, short for "move". The operands are
`r0` and `#7`. As on nearly every machine, the **destination comes first**, so
this line puts the constant 7 into register `r0`. The `#` marks an
**immediate**: a constant stored inside the instruction itself, so it does not
need to be loaded from anywhere.

Immediates are shown in **decimal** in this workspace. Assembly listings in
other tools often use hex, so keep that in mind when you compare them.

## Registers are numbered

Registers are a small number of fast storage slots inside the processor. They
hold the values that the processor is working on. The ARM7TDMI has sixteen.
Some machines give their registers names, but on the ARM7TDMI they are known by
number:

- **`r0` to `r7`** are the **low registers**. Thumb instructions can use these
  freely, so almost all the work happens here.
- **`r8` to `r12`** are the **high registers**. Most Thumb instructions cannot
  use them at all, so the compiler mostly avoids them. You will rarely see one.
- **`sp`** (`r13`) is the **stack pointer**.
- **`lr`** (`r14`) is the **link register**. It holds the address that a
  function must return to.
- **`pc`** (`r15`) is the **program counter**, the address being executed.

Eight usable registers is not many. Much of the code you will learn to read is
the compiler moving values between registers because it has run out of room.

There is no separate set of floating-point registers, because there is no
floating-point unit. The GBA cannot do decimal arithmetic in hardware at all.
This has large consequences, and a whole chapter covers it.

## Two operands, and the destination is overwritten

This is the first limit that comes from fitting instructions into sixteen bits:

```asm
0        add       r0, r1
2        bx        lr
```

`add r0, r1` means **`r0 = r0 + r1`**. There is no third operand for a separate
destination. The first operand is *both* a source and the destination, and its
old value is lost. Most Thumb arithmetic works this way.

A few instructions also have a three-operand form, which is used when the
destination is different from the sources:

```asm
0        add       r0, r1, r2
2        bx        lr
```

That one is `r0 = r1 + r2`. When you see the two-operand form, remember that a
value was overwritten. When you see the three-operand form, the compiler needed
to keep the original value.

## How a function returns

`bx lr` is how a function returns. It means "**b**ranch and e**x**change to the
address in `lr`", and `lr` holds the address where the caller wants to continue.
Nearly every function you decompile ends with one.

The "exchange" part means switching between ARM and Thumb code. GBA games use
both, so functions return with `bx` instead of a plain jump. Later you will see
that this makes some function endings look a little unusual.

## Branches point at addresses

A conditional branch shows its destination, and the workspace draws an arrow for
it:

```asm
0        cmp       r0, #0
2        bge       6 ~>
4        add       r0, #15
6      ~>asr       r0, #4
8        bx        lr
```

`cmp r0, #0` compares `r0` with zero. `bge 6 ~>` then jumps to address `6` if
the result was **greater or equal**. The ` ~>` marks the line as a branch, and
the matching `~>` in the gutter of line `6` shows where the branch lands. When
the branch is not taken, execution continues with the next line.

So this function skips the `add` for values that are not negative, and it always
runs the `asr`. Reading the arrows is how you recover `if`, `else`, and every
loop.

## You do not need to memorise this

There are many mnemonics, and you will learn them a few at a time. You do not
need to remember them all: **hover over any instruction in the diff** and a
tooltip explains it, with that line's own registers and values filled in. Use it
as often as you like.

---

That is enough to read your first target. In the next lesson you will match a
function.
