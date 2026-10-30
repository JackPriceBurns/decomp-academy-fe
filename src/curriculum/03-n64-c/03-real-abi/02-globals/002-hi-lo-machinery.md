---
id: f2f32939-1b7f-4543-8e59-7c0c925f6c4f
slug: globals-hi-lo-machinery
title: How %hi and %lo Work
difficulty: 2
concepts:
  - hi-lo
  - relocations
  - linker
  - mental-model
concept: true
---

# The carry inside every address pair

You have seen the pattern: `lui` with `%hi(name)`, then a memory operation with
`%lo(name)`. This lesson covers the details. It is worth ten minutes now,
because these pairs appear on nearly every screen of assembly you will read from
here on.

## Splitting an address needs a correction

You might expect a 32-bit address to split cleanly: the top 16 bits go in the
`lui`, and the bottom 16 go in the load's offset. That is almost right. The
problem is that a load's offset field is **signed**. If the low half of an
address is `0x8000` or above, the hardware treats it as *negative*, and
`upper + lower` would land 65536 bytes too low.

The definition of `%hi` corrects for this: **when the low half is `0x8000` or
more, `%hi` is the upper half *plus one*.** The extra one in `%hi` and the
negative `%lo` then cancel exactly. So `%hi` and `%lo` do not always equal the
top and bottom halves of the address. They are two numbers *chosen to add up to
the address* through a signed 16-bit offset. You never compute them, because
the linker does that. But now the names won't mislead you.

## Relocations are placeholders

Until the game is linked, `gTimer` has no address. It only has a name. A
compiled object file leaves the `lui`'s immediate and the load's offset as
**zeros**. It also adds a note telling the linker "patch these two slots with
`%hi`/`%lo` of whatever address `gTimer` gets." That note is the relocation.
The diff view shows it *inline*, writing `%hi(gTimer)` where the raw zero is.

This helps you when matching:

- **You can't get the address wrong, because there isn't one yet.** Your compile
  and the target both contain placeholders. The diff compares *which symbol* and
  *which kind* of placeholder. Name the same global and the line matches.
- **The symbol name is useful information.** When a target line says
  `%lo(gRocketFuel)`, you have learned a variable's name. It comes straight from
  the original developers' source, so it is free documentation.

## Reading the pairs quickly

Here are a few patterns to recognize. You will practice each one in the coming
lessons:

- `lui` + a load ⇒ *read* a global. The load's mnemonic tells you the type.
- `lui` + a store ⇒ *write* a global.
- `lui` + `addiu` with `%lo` ⇒ no memory access at all. This builds the
  **address itself** as a value.
- The `lui` is often several lines away from its `%lo` partner, and one `lui`
  can serve two accesses. Pair them up by the symbol name, even when the lines
  are far apart.

That is all the machinery. From now on, read each `%hi`/`%lo` pair as one unit:
*"global access, this name."* The next lessons use it in each of these ways.
