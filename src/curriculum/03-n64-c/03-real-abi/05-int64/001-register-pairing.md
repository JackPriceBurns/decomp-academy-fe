---
id: 495d37b5-e0f1-4c7c-8ae8-d981c8f0e8bb
slug: int64-register-pairing
title: "s64: One Value, Two Registers"
difficulty: 2
concepts:
  - int64
  - abi
  - register-pairing
  - mental-model
concept: true
---

# Sixty-four bits on a thirty-two-bit road

This machine's registers hold 32 bits. C's `s64` and `u64` hold 64. The
compiler's answer is blunt: **every 64-bit value travels as a pair of
registers** — one carrying the upper 32 bits, one the lower — and every
64-bit operation becomes choreography for two-register couples.

The pairings follow the ABI you already know:

- An `s64` **first argument** arrives in `a0`:`a1` — `a0` holds the *high*
  word, `a1` the low. A second `s64` takes `a2`:`a3`. Two 64-bit arguments
  and the argument registers are simply *full*.
- A 64-bit **return value** leaves in `v0`:`v1` — high in `v0`, low in `v1`.
- High word first is this console's byte order: in memory, an `s64`'s upper
  half sits at the lower address, so register pairs read the same way.

Here's the simplest possible 64-bit function — `pass(x)`, which returns its
`s64` argument unchanged:

```asm
sw     a0, 0(sp)     # high word → its home slot
sw     a1, 4(sp)     # low word → the next one
lw     v0, 0(sp)     # back out: high half returns in v0…
lw     v1, 4(sp)     # …low half in v1
jr     ra
nop
```

Nothing happens in this function — and it still touches memory four times.
That's the arg-homing fingerprint you met in the ABI chapter, now doubled:
at this game's debug level, **64-bit arguments are homed to their stack
slots on entry and reloaded when used**, two words apiece. A function taking
two `s64`s opens with four stores (`a0`–`a3`, offsets 0 through 12) and
loads words back as it needs them. It looks like drudgery because it is —
but it's *the compiler's* drudgery. Your C says `return x;`.

What to carry into the exercises:

- **Track halves, not registers.** Before reading any 64-bit listing, label
  each register and home slot: *a-high, a-low, b-high, b-low*. Every
  instruction then declares which half it's working on.
- **Some operations never notice the split.** AND, OR, XOR act on each half
  independently — a 64-bit `&` is just two `and`s. Others — addition,
  subtraction, shifts, compares — need the halves to *talk to each other*,
  and the next lessons are about exactly those conversations.
- **When the hardware can't cope at all** (64-bit multiply and divide), the
  compiler calls tiny library routines instead. You'll meet those "millicode"
  calls, and their `jal`s, later in the chapter.

One value, two registers, high word first. Label the halves and nothing in
this chapter will surprise you.
