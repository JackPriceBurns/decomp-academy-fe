---
id: 2554d47d-d748-56c1-9879-3c84570597f6
slug: foundations-reading-assembly
title: How to Read PowerPC Assembly
difficulty: 1
concepts:
  - assembly
  - registers
  - instructions
  - mental-model
concept: true
---

# Reading a line of assembly

Assembly is the code the machine actually runs, cleaned up just enough to be
legible. On this site it looks like this:

```asm
0:   li     r3, 20
4:   blr
```

Two lines, two instructions. Assembly is **one instruction per line**, executed
top to bottom.

## The numbers down the left are addresses

The numbers on the left don't count 1, 2, 3 — they jump by 4, and they're in
hex. They aren't line numbers. Each is the **address** of its instruction:
where that instruction sits in memory. That will matter later; for now, ignore
the values and just know what they are.

## Mnemonic and operands

Every instruction is a **mnemonic** followed by zero or more **operands**. The
mnemonic says *what the instruction does* — load, add, subtract, return. The
operands are what it does it to.

Take `li r3, 20`. The mnemonic is `li`, the operands are `r3` and `20`. `li` is
short for **load immediate**, where "immediate" just means a constant written
directly into the instruction. PowerPC puts the **destination** first, so the
line reads as "put the literal `20` into `r3`."

`r3` is a **register** — one of the small, fast slots inside the processor that
hold the values it's working with right now. There are 32 of them, `r0` through
`r31`. So this one instruction drops the number `20` into register `r3`.

## The second line

`blr` has no operands at all. It's the **return**: it ends the function and
hands control back to whatever called it. Nearly every function you decompile
ends with one.

## You don't have to memorize them

There are a lot of mnemonics, and you'll meet them a few at a time. You don't
need to hold them all in your head — **hover any instruction in the diff** and
a tooltip explains it, with that line's own registers and values filled in. Use
it as much as you want. The common ones will stick on their own soon enough.

---

This is a simplification, of course. There's more to assembly than two
instructions, and you'll pick the rest up as lessons need it. But it's enough
to read your first target — time to match your first C function.
