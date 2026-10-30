---
id: 8601a4f7-627e-48a7-973f-4972136fdec5
slug: pointers-index-store
title: "Indexed Stores"
difficulty: 2
concepts:
  - pointers
  - arrays
  - stores
symbol: func_80180690
hints:
  - "This is the same trio as in the last lesson, but the third instruction is a store. The value it stores comes straight from a register, with no computation."
  - "Find the argument register that the `sw` writes to memory. That register is your right-hand side."
---

# The trio, writing

The indexing trio of shift, add and load has a matching form for writing:
shift, add, **store**. Here is `blank`, which sets one element of a word
array to zero:

```c
void blank(s32 *a, s32 i) {
    a[i] = 0;
}
```

```asm
sll   t6, a1, 2     # i * 4
addu  t7, a0, t6    # &a[i]
sw    zero, 0(t7)   # a[i] = 0
jr    ra
nop
```

The address part is the same as in the load version: the same `sll` by the
stride, and the same `addu` with the base. Only the last mnemonic and the
direction of the data change. This listing also uses a register you already
know in a new way. Storing the constant `0` needs no `addiu` to build it,
because the `zero` register already holds that value, and a store can use it
directly as its source. `sw zero, …` is how the compiler writes a zero
without an extra instruction.

So read an assignment to `a[i]` from the bottom up. The `sw` tells you *what*
goes to memory, and the `addu`/`sll` pair above it tells you *where*. When the
stored register is an argument instead of `zero`, the right-hand side of the C
is that parameter.

The target stores one of its arguments into a word array at a variable
index. Every argument is used.

## Your task

Write `func_80180690` to reproduce the target assembly.

<!-- solution -->
```c
void func_80180690(s32 *a, s32 i, s32 v) {
    a[i] = v;
}
```
