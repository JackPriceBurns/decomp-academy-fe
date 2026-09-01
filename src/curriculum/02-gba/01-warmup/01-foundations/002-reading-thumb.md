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

Assembly is the code the machine runs, tidied up just enough to be readable. On
this site it looks like this:

```asm
0        mov       r0, #7
2        bx        lr
```

Two lines, two instructions — assembly is **one instruction per line**, running
top to bottom.

## The numbers down the left are addresses

They are not line numbers. Each one is the **address** of its instruction: where
that instruction sits in memory, counted in bytes from the start of the function.

They step by **2**, because a Thumb instruction is exactly **two bytes** wide.
That is the whole point of Thumb — ARM's normal instructions are four bytes, and
the GBA's cartridge bus can only fetch sixteen bits at a time, so a 32-bit
instruction costs two fetches from ROM and a 16-bit one costs a single fetch.
Halving the code size roughly doubles the speed of code running from the
cartridge, and that trade is why almost all GBA game code is Thumb.

Squeezing an instruction into sixteen bits costs something, though, and you are
about to spend the whole course paying it.

## Mnemonic and operands

Every instruction is a **mnemonic** followed by its **operands**.

- The **mnemonic** says what the instruction does — move, add, load, branch.
- The **operands** are what it does it to.

Take `mov r0, #7`. The mnemonic is `mov`, "move". The operands are `r0` and
`#7`, and — as on nearly every machine — the **destination comes first**. So
this line puts the constant 7 into register `r0`. The `#` marks an
**immediate**: a constant carried inside the instruction itself, rather than
fetched from anywhere.

Immediates print in **decimal** in this workspace. Assembly listings elsewhere
often use hex, so keep that in mind when you compare notes with other tools.

## The registers are numbered, not named

Registers are the handful of fast slots inside the processor where it keeps the
values it is working on. The ARM7TDMI has sixteen, and unlike some machines they
go by number:

- **`r0`–`r7`** — the **low registers**. Thumb instructions can reach these
  freely, so essentially all the work happens here.
- **`r8`–`r12`** — the **high registers**. Most Thumb instructions cannot touch
  them at all, so the compiler mostly leaves them alone. You will rarely see one.
- **`sp`** (`r13`) — the **stack pointer**.
- **`lr`** (`r14`) — the **link register**, holding the address a function must
  return to.
- **`pc`** (`r15`) — the **program counter**, the address being executed.

Eight usable registers is not many. A great deal of what you will learn to read
is the compiler shuffling values between them because it ran out of room.

There is no separate bank of floating-point registers, because there is no
floating-point unit. The GBA cannot do decimal arithmetic in hardware at all —
a fact with consequences big enough that a whole chapter is devoted to it.

## Two operands, and the destination gets overwritten

Here is the first place sixteen bits starts to hurt:

```asm
0        add       r0, r1
2        bx        lr
```

`add r0, r1` means **`r0 = r0 + r1`**. There is no third operand naming a
separate destination — the first operand is *both* a source and the destination,
and its old value is gone. Most Thumb arithmetic works this way.

A three-operand form exists for a few instructions when the destination differs
from the sources:

```asm
0        add       r0, r1, r2
2        bx        lr
```

That one is `r0 = r1 + r2`. When you see the two-operand form, remember that
something was overwritten; when you see the three-operand form, the compiler
needed the original kept.

## The return

`bx lr` is how a function returns: "**b**ranch and e**x**change to the address in
`lr`" — and `lr` holds wherever the caller wants to resume. Nearly every function
you decompile ends with one.

The "exchange" part refers to switching between ARM and Thumb code. GBA games mix
both, so returns go through `bx` rather than a plain jump, and you will see the
consequences of that later in some slightly odd-looking function endings.

## Branches point at addresses

A conditional branch prints its destination, and the workspace draws you an
arrow:

```asm
0        cmp       r0, #0
2        bge       6 ~>
4        add       r0, #15
6      ~>asr       r0, #4
8        bx        lr
```

`cmp r0, #0` compares `r0` against zero. `bge 6 ~>` then jumps to address `6`
when that comparison came out **greater or equal** — and the ` ~>` marks it as a
branch, with the matching `~>` in the gutter of line `6` showing where it lands.
When the branch is not taken, execution simply falls through to the next line.

So this function skips the `add` for non-negative values and always runs the
`asr`. Reading the arrows is how you recover `if`, `else`, and every loop.

## You do not have to memorise any of this

There are a lot of mnemonics and you will meet them a few at a time. You do not
need to hold them all in your head: **hover any instruction in the diff** and a
tooltip explains it, with that line's own registers and values filled in. Lean
on it as much as you like.

---

That is enough to read your first target. Let's go match a function.
