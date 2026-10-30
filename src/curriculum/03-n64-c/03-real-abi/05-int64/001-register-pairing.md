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

# 64 bits in 32-bit registers

This machine's registers hold 32 bits. C's `s64` and `u64` hold 64 bits. The
compiler deals with this directly: **every 64-bit value is kept in a pair of
registers**. One register holds the upper 32 bits and the other holds the
lower 32 bits. Every 64-bit operation then becomes a sequence of instructions
that work on both registers of each pair.

The pairs follow the ABI you already know:

- An `s64` **first argument** arrives in `a0`:`a1`. `a0` holds the *high*
  word and `a1` holds the low word. A second `s64` uses `a2`:`a3`. With two
  64-bit arguments, all of the argument registers are in use.
- A 64-bit **return value** goes out in `v0`:`v1`, with the high word in `v0`
  and the low word in `v1`.
- High word first matches this console's byte order. In memory, the upper half
  of an `s64` is at the lower address, so register pairs are read in the same
  order.

Here is the smallest possible 64-bit function. `pass(x)` returns its `s64`
argument unchanged:

```asm
sw     a0, 0(sp)     # high word → its home slot
sw     a1, 4(sp)     # low word → the next one
lw     v0, 0(sp)     # reload: high half returns in v0…
lw     v1, 4(sp)     # …low half in v1
jr     ra
nop
```

The function does no work, but it still accesses memory four times. This is
the argument homing pattern from the ABI chapter, doubled. At this game's
debug level, **64-bit arguments are homed to their stack slots on entry and
reloaded when used**, two words for each argument. A function that takes two
`s64`s starts with four stores (`a0` to `a3`, at offsets 0 through 12) and
loads words back when it needs them. All of this extra work is added by the
compiler. Your C only says `return x;`.

What to carry into the exercises:

- **Label the halves.** Before you read any 64-bit listing, label each
  register and home slot by the half it holds: *a-high, a-low, b-high, b-low*.
  Then you can see which half each instruction works on.
- **Some operations treat the halves separately.** AND, OR and XOR work on
  each half independently, so a 64-bit `&` is two `and`s. Other operations,
  such as addition, subtraction, shifts and compares, need information to pass
  from one half to the other. The next lessons cover those operations.
- **When the hardware cannot do the operation directly** (64-bit multiply and
  divide), the compiler calls small library routines instead. You will see
  these "millicode" calls, and their `jal`s, later in the chapter.

To sum up: one value uses two registers, with the high word first. If you
label the halves, you will be able to follow every listing in this chapter.
