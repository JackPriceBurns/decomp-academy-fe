---
id: 994d5247-1f98-5e20-a603-a732f3df0840
slug: pointers-swap
title: Swapping Through Pointers
difficulty: 3
concepts:
  - loads
  - stores
  - pointers
symbol: func_80253548
hints:
  - Load both values, then store each into the other slot.
  - Two `lwz` followed by two `stw`; the temporary stays in a register.
---

# Two loads, two stores

Swapping the values behind two pointers means loading both before writing either,
so neither store overwrites a value that hasn't been saved. MWCC issues both loads
first, keeps the values in registers, then writes both stores — the C assignment
order doesn't constrain it.

One loaded value lands in `r0`. `r0` is architecturally special on PowerPC: when it
appears as the *base* register of a load or store (like `0(r0)`), the hardware
treats it as literal `0` instead of the register's value. The compiler therefore
avoids using `r0` as an address base and keeps it for scratch values like this
temporary.

Here's the pattern for `u32` values:

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

Both loads come before both stores. The temporary stays in `r5` across the stores;
the other loaded value sits in `r0`. Apply this to `int*` pointers to reproduce the
target.

## Your task

Write `func_80253548` to match the target assembly.

<!-- solution -->
```c
void func_80253548(int* a, int* b) {
    int t = *a;
    *a = *b;
    *b = t;
}
```
