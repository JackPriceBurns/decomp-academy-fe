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
  - "Compared to the worked example there's one extra register — a counter ticking up beside the walking pointer — and the mid-loop exit returns it instead of a constant."
  - "Miss means -1. The `bnel` skips the counter's use, not its existence; the C is still `if (tbl[i] == key) return i;` inside the walk."
---

# Loops you can fall out of sideways

A search loop has *two* ways to end: the walk runs out, or the walk finds
something and returns on the spot. That second exit compiles to something
you haven't seen yet — **a `jr ra` in the middle of a loop body**. Here's
`has_key(tbl, key)`, which walks a zero-terminated table and reports
whether `key` appears:

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
1c:  jr    ra             # FOUND — return from inside the loop
20:  addiu v0, zero, 1    # (slot) the 1
24:  lw    v1, 4(v0)      # (dead clone — nothing jumps here; see below)
28:  addiu v0, v0, 4      # cursor++
2c:  bnez  v1, 0x14       # next element non-zero? around again
30:  nop
34:  or    v0, zero, zero # walked off the end: 0
38:  jr    ra
3c:  nop
```

Three exits, and only one of them is at the bottom:

- `8`: the guard's early-out (empty table → 0).
- `1c`: the **mid-loop return** — `jr ra` with its value in the slot,
  landing while the loop is still "running". In C this is nothing more
  exotic than a `return` inside the loop body.
- `38`: the fall-off-the-end return, value set the line before.

The `bnel` at `14` is the `if` around the return, flipped as usual: *not*
equal → skip the return, keep walking. Its likely slot pulls the same
trick you saw in the walk lesson — pre-loading `tbl[i+1]` for the next
test.

And line `24`? Trace every branch target in the listing: nothing lands
there, and the fall-through above it just *returned*. It's a **dead clone**
— the cloning machinery stamped out its usual copy of the slot load even
though the found-path ends the function, and no pass came back to sweep it
up. IDO leaves little fossils like this around mid-loop returns; they cost
four bytes, run never, and match perfectly as long as your C has the
`return` in the right place. Don't write C for a line no path executes.

When you decompile one of these, count the `jr ra`s first (the ladder
habit from the control chapter). One at the end plus one mid-body =
"a loop with a conditional `return` inside". Then read what each exit
returns; those values pin down the C completely.

The target is the same search, but a hit returns the *index* — watch the
extra counter threading through and which register each exit hands back.

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
