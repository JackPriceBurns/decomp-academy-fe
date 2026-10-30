---
id: ca63aa14-3175-4402-a11e-21d1bab06b3b
slug: arithmetic-intro
title: On to Arithmetic
difficulty: 1
concepts:
  - arithmetic
  - mental-model
concept: true
---

# The groundwork is done

You have finished the warmup. You can read a line of MIPS, and you know where a
function's arguments and return value live. Since the last chapter, you can
also recover a signature from the target assembly alone.

Now the main work starts. This tier, **Core idioms**, goes through the shapes
that C compiles into. It starts where the machine is simplest to read:
**integer arithmetic**. Over the next lessons you will learn to read:

- **add, subtract, multiply, and divide** between registers,
- the patterns IDO always leaves behind (its fingerprints): constant
  multiplies that turn into **shift-and-add chains**, real `div` instructions
  that need **hazard `nop`s** after them, and a **modulo** that the hardware
  computes at the same time as the division,
- and how **operator precedence** decides the order of the instructions.

The rules are the same as in the last chapter. The editor starts empty, the
function name is in the header, and you work out the signature yourself. The
first lesson adds two numbers.
