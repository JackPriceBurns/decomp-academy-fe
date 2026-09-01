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

# The cartridge never held the source

Dump a Game Boy Advance cartridge and you get a few megabytes of ARM machine
code. That is **not** what the developers wrote. They wrote C, and before the
game shipped a compiler translated it into the instructions the ARM7TDMI
actually executes. Only that translated version went into the plastic. The C
stayed on a workstation in Tokyo or Osaka, and for most GBA games it is gone.

Machine code runs perfectly well and reads terribly. Registers, offsets, raw
branches — none of the names and structure that made the original make sense.
Turn it back into C and suddenly anyone can read the game, patch it, port it,
translate it, or fix a bug that has been sitting there since 2002.

That is **decompilation**: working the shipped program back toward the source it
came from.

# What "matching" adds

Matching decompilation adds one much harder rule.

C that *behaves* identically can *compile* differently. Two functions that
produce the same answers may come out as different instructions. For ordinary
decompilation that is fine — write C that does what the assembly does and you
have won.

Matching decompilation keeps going. You compile your C a second time, with the
same compiler the developers used, and ask a stricter question: did it produce
*exactly* the same instructions? If it did not — even when the behaviour is
identical — you are not finished.

Holding yourself to that is worth the trouble for two reasons:

- **You get a number.** Diff your compiled output against the original
  instruction by instruction and out falls a percentage. Without a metric like
  that, "how much is left?" is guesswork and collaborating is awkward. With it,
  everyone can see exactly what is done.
- **You get certainty.** If your C compiles to the original bit for bit, you
  have *proven* it behaves like the original. No subtle difference can hide.

# The compiler in your browser

The GBA's compiler was **agbcc** — a customised gcc 2.9 from 1998 that Nintendo's
GBA toolchain shipped with, and the compiler every serious GBA decompilation
project still builds with today. When you press **Compile & Check** on this
site, agbcc itself runs, compiled to WebAssembly, right in this tab. There is no
emulation and no approximation: the object file it hands back is byte-identical
to what the real toolchain produces from the same input.

It compiles to **Thumb**, ARM's compact 16-bit instruction set. GBA games leaned
on Thumb heavily because the cartridge bus is 16 bits wide, so 16-bit
instructions fetch twice as fast from ROM as 32-bit ARM ones. Almost everything
in this course is Thumb, and Thumb is a cramped, opinionated little instruction
set with habits you will come to recognise instantly.

# The real goal

Under all of it sits one aim: to recover the C somebody actually wrote, years
ago, when the game was made.

The goal of this course is narrow: get you good enough at matching decompilation
that you can contribute to a real GBA project. Next, let's look at what Thumb
assembly is and how to read it.
