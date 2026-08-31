---
id: 89181393-9d80-4dcb-aed1-2b4c8c70c6b9
slug: finale-table-search
title: "Searching a Table"
difficulty: 4
concepts:
  - structs
  - loops
  - pointers
  - multi-return
  - capstone
symbol: func_8024604c
hints:
  - "Same skeleton as the worked example. Look at the match path's `jr` slot — what does it hand back this time? And the two failure loads — what value do they build?"
  - "The function returns a pointer. Which C expression *is* that pointer, given `arr` walks by increment?"
---

# while, if, return, next

The last compact shape before the grand finale: walk a
sentinel-terminated table of structs, return something on match,
something else on running off the end. Here's `lookupNum`, which
maps a code to its number in an `Entry` table (a zero `code` ends
the table):

```c
typedef struct {
    s32 code;   // offset 0
    s32 num;    // offset 4
} Entry;

s32 lookupNum(Entry *e, s32 code) {
    while (e->code != 0) {
        if (e->code == code) {
            return e->num;
        }
        e++;
    }
    return -1;
}
```

```asm
 0:  lw    v0, 0(a0)        # peek the first code
 4:  beqzl v0, 0x30         # empty table? return…
 8:  addiu v0, zero, -1     #   (likely slot) …-1
 c:  bnel  a1, v0, 0x20     # ── loop: not our code? advance…
10:  lw    v0, 8(a0)        #   (likely slot) peek the NEXT entry's code
14:  jr    ra               # match! return…
18:  lw    v0, 4(a0)        #   (slot) …e->num, loaded on the way out
1c:  lw    v0, 8(a0)        # (dup of the peek, for the fall-through)
20:  addiu a0, a0, 8        # e++  (sizeof(Entry) = 8)
24:  bnez  v0, 0xc          # next code nonzero? go around
28:  nop
2c:  addiu v0, zero, -1     # sentinel reached: -1
30:  jr    ra
34:  nop
```

Everything earns its place:

- **The peek runs an entry ahead**, at offset `8(a0)` — *next*
  entry's code — loaded before `a0` advances. Sentinel walks always
  test one step in front; the offset arithmetic just moved into the
  load.
- **A `jr ra` mid-function is an early return**, and its slot does
  the return's work: loading `e->num`. Multi-exit functions put a
  result in every `jr`'s shadow.
- **The failure value materializes twice** — once in the empty-table
  guard's likely slot, once after the loop. Same C `return -1`,
  two compiled copies.

The target searches an `Item` table the same way, but returns *the
entry itself* on match, and the null pointer on failure. Watch what each exit path leaves in `v0`, and remember the
walker variable is doing double duty as the answer.

## Your task

Write `func_8024604c` to reproduce the target assembly.

<!-- solution -->
```c
Item *func_8024604c(Item *arr, s32 id) {
    while (arr->id != 0) {
        if (arr->id == id) {
            return arr;
        }
        arr++;
    }
    return NULL;
}
```

<!-- context -->
```c
typedef struct {
    s32 id;
    s32 qty;
} Item;
```
