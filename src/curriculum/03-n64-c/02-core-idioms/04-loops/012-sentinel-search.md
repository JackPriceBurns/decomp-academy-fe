---
id: fa2cf703-cbf5-4660-a5c0-514328d2f39a
slug: loops-sentinel-search
title: "Search Loops: A Return in the Middle"
difficulty: 4
concepts:
  - loops
  - control-flow
  - pointers
  - delay-slots
symbol: func_8028b3dc
hints:
  - "Compared to the worked example, there is one extra register: a counter that goes up alongside the walking pointer. The mid-loop exit returns it instead of a constant."
  - "A miss returns -1. The `bnel` skips only the place where the counter is used, and the counter itself is still there. The C is still `if (tbl[i] == key) return i;` inside the walk."
---

# Loops with an exit in the middle

A search loop has *two* ways to end. Either the walk reaches the end, or it
finds something and returns at once. The second exit compiles to something
you haven't seen yet: **a `jr ra` in the middle of a loop body**. Here is
`has_key(tbl, key)`, which walks a table that ends with a zero and reports
whether `key` appears in it:

```c
s32 has_key(s32 *tbl, s32 key) {
    s32 i = 0;
    while (tbl[i] != 0) {
        if (tbl[i] == key) {
            return 1;
        }
        i++;
    }
    return 0;
}
```

```asm
 0:  lw    t6, 0(a0)      # peeled guard load, as in every walk
 4:  or    v0, a0, zero   # cursor = tbl
 8:  beqzl t6, 0x38       # empty table? exit with…
 c:  or    v0, zero, zero # (likely slot) …0
10:  lw    v1, 0(a0)      # ── loop top: current element
14:  bnel  a1, v1, 0x28   # not the key? continue the walk…
18:  lw    v1, 4(v0)      # (likely slot) …pre-loading the NEXT element
1c:  jr    ra             # FOUND: return from inside the loop
20:  addiu v0, zero, 1    # (slot) the 1
24:  lw    v1, 4(v0)      # (dead clone: nothing jumps here, see below)
28:  addiu v0, v0, 4      # cursor++
2c:  bnez  v1, 0x14       # next element non-zero? around again
30:  nop
34:  or    v0, zero, zero # walked off the end: 0
38:  jr    ra
3c:  nop
```

There are three exits, and only one of them is at the bottom:

- `8`: the guard's early exit (empty table → 0).
- `1c`: the **mid-loop return**. This is a `jr ra` with its value in the
  delay slot, and it leaves the function while the loop is still in
  progress. In C this is an ordinary `return` inside the loop body.
- `38`: the return after the walk reaches the end. Its value is set on the
  line before.

The `bnel` at `14` is the `if` around the return, flipped as usual: if the
values are *not* equal, skip the return and keep walking. Its likely slot
does the same thing you saw in the walk lesson. It loads `tbl[i+1]` early,
ready for the next test.

Now look at line `24`. If you trace every branch target in the listing, none
of them lands there, and the code just above it has already *returned*. It
is a **dead clone**. The cloning step made its usual copy of the slot load,
even though the path that finds the key ends the function, and no later pass
removed it. IDO leaves small leftovers like this around mid-loop returns.
Each one costs four bytes and never runs. Your C still matches it, as long as
the `return` is in the right place. Don't write C for a line that no path
executes.

When you decompile one of these, count the `jr ra`s first, the habit you
learned with ladders in the control chapter. One at the end plus one in the
middle of the body means "a loop with a conditional `return` inside". Then
read what each exit returns. Those values tell you exactly what the C must
be.

The target is the same search, but a hit returns the *index*. Follow the
extra counter through the loop, and check which register each exit returns.

## Your task

Write `func_8028b3dc` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8028b3dc(s32 *tbl, s32 key) {
    s32 i = 0;
    while (tbl[i] != 0) {
        if (tbl[i] == key) {
            return i;
        }
        i++;
    }
    return -1;
}
```
