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

# The tier where the assembly stops being obvious

Warm-up taught you to read a listing and to recover a signature from it. Both
were about the frame around a function. This tier is about the inside: every
shape C compiles into on this machine, one idiom at a time, until a listing you
have never seen decomposes into C expressions on sight.

Arithmetic comes first because it is where the ARM7TDMI's personality shows up
soonest, and because everything later — loops, structs, fixed point — is built
out of it.

# Sixteen bits, and what had to go

Thumb spends its sixteen bits carefully, and three of the economies it made are
going to shape everything in this chapter.

**Most ALU instructions are two-operand and destructive.** `add r0, r1` means
`r0 = r0 + r1`, and `r0`'s old value is gone. When the compiler still needs that
value it must copy it somewhere first, so a lot of what you will read is a
`mov` that exists purely to keep a value alive.

**Only `r0`–`r7` are freely usable.** Eight registers, four of which arrive
holding arguments. Expressions run out of room quickly.

**Immediates are eight bits.** Any constant past 255 has to be built out of
instructions or fetched from memory, which turns a single `+ 1000` in the source
into three lines of assembly.

None of that changes what the arithmetic means. It changes what it looks like,
and matching is a game about what it looks like.

# There is a multiplier, and gcc does not trust it

The ARM7TDMI does have a hardware multiply. agbcc uses it — sometimes:

```asm
0        mov       r1, #100
2        mul       r0, r1
4        bx        lr
```

That is a multiply by 100. There is no immediate form of `mul`, so the constant
has to be moved into a register first, and then the two-operand `mul` overwrites
`r0` with the product.

Now the same function with the constant changed to 96:

```asm
0        mov       r1, r0
2        lsl       r0, r1, #1
4        add       r0, r1
6        lsl       r0, #5
8        bx        lr
```

No `mul` at all. gcc took the constant apart instead: triple the input, then
shift left by five — 3 × 32 = 96. Every constant multiply goes through the same
weighing. gcc builds the shortest chain of shifts, adds and subtracts that
reaches the constant and prices it against `mul`, which costs two to five cycles
on this core. 96 factors into a triple and a shift and loses the multiply; 100
has no such shape and keeps it.

Several lessons in this chapter are about reading those chains backwards. They
are the main reason a GBA listing can look nothing like the line of C it came
from.

# There is no divider at all

The other half of the story:

```asm
0        push      {lr}
2        mov       r1, #100
4        bl        __divsi3-4
8        pop       {r1}
10       bx        r1
```

That is division by 100. The ARM7TDMI has no divide instruction, so a division
is a **function call** into a library routine, with a stack frame around it to
preserve the return address. An expression that costs one line of C costs a call
here — which is why real GBA games avoid division in anything that runs every
frame, and why the next chapter is entirely about the shapes it takes.

# The habits worth building now

Three questions answer most listings in this chapter:

1. **Which register is written first?** That is the innermost part of the
   expression, and it is how you recover parentheses.
2. **Which operand survives?** A two-operand form destroys its destination; a
   three-operand form does not. The difference tells you the order the source
   was written in.
3. **Where are the copies?** A `mov` between registers is never decoration. It
   marks a value the compiler needed twice, or a destination it was forced into.

Start with the plainest addition there is.
