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
  - "The skeleton is the same as in the worked example. Look at the delay slot of the `jr` on the match path. What does it return this time? Then look at the two failure loads. What value do they build?"
  - "The function returns a pointer. `arr` moves forward by increment, so which C expression *is* that pointer?"
---

# A loop with an early return

This is the last short pattern before the grand capstone. The function
walks a table of structs that ends with a sentinel. It returns one value
when it finds a match, and a different value when it reaches the end of
the table. Here is `lookupNum`, which finds a code in an `Entry` table
and returns its number (a zero `code` ends the table):

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

Every line here has a reason:

- **The peek runs one entry ahead.** It loads from `8(a0)`, the code of
  the *next* entry, before `a0` advances. A sentinel walk always tests
  one step ahead. Here the step forward is part of the load's offset
  instead of a separate add.
- **A `jr ra` in the middle of a function is an early return.** Its
  delay slot does the return's work, which here is loading `e->num`. A
  function with several exits puts a result in place for every `jr`,
  often in its delay slot.
- **The failure value is built twice**: once in the likely slot of the
  empty-table guard, and once after the loop. One `return -1` in C
  becomes two copies in the compiled code.

The target searches an `Item` table in the same way, but its exits
return different values from `lookupNum`. Watch what each exit path
leaves in `v0`, and work out which C value it is.

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
