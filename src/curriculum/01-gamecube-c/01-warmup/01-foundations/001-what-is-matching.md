---
id: 36a1da42-e105-596f-a6e3-0b28fa37f40b
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

# What you download was never the source

When a studio ships a game, the thing on the disc is not the code anyone wrote.
A CPU can't run C, so before release the source gets **compiled** — translated
into assembly, the raw stream of instructions the hardware actually executes.
That compiled version is all that ships. The source stays on the developers'
machines, and most of the time it never gets released at all.

Assembly runs fine, but reading it is grim. No names, no structure, just
registers and instructions. If you could work it back into something like the
original C, anyone who wanted to understand or modify the game would have a way
in. That's **decompilation**: taking a compiled program and recovering the
source it was built from.

# What "matching" adds

There's a catch. Two C functions can behave identically and still compile to
different instructions. For most decompilation work that's fine — if your C
does what the assembly does, you've won.

Matching decompilation refuses to stop there. You compile your C with the same
compiler the game was built with, and ask a harsher question: is the output
*exactly* the same assembly, instruction for instruction? If it isn't, the job
isn't finished — even when the behaviour already matches.

Why hold yourself to that? Two reasons:

- **You get a measurement.** Diff your compiled output against the original and
  you get an exact percentage. At any moment, anyone can see what's done and
  what isn't. Without that, "how far along is the project?" is a guess right up
  until the day it's finished.
- **You get proof.** Source that compiles to the target bit for bit *provably*
  behaves like the original. There's nowhere left for a subtle difference to
  hide.

It's a harder discipline, but that number and that certainty are the payoff.
It's also the loop you'll run on this site: every exercise shows you a piece of
target assembly, you write the C you think produced it, and **Compile & Check**
feeds your answer to the actual Metrowerks compiler GameCube games were built
with, then diffs the output line by line. Match all of it and you score
**100%**.

# Why decompile at all?

People show up for different reasons. Some just want the challenge — chasing
the 100% is its own reward. Some grew up with a game and want to give something
back to its community. Some treat 100% as the starting line: once the source is
recovered they can mod it, fix it, or port it to hardware it was never meant to
run on. Speedrunners read the source to understand a glitch down to the
instruction, then turn that knowledge into a faster run.

Plenty of other reasons too, but those cover most of it.

# The real goal

Underneath all of that sits one aim: recover the C the original developers
actually wrote. For *Star Fox Adventures*, that's the code someone at Rare sat
down and wrote in 2002.

Whatever brought you here — nostalgia, mods, bug hunting, the grind itself —
these lessons are meant to take you from never having read assembly to
contributing to a real project. First, though, you need to know what assembly
even looks like. That's next.
