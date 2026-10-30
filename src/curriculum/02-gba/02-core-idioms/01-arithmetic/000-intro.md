---
id: e4db530a-e6f4-4536-8115-23de03f62a2d
slug: gba-arithmetic-intro
title: On to Arithmetic
difficulty: 1
concepts:
  - arithmetic
  - mental-model
  - strength-reduction
concept: true
---

# What this tier covers

The warm-up taught you to read a listing and to recover a signature from it.
Both skills are about the outside of a function. This tier is about the inside.
It covers each shape that C compiles into on this machine, one idiom at a time.
The goal is that you can look at a listing you have never seen and quickly turn
it back into C expressions.

Arithmetic comes first for two reasons. It is where the unusual features of the
ARM7TDMI show up earliest, and everything later (loops, structs, fixed point)
is built from it.

# What Thumb gives up to fit in sixteen bits

Each Thumb instruction is only sixteen bits long, so the instruction set had to
leave some things out. Three of those limits affect everything in this chapter.

**Most ALU instructions are two-operand.** The result overwrites the first
operand. `add r0, r1` means `r0 = r0 + r1`, and the old value of `r0` is lost.
If the compiler still needs that value, it must copy it somewhere first. So a
lot of what you read will be a `mov` that only exists to keep a copy of a value.

**Only `r0` to `r7` are freely usable.** That is eight registers, and four of
them hold the arguments when the function starts. Expressions run out of
registers quickly.

**Immediates are eight bits.** Any constant above 255 has to be built with extra
instructions or loaded from memory. So a single `+ 1000` in the source becomes
three lines of assembly.

None of this changes the result of the arithmetic. It changes how the assembly
looks, and to match a function you have to reproduce how it looks.

# When gcc uses the multiplier

The ARM7TDMI does have a hardware multiply instruction, and agbcc sometimes uses
it:

```asm
0        mov       r1, #100
2        mul       r0, r1
4        bx        lr
```

That is a multiply by 100. `mul` has no immediate form, so the constant must be
moved into a register first. Then the two-operand `mul` overwrites `r0` with the
product.

Here is the same function with the constant changed to 96:

```asm
0        mov       r1, r0
2        lsl       r0, r1, #1
4        add       r0, r1
6        lsl       r0, #5
8        bx        lr
```

There is no `mul` at all. Instead, gcc split the constant into simpler steps. It
triples the input, then shifts left by five, because 3 × 32 = 96. gcc makes this
choice for every multiply by a constant. It builds the shortest chain of shifts,
adds and subtracts that produces the constant. Then it compares the cost of that
chain with `mul`, which takes two to five cycles on this core. 96 is a triple
followed by a shift, so the chain is cheaper and the multiply goes away. 100 has
no short chain like that, so gcc keeps the `mul`.

Several lessons in this chapter teach you to read those chains backwards. They
are the main reason a GBA listing can look very different from the line of C it
came from.

# There is no divide instruction

Now look at division:

```asm
0        push      {lr}
2        mov       r1, #100
4        bl        __divsi3-4
8        pop       {r1}
10       bx        r1
```

That is division by 100. The ARM7TDMI has no divide instruction, so a division
becomes a **function call** to a library routine. The function needs a stack
frame around the call to save the return address. So one line of C costs a whole
call here. That is why real GBA games avoid division in code that runs every
frame. It is also why the next chapter is entirely about the forms division
takes.

# Habits to build now

Three questions will help you read most listings in this chapter:

1. **Which register is written first?** That is the innermost part of the
   expression. It tells you where the parentheses go.
2. **Which operand survives?** A two-operand form overwrites its destination. A
   three-operand form does not. The difference tells you the order in which the
   source was written.
3. **Where are the copies?** A `mov` between registers always has a reason. It
   marks either a value the compiler needed twice, or a value that had to be
   moved into a particular register.

The first lesson starts with the simplest possible addition.
