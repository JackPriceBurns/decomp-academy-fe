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
  - "The `slti` in the first branch's delay slot is the SECOND test, computed early. In C it's just an `else if` — don't write anything special."
  - "Read the two boundary constants off the `slti` and the `addiu`; remember `slti 101` guards a `> 100` test."
---

# Two fences

Game code clamps constantly — health to 0, speed to a cap, a coordinate to
the screen. One-sided first; here's an unsigned cap, `if (x > lim) x = lim;
return x;`:

```asm
 0:  sltu at, a1, a0      # lim < x? (that's x > lim, operands swapped)
 4:  beqzl at, 0x14       # under the cap? return x as-is —
 8:  or   v0, a0, zero    # (likely slot) the untouched copy
 c:  or   a0, a1, zero    # over: x = lim
10:  or   v0, a0, zero
14:  jr   ra
18:  nop
```

All reruns: the swapped-operand `sltu` (a `>` on unsigned values), the
`beqzl` if-conversion, the duplicated copy-out. A one-sided clamp is just the
guarded-assignment idiom with a compare on top.

The target is the full **two-sided** clamp — floor *and* ceiling,
`if / else if` in C — and its listing pulls together everything this chapter
has taught. What to expect in the weeds:

- **A sign test starts it** (`bgez` — the floor check, flipped), and in
  that branch's *delay slot* sits an `slti` — the **ceiling test, computed
  early**. A plain slot runs either way, and the compiler decided computing
  test #2 was harmless on one path and needed on the other. This is the
  chapter's "slot carries real work" habit at full strength: an instruction
  *above* the branch logically, *below* it physically.
- **A `b` around the middle** — the floor-hit path assigning its bound and
  hopping straight to the exit.
- **A `bnezl`** finishing the ceiling side — in-range values take it and
  carry the copy-out in the likely slot; over-the-top values fall through
  to be assigned the cap (an `addiu` with the boundary constant).

Decode the two boundary constants — one is hiding in plain sight as an
assignment of `zero`, the other rides the `slti` (mind the off-by-one from
the flip lesson) — and write the plain two-branch C. No ternaries needed;
statement-form `if`/`else if` is what IDO if-converted.

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
