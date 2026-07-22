---
id: c86a47d0-f8a8-4860-b5f8-7a5df49b9006
slug: arithmetic-intro
title: On to Arithmetic
difficulty: 1
concepts:
  - arithmetic
  - mental-model
concept: true
---

# The groundwork is done

That's the introduction behind you. You can read a line of PowerPC, you know where
a function's arguments and return value live, and — as of the last chapter — you
can recover a signature from nothing but the target in front of you.

Now the real work starts. This tier, **Core idioms**, is a tour of every shape C
compiles into, and we begin where the machine is friendliest: **integer
arithmetic**. Over the next handful of lessons you'll learn to read:

- **add, subtract, multiply, and divide** between registers,
- the tricks the compiler plays — a multiply or divide by a constant that becomes
  a **shift**, a division with **no divide instruction** at all, and a **modulo**
  that lives nowhere in the hardware,
- and how **operator precedence** decides the order the instructions come out in.

Same rules as the last chapter: the editor starts empty, the name is in the
header, and the signature is yours to work out. Let's go add two numbers.
