---
id: foundations-what-is-matching
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

When a studio ships a game — or anyone ships a piece of software — the thing you
download is **not** the code the developers wrote. Computers can't run that code
directly. Before anything ships it has to be **compiled**: translated from the
human-friendly **source code** the developers typed into the low-level
**assembly** that the CPU actually understands and runs.

Only that compiled version goes out the door. The source stays behind with the
developers. And while assembly executes perfectly well, it's miserable to read —
all registers and raw instructions, none of the names and structure that made the
original make sense. If you could turn it back into source code, you'd hand
everyone who ever wanted to understand or modify that game a way in.

That's what **decompilation** is: taking the shipped, compiled program and working
it back toward the source code it came from.

# What "matching" adds

Here's the catch that defines this whole craft. Source code that is *functionally
identical* can compile to *different* assembly — two C functions that behave
exactly the same may come out as different instructions.

For ordinary decompilation, that doesn't matter. If you've written C that does
what the assembly does, you've won; that's usually the end of the battle.
**Matching decompilation** takes it one step further. You compile your C back into
assembly a *second* time and ask a stricter question: does it produce *exactly*
the same assembly as the original? If it doesn't — even when the behaviour is
identical — the job isn't done.

Why hold yourself to that harder bar? Two reasons make it worth it:

- **You get a number.** Compile your C and diff the result against the target
  instruction by instruction, and out falls an exact percentage of how close you
  are. Without a metric like that, "how much is left?" is hand-wavey, and
  collaborating with other people is awkward — nobody can really tell how far
  along a project is until it's suddenly done. With it, everyone can see exactly
  what's finished and what isn't.
- **You get certainty.** If your source compiles to the target assembly 100%, bit
  for bit, you have *categorically proven* it behaves like the original. There's
  no room left for a subtle difference to hide.

Matching is a fair bit harder than plain decompilation, but that measurable,
provable result is the payoff. And it's exactly the loop you'll run here: every
exercise shows you the target assembly, you write the C you think produced it, and
**Compile & Check** feeds it to the genuine Metrowerks compiler the GameCube games
were built with, then diffs the output line by line. Match all of it and you score
**100%**.

# Why decompile at all?

People come to this from all kinds of directions:

- Some are here purely for the challenge — chasing that 100% match is the whole
  reward.
- Some have a beloved childhood game and want to give something back to its
  community.
- Some treat 100% as a *starting* line rather than a finish: once the source is
  recovered, they'll mod it, improve it, or port it somewhere it was never meant
  to run.
- Speedrunners dig into the source to understand a glitch down to the instruction,
  then exploit it for a faster any%.

…and plenty of reasons besides.

# The real goal

Under all of it sits one aim: to recover the C the original developers actually
wrote, years ago, when the game was made. For *Star Fox Adventures*, that's the
code a Rare developer sat down and wrote back in 2002.

Whether you're here for the nostalgia, the grind, the mods you'll build on top, or
the bugs you'll hunt — we hope this site can get you up to speed and contributing to
a project. Next, let's look at what that assembly actually is, and how to read it.
