---
id: pointers-swap
title: Swapping Through Pointers
difficulty: 3
concepts:
  - loads
  - stores
  - pointers
symbol: swap
hints:
  - Load both values, then store each into the other slot.
  - Two `lwz` followed by two `stw`; the temporary stays in a register.
---

# Two loads, two stores

Swapping the values behind two pointers requires loading both before writing
either, so that neither store overwrites a value that hasn't been saved yet.
MWCC issues both loads first, keeps the loaded values in registers, then issues
both stores — the C source order of the assignments does not constrain it.

One of the loaded values lands in `r0`. `r0` is architecturally special on
PowerPC: when it appears as the *base* register of a load or store instruction
(as in `0(r0)`), the hardware treats it as a literal `0` instead of the
register's value. The compiler therefore avoids using `r0` as an address base and
keeps it for scratch values like this temporary.

Here is the same pattern applied to `u32` values:

```c
void swap_u32(u32* a, u32* b) {
    u32 t = *a;
    *a = *b;
    *b = t;
}
```

```asm
lwz     r5,0(r3)    # t = *a
lwz     r0,0(r4)    # load *b into scratch
stw     r0,0(r3)    # *a = *b
stw     r5,0(r4)    # *b = t
blr
```

Both loads come before both stores. The temporary lives in `r5` across the
stores; the other loaded value sits in `r0`. Apply this understanding to `int*`
pointers to reproduce the target.

## Your task

Write `swap`, taking two `int*` and exchanging the values they point to.

<!-- starter -->
```c
void swap(int* a, int* b) {
}
```

<!-- solution -->
```c
void swap(int* a, int* b) {
    int t = *a;
    *a = *b;
    *b = t;
}
```
