---
id: 36d4c789-195e-4224-88c5-262da99e5dd4
slug: control-clamp
title: Clamping a Value
difficulty: 4
concepts:
  - control-flow
  - branches
  - delay-slots
  - compare
symbol: func_801b531c
hints:
  - "The `slti` in the first branch's delay slot is the SECOND test, computed early. In C it is just an `else if`. Don't write anything special."
  - "Read the two boundary constants off the `slti` and the `addiu`; remember `slti 101` guards a `> 100` test."
---

# Two limits

Game code clamps values all the time: health to 0, speed to a maximum, a
coordinate to the screen. Start with one side. Here is an unsigned cap,
`if (x > lim) x = lim;
return x;`:

```asm
 0:  sltu at, a1, a0      # lim < x? (that's x > lim, operands swapped)
 4:  beqzl at, 0x14       # under the cap? return x as-is...
 8:  or   v0, a0, zero    # (likely slot) the untouched copy
 c:  or   a0, a1, zero    # over: x = lim
10:  or   v0, a0, zero
14:  jr   ra
18:  nop
```

You have seen every part of this before: the `sltu` with swapped operands (a
`>` on unsigned values), the `beqzl` if-conversion, and the duplicated copy to
`v0`. A one-sided clamp is the guarded assignment idiom with a compare added
in front.

The target is the full **two-sided** clamp: a floor *and* a ceiling, written as
`if / else if` in C. Its listing brings together everything this chapter has
taught. Here is what to expect in the details:

- **A sign test comes first** (`bgez`, the floor check, flipped). In that
  branch's *delay slot* is an `slti`, which is the **ceiling test, computed
  early**. A plain slot runs either way, and the compiler decided that
  computing test #2 was harmless on one path and needed on the other. This is
  the chapter's "the slot does real work" habit at full strength. The
  instruction belongs *above* the branch logically, but sits *below* it in
  the listing.
- **A `b` around the middle.** This is the floor path: it assigns its bound
  and jumps straight to the exit.
- **A `bnezl`** finishes the ceiling side. Values in range take it and carry
  the copy to `v0` in the likely slot. Values over the top fall through and
  are assigned the cap (an `addiu` with the boundary constant).

Decode the two boundary constants. One of them appears as an assignment of
`zero`, so you might overlook it. The other is in the `slti` (watch for the
off-by-one from the flip lesson). Then write the plain C with two branches.
You don't need ternaries: IDO if-converted a statement-form `if`/`else if`.

## Your task

Write `func_801b531c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_801b531c(s32 x) {
    if (x < 0) {
        x = 0;
    } else if (x > 100) {
        x = 100;
    }
    return x;
}
```
