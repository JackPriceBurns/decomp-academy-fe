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
  - "The `beqz` on the pointer argument skips the store when the pointer is 0. The body is an `if` around one assignment, and nothing else."
  - "The delay slot after the branch really is a `nop` this time. Don't add work to fill it."
---

# NULL is zero

To the hardware, `NULL` is the number 0 with a pointer type. So every NULL
check compiles to instructions you already know: the branches that compare
with zero from the control chapter, used on a pointer register. Here is
`safe_read`, which does not dereference a NULL pointer:

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
 4:  addiu v0, zero, -1    # (slot) the -1, built in advance
 8:  jr    ra
 c:  lw    v0, 0(a0)       # (slot) the deref, in the return's delay slot
10:  jr    ra
14:  nop
```

IDO saves instructions here in two places. The fallback `-1` is built in the
delay slot of the *branch*. It is computed whether it is needed or not, and on
the normal path it is then overwritten. The actual dereference sits in the
delay slot of the **return**, which means "jump back to the caller, and do the
load on the way out." Both delay slots do real work, in a five-line function.

The guard itself is the part to remember. A `beqz` on a pointer argument,
right at the top, means the C starts with `if (p != NULL)`. It could also be
an early `if (p == NULL) return …;`, which gives the same machine code for
functions this small. Game code checks pointers like this all the time, and
you will see this branch at the top of many of the functions you match.

The target guards a *store*. It checks the pointer, and writes a value
through it only if the check passes. There is no fallback value this time.

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
