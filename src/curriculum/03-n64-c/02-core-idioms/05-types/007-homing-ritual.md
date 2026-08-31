---
id: 5f4b4e6f-590b-456f-a569-5fd8c6cfc649
slug: types-homing-ritual
title: "The Homing Ritual"
difficulty: 3
concepts:
  - types
  - arg-homing
  - fingerprints
  - sign-extension
symbol: func_803d2d38
hints:
  - "Two homing stores, two re-extensions — but the two args re-extend *differently*. One gets the shift pair, one gets a mask. Read each pair's width and signedness from its idiom."
  - "The function body proper is a single `addu`. Everything above it is the ritual, and all of it comes from the two parameter declarations."
---

# The stores that go nowhere

Give a function a narrow parameter and IDO opens it with a ceremony that
baffles everyone the first time. Here's `add_bytes` — the *entire* C is
`return a + b` on two `s8`s:

```c
s32 add_bytes(s8 a, s8 b) {
    return a + b;
}
```

```asm
sw    a0, 0(sp)     # a stored to the stack…
sll   t6, a0, 24    # …and sign-extended in place
sw    a1, 4(sp)     # b stored to the stack…
sll   t8, a1, 24    # …and sign-extended too
sra   a1, t8, 24
sra   a0, t6, 24
addu  v0, a0, a1    # the actual function
jr    ra
nop
```

Eight instructions for a one-line function, and here's the strange part:
**nothing ever reads `0(sp)` or `4(sp)`**. The `sra` results come from
registers. The two `sw`s are dead stores — written, never loaded, entirely
removable — and IDO emits them at `-O2`, every time, for every narrow
argument. This is **argument homing**: the four argument registers each
own a reserved stack slot (`a0`→`0(sp)`, `a1`→`4(sp)`, and so on — the
next tier tours that arrangement properly), and narrow arguments get
parked in theirs, ritually, whether or not anyone comes to visit.

The second half of the ceremony is one you can now read: the caller wasn't
required to deliver a clean 8-bit value in a 32-bit register, so the
function **re-extends each narrow argument** before using it — the signed
shift-pair or the unsigned mask, exactly the truncation idioms of the last
two lessons, keyed to each parameter's declared type.

Why you care, practically:

- `sw`s into small positive `sp` offsets at the top of a leaf function =
  **narrow parameters**. It's among the strongest type oracles there is —
  the count of homing stores even tells you *how many* args are narrow.
- Match the re-extension to the type: shift-pair ⇒ signed (`s8`/`s16` by
  amount), `andi` ⇒ unsigned (`u8`/`u16` by mask).
- You cannot suppress the ritual and you don't want to — declare the
  types the assembly asks for, and all eight lines fall out of one `+`.

The target adds its arguments too, but they're narrow in *different
ways* — let each argument's re-extension tell you its declaration.

## Your task

Write `func_803d2d38` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_803d2d38(s16 base, u8 bonus) {
    return base + bonus;
}
```
