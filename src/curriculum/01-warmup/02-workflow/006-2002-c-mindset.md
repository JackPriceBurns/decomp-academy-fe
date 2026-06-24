---
id: workflow-2002-c-mindset
title: The 2002 C Mindset
difficulty: 2
concepts:
  - philosophy
  - mindset
  - types
concept: true
---

# The 2002 C mindset

Matching is a means, not the end. The end is recovering the **plausible original
C** — the source a real developer plausibly wrote in 2002 against this codebase,
with this compiler. Keeping that goal in view changes how you write code, and it
turns out to make matching *easier*, not harder.

## A clean-C 90% beats an inline-asm 100%

You could force almost any function to 100% by pasting assembly into an
`asm { }` block, but that sidesteps the whole point: a hand-pasted block of asm
tells you nothing about the original source, which is the thing you're trying to
recover. So it's worth resisting, even when it's tempting.

A clean, typed, readable 90% that looks like real source is generally more
valuable than an unreadable 100% that obscures the original intent. The original
developers wrote C, not assembly, and the aim is for your reconstruction to read
like theirs.

> **Aside — the rare honest exception.** A handful of instructions exist that no C
> expression maps to. For MWCC GC/2.0 the clearest example is the paired-single
> load/store ops (`psq_l` / `psq_st`) — special floating-point instructions the
> compiler has no intrinsic for. When there is genuinely no C that can emit an
> instruction, a small asm fallback is a pragmatic choice. That's the exception,
> not the rule; everywhere else, recovering real C is what makes the result
> meaningful.

## Prefer types over raw casts

One of the most useful habits is to treat a raw dereference or cast as a clue
rather than a finished answer. A line like `*(int*)(p + 0x10)` is essentially a
magic number with a pointer attached: the `0x10` carries no meaning on its own,
and it's hard to read. A developer working on this codebase in 2002 almost
certainly wasn't reaching into memory by hand-counted byte offsets — they had a
**struct, union, or typed array**, and `0x10` was a named field:

```c
// an offset match, written by hand:
return *(u32*)((char*)obj + 0x10);

// what the original source most likely looked like:
return obj->flags;
```

So when raw casts appear, it's worth pausing to ask what type would make it read
naturally — because raw offsets are a sign the struct types haven't been
recovered yet, not a sign you're done.

Recovering the type isn't only about readability — it frequently *fixes the
codegen* too. The right struct gives the compiler the right field widths and the
right addressing mode, which fixes offsets and register coloring you might
otherwise be fighting by hand. Typed access often closes a near-match that raw
pointer math couldn't.

## Type to the data, not to convenience

The compiler's output is sensitive to types in ways that map directly onto the
near-match symptoms from the last lesson:

- A byte field loaded and stored without arithmetic wants `u8`, not `char` — the
  `char` drags in a spurious `extsb`.
- A value compared as unsigned wants `u16`/`u32`, so the compare becomes
  `cmplwi`/`cmplw` instead of `cmpwi`/`cmpw`.
- A single-bit clear is `x &= ~0x80` (one `rlwinm`), not `x &= 0xff7f` (an
  `andi.`).
- A single-precision helper is `f32 fn(f32)`, not `double fn(double)`, to avoid a
  stray `fmul`/`frsp`.

None of these are tricks. They're you choosing the type the original author chose
— and the matching codegen comes along for free. Write the C a 2002 developer
would have written, with honest types, and the bytes tend to fall into place.
