---
id: int64-register-pairing
title: Two Registers Make a long long
difficulty: 1
concepts:
  - 64-bit
  - registers
  - calling-convention
concept: true
---

# A 64-bit value lives in a register pair

The general-purpose registers on the GameCube and Wii are **32 bits** wide. A
`long long` (`s64`/`u64`) needs **64 bits**, so it can't fit in one register —
MWCC represents every 64-bit integer as a **pair** of adjacent GPRs.

Because PowerPC is big-endian, the **high** word goes in the **lower-numbered**
register and the **low** word in the next one up. So a `u64` argument passed in
`r3:r4` means:

- `r3` — the high 32 bits
- `r4` — the low 32 bits

The same pairing is used to **return** a 64-bit value: `r3:r4` carry the result
back, no stack required.

## Why this is the key to reading the chapter

Once you know a value occupies two registers, the rest of the chapter falls into
place. Addition has to start at the **low** word and carry up into the **high**
word — which is why you'll see instruction *pairs* like `addc` then `adde`. A
64-bit multiply expands into several `mullw`/`mulhwu` instructions. Division and
shifts can't be done inline at all and call into compiler helper routines.

So the first question to ask when a function juggles two registers in lockstep —
operating on `r4` then immediately on `r3` with a carry between them — is "*is
this one 64-bit value, not two separate 32-bit ones?*" The instructions in the
next few lessons are how you tell.

The next lesson starts where every 64-bit operation does: the low word.
