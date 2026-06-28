---
id: foundations-reading-assembly
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

Assembly is the code the machine runs, tidied up just enough that it isn't
completely unreadable to a human. On this site it'll look like this:

```asm
0:   li     r3, 20
4:   blr
```

Two lines, two instructions — assembly is **one instruction per line**, and it
runs top to bottom.

## The numbers down the left are addresses

The first thing to notice: the numbers on the left don't count up 1, 2, 3. They
jump by 4, and they're written in hex. That's because they aren't line numbers at
all — each one is the **address** of its instruction, where that instruction sits
in memory. It'll matter in later lessons; for now you can ignore the exact values
and just know that's what they are.

## Mnemonic and operands

Every instruction is a **mnemonic** followed by zero or more **operands**.

- The **mnemonic** is *what the instruction does* — load a value, add, subtract,
  multiply, return, and so on.
- The **operands** are the *arguments* it acts on.

Take the first line, `li r3, 20`. The mnemonic is `li` and the operands are `r3`
and `20`. `li` is short for **load immediate** — "immediate" just means a constant
written straight into the instruction. By PowerPC convention the **destination**
comes first and the value second, so this line reads as "load the literal `20`
into `r3`."

That `r3` is a **register**. Registers are the small, fast slots inside the
processor where it keeps the values it's actively working with — there are 32 of
them, named `r0` through `r31`. So this single instruction drops the number `20`
into register `r3`.

## And the second line

`blr` has no operands at all. It's the **return**: it ends the function and hands
control back to whatever called it. You'll find a `blr` at the bottom of nearly
every function you decompile.

## You don't have to memorize them

There are a lot of mnemonics, and you'll meet them a few at a time — but you don't
need to keep them all in your head. **Hover any instruction in the diff** and a
tooltip explains what it does, with that line's own registers and values filled in.
Lean on it as much as you like; the common ones will stick on their own soon
enough.

---

This is a simplification — there's far more to assembly than two instructions, and
you'll pick the rest up a few at a time, exactly when a lesson needs them. But it's
enough to read your first target. Let's go match your very first C function.
