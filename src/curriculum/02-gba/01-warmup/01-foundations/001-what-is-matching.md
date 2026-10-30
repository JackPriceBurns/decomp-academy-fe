---
id: 337b23e5-4784-47a1-b719-c896e4bf06bf
slug: gba-foundations-what-is-matching
title: What Matching Decompilation Is
difficulty: 1
concepts:
  - matching
  - toolchain
  - workflow
  - mental-model
concept: true
---

# What the cartridge holds

If you dump a Game Boy Advance cartridge, you get a few megabytes of ARM machine
code. The developers did not write that. They wrote C, and before the game
shipped, a compiler translated the C into the instructions that the ARM7TDMI
executes. Only those instructions were stored on the cartridge. The C stayed on
a workstation in Tokyo or Osaka, and for most GBA games it is now lost.

Machine code runs well, but it is hard to read. You see registers, offsets and
raw branches, without the names and structure that made the original code
readable. If you turn it back into C, anyone can read the game, patch it, port
it, translate it, or fix a bug that has been there since 2002.

That is **decompilation**: working from the shipped program back toward the
source code it came from.

# What "matching" adds

Matching decompilation adds one much harder rule.

C that *behaves* the same can *compile* differently. Two functions that give the
same answers may compile to different instructions. For ordinary decompilation
that is fine. If your C does what the assembly does, you are done.

Matching decompilation goes further. You compile your C again, with the same
compiler the developers used, and ask a stricter question: did it produce
*exactly* the same instructions? If it did not, you are not finished, even when
the behaviour is the same.

This extra work is worth it for two reasons:

- **You get a number.** Compare your compiled output with the original,
  instruction by instruction, and you get a percentage. Without a measure like
  that, nobody knows how much work is left, and it is hard for people to work
  together. With it, everyone can see exactly what is done.
- **You get certainty.** If your C compiles to the original bit for bit, you
  have *proven* that it behaves like the original. No small difference can be
  hidden.

# The compiler in your browser

The GBA's compiler was **agbcc**, a customised version of gcc 2.9 from 1998. It
came with Nintendo's GBA toolchain, and every serious GBA decompilation project
still builds with it today. When you press **Compile & Check** on this site, the
real agbcc runs in this browser tab, compiled to WebAssembly. Nothing is
emulated or approximated. The object file it returns is byte-identical to what
the real toolchain produces from the same input.

agbcc compiles to **Thumb**, ARM's compact 16-bit instruction set. GBA games
used Thumb heavily because the cartridge bus is 16 bits wide, so 16-bit
instructions load from ROM twice as fast as 32-bit ARM instructions. Almost
everything in this course is Thumb. Thumb is a small, restrictive instruction
set, and its patterns repeat often, so you will soon learn to recognise them.

# The real goal

The aim behind all of this is to recover the C that somebody wrote years ago,
when the game was made.

The goal of this course is narrow: to make you good enough at matching
decompilation to contribute to a real GBA project. The next lesson explains what
Thumb assembly is and how to read it.
