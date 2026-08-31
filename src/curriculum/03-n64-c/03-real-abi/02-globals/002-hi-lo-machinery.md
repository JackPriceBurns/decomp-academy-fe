---
id: f2f32939-1b7f-4543-8e59-7c0c925f6c4f
slug: globals-hi-lo-machinery
title: How %hi and %lo Really Work
difficulty: 2
concepts:
  - hi-lo
  - relocations
  - linker
  - mental-model
concept: true
---

# The carry hiding inside every address pair

You've seen the pattern: `lui` with `%hi(name)`, then a memory op with
`%lo(name)`. This lesson is the fine print — worth ten minutes now, because
these pairs are on nearly every screen of assembly you'll read from here on.

## Splitting an address isn't just cutting it in half

A 32-bit address should split cleanly: top 16 bits in the `lui`, bottom 16 in
the load's offset. Almost. The catch is that a load's offset field is
**signed**. If the low half of an address is `0x8000` or above, the hardware
treats it as *negative*, and `upper + lower` would land 65536 bytes too low.

The fix is baked into the definition of `%hi`: **when the low half is `0x8000`
or more, `%hi` is the upper half *plus one*.** The oversized `%hi` and the
negative `%lo` then cancel exactly. So `%hi` and `%lo` aren't literally "top
half" and "bottom half" — they're two numbers *engineered to sum to the
address* through a signed 16-bit offset. You never compute them; it's the
linker's job. But now the names won't mislead you.

## Relocations are promises, not values

Until the game is linked, `gTimer` has no address — just a name. A compiled
object file leaves the `lui`'s immediate and the load's offset as **zeros**,
plus a note telling the linker "patch these two slots with `%hi`/`%lo` of
whatever address `gTimer` gets." That note is the relocation, and the diff view
renders it *inline*, writing `%hi(gTimer)` where the raw zero sits.

This is good news for matching:

- **You can't get the address wrong, because there isn't one.** Your compile
  and the target both carry placeholders; the diff compares *which symbol* and
  *which kind* of placeholder. Name the same global and the line matches.
- **The symbol name is data.** When a target line says `%lo(gRocketFuel)`,
  you've just learned a variable's name — free documentation, straight from
  the original developers' source.

## Reading the pairs at speed

A few shapes to file away (you'll practice each in coming lessons):

- `lui` + a load ⇒ *read* a global; the load's mnemonic tells the type.
- `lui` + a store ⇒ *write* a global.
- `lui` + `addiu` with `%lo` ⇒ no memory access at all — that's building the
  **address itself** as a value.
- The `lui` half often drifts several lines from its `%lo` partner, and one
  `lui` can serve two accesses. Match pairs by the symbol name, not by
  adjacency.

That's the machinery. From here, `%hi`/`%lo` pairs should read as a single
mental token: *"global access, this name."* The next lessons put it to work in
every direction.
