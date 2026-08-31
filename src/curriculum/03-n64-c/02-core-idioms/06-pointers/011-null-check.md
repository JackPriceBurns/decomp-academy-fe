---
id: 8afa2722-1e55-4dd2-91a2-8342e08ea8b9
slug: pointers-null-check
title: "The NULL Guard"
difficulty: 2
concepts:
  - pointers
  - null
  - branches
symbol: func_802be89c
hints:
  - "`beqz` on the pointer argument skips the store when the pointer is
    0 — an `if` wrapped around one assignment, nothing else."
  - "The slot under the branch is an honest `nop` this time; don't invent work to fill it."
---

# NULL is just zero

`NULL` isn't a special value to the hardware — it's the number 0
wearing a pointer type. Which means every NULL check compiles to
machinery you already own: the zero-compare branches from the control
chapter, aimed at a pointer register. Here's `safe_read`, which refuses
to dereference nothing:

```c
s32 safe_read(s32 *p) {
    if (p != NULL) {
        return *p;
    }
    return -1;
}
```

```asm
 0:  beqz  a0, 0x10        # p == NULL? take the fallback
 4:  addiu v0, zero, -1    # (slot) the -1, built hopefully
 8:  jr    ra
 c:  lw    v0, 0(a0)       # (slot) the deref rides the return's slot!
10:  jr    ra
14:  nop
```

Classic IDO economy, twice over. The fallback `-1` is built in the
*branch's* delay slot — computed whether or not it's needed, then
overwritten on the happy path. And the actual dereference sits in the
**return's** delay slot: "jump back to the caller, and on the way out,
do the load." Both slots carrying real work, in a five-line function.

The guard itself is the part to internalize: `beqz` on a pointer
argument, right at the top, means the C opens with `if (p != NULL)`
(or an early `if (p == NULL) return …;` — same machine code for
shapes this small). Game code guards constantly; you'll meet this
branch at the top of half the functions you ever match.

The target guards a *store*: check, then maybe write the second
argument through the first. No fallback value this time.

## Your task

Write `func_802be89c` to reproduce the target assembly.

<!-- solution -->
```c
void func_802be89c(s32 *p, s32 v) {
    if (p != NULL) {
        *p = v;
    }
}
```
