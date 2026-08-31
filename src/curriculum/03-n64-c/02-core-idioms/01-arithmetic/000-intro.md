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

That's the warmup behind you. You can read a line of MIPS, you know where a
function's arguments and return value live, and — as of the last chapter — you
can recover a signature from nothing but the target in front of you.

Now the real work starts. This tier, **Core idioms**, is a tour of every shape C
compiles into, and we begin where the machine is friendliest: **integer
arithmetic**. Over the next handful of lessons you'll learn to read:

- **add, subtract, multiply, and divide** between registers,
- the fingerprints IDO leaves behind — constant multiplies that dissolve into
  **shift-and-add chains**, real `div` instructions babysat by **hazard
  `nop`s**, and a **modulo** the hardware computes as a by-product,
- and how **operator precedence** decides the order the instructions come out
  in.

Same rules as the last chapter: the editor starts empty, the name is in the
header, and the signature is yours to work out. Let's go add two numbers.
