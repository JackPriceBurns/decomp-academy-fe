---
id: 9abc4bab-bd01-4a6c-a327-03f2ee72c442
slug: foundations-what-is-matching
title: What Matching Decompilation Is
difficulty: 1
concepts:
  - matching
  - toolchain
  - workflow
  - mental-model
concept: true
---

# What you download is not the source

When a studio ships a game, or when anyone ships a piece of software, the thing
you download is **not** the code the developers wrote. Computers can't run that
code directly. Before anything ships, it has to be **compiled**: translated from
the readable **source code** the developers typed into the low-level
**assembly** that the CPU understands and runs.

Only the compiled version is shipped. The source stays with the developers.
Assembly runs well, but it is very hard to read. You see registers and raw
instructions, without the names and structure that made the original code make
sense. If you could turn it back into source code, anyone who wants to
understand or change the game would have a way in.

That is **decompilation**: taking the shipped, compiled program and working it
back toward the source it came from.

# What "matching" adds

Matching decompilation adds one harder rule. Source code that is *functionally
identical* can compile to *different* assembly. Two C functions that behave the
same may produce different instructions.

For ordinary decompilation, that doesn't matter. If you have written C that does
what the assembly does, you are usually done. **Matching decompilation** goes
further. You compile your C into assembly a *second* time and ask a stricter
question: does it produce *exactly* the same assembly as the original? If it
doesn't, the job isn't done, even when the behaviour is identical.

This harder standard is worth it for two reasons:

- **You get a number.** Compile your C and compare the result with the target,
  instruction by instruction, and you get an exact percentage of how close you
  are. Without a measure like that, nobody can say how much work is left, and
  working with other people is awkward. Nobody can tell how far along a project
  is until it is suddenly finished. With it, everyone can see exactly what is
  finished and what isn't.
- **You get certainty.** If your source compiles to the target assembly 100%, bit
  for bit, you have *proven* that it behaves like the original. No small
  difference can be hidden.

Matching is harder than plain decompilation, but you get a result you can
measure and prove. It is also how every exercise here works. Each exercise shows
you the target assembly, and you write the C you think produced it.
**Compile & Check** passes your C to the real **IDO 5.3** compiler (the SGI IRIX
compiler that Nintendo's N64 toolchain was built around), then compares the
output line by line. Match all of it and you score **100%**.

# The real goal

Behind all of this is one aim: to recover the C that the original developers
wrote years ago, when the game was made.

You might be here for nostalgia, for the work itself, for the mods you will
build, or for the bugs you will hunt. In every case, this site is built to get
you up to speed and contributing to a project. The next lesson explains what
MIPS assembly is and how to read it.
