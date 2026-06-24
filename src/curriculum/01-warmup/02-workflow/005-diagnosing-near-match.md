---
id: workflow-diagnosing-near-match
title: Diagnosing a Near-Match
difficulty: 2
concepts:
  - near-match
  - diagnosis
  - diff
concept: true
---

# Diagnosing a near-match

You're at 95%. The function is *almost* right, and the diff shows one or two
stubborn instructions. This is the most valuable moment in decompiling, because a
near-match is a **diagnostic**: the shape of the gap names the bug. Here's how to
read the common ones.

## Symptom → likely cause

| What you see in the diff                                      | Likely cause                                                               |
|---------------------------------------------------------------|----------------------------------------------------------------------------|
| A stray **`extsb`** (or `extsh`) you don't want               | Used `char`/`short` where the value is unsigned — try `u8`/`u16`           |
| **`cmpw`** where target has **`cmplw`** (or `cmpwi`/`cmplwi`) | Wrong signedness on the compared value — flip signed/unsigned              |
| **Swapped registers** (right ops, wrong homes)                | Local **declaration order** differs — reorder your decls                   |
| One **extra or missing** instruction                          | Wrong idiom — e.g. `& 0xff7f` vs `& ~0x80`, or a manual mask vs a bitfield |
| Same instructions, **reordered**                              | Instruction **scheduling** — a decl/expression order or pragma issue       |
| Wrong **offset** in a load/store (`8(r3)` vs `c(r3)`)         | Wrong struct layout — a field is the wrong size or missing                 |

That last "reordered" row is the subtle one: the instructions are all correct but
appear in a different sequence. MWCC schedules code based on the order it sees
your declarations and expressions, so e.g. swapping two local declarations can
change which register each value lands in and shift the whole schedule. Reordering
your decls/statements to match the source's likely order is the usual fix.

## Signedness shows up as a *single opcode*

This is the cleanest near-match there is. Compare two unsigned values that feed a
branch and you get `cmplw`; compare them as signed `int` and you get `cmpw`:

```asm
# target (unsigned)        # your build (int)
cmplw   r3,r4              cmpw    r3,r4
```

Identical everywhere else — one letter in one mnemonic. The fix is one letter in
your C too: type the operand `unsigned`/`u32` instead of `int`. The diff is
*telling you the type*.

## A stray `extsb` is a type leak

If your build inserts `extsb r3,r3` (sign-extend byte) that the target doesn't
have, you declared a byte-sized value as signed `char` when the original was
`u8`. The compiler is dutifully sign-extending a value the original code treated
as unsigned. Change the type, the `extsb` evaporates.

## The method

1. Find the **first** diverging instruction (everything below it may be fallout).
2. Name the *category* from the table — is this a type, an order, or an idiom?
3. Form **one** hypothesis and make **one** change.
4. Re-diff. Did the first divergence move *down*? Then you fixed something real.

A near-match is not "stuck." It's a function handing you a labeled clue.
