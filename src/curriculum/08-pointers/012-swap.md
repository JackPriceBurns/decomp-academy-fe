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

Swapping the values behind two pointers is pure memory traffic: load both, then
store each into the other's slot. MWCC loads both words up front (into `r5` and
`r0`) *before* storing, so neither store clobbers a value still needed:

```asm
lwz  r5, 0(r3)    # t = *a
lwz  r0, 0(r4)    # *b
stw  r0, 0(r3)    # *a = *b
stw  r5, 0(r4)    # *b = t
blr
```

The C temporary `t` never reaches the stack — it lives in `r5` for the brief
window between the loads and stores. Watch how the compiler reorders the two
loads ahead of the stores; the order in your C source doesn't bind it.

Notice the second loaded word lands in `r0`. `r0` is special on PowerPC: when
it appears as the *base* register of a load/store (`0(r0)`, say) the hardware
reads it as a literal `0` rather than the register's contents, so the compiler
keeps it for scratch values like this and never uses it as an address base.

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
