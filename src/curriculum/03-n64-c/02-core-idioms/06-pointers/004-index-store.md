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
  - "Same trio as the last lesson, but the third instruction is a store — and what it stores comes straight from a register, no computation."
  - "Which argument register does the `sw` push into memory? That's your right-hand side."
---

# The trio, writing

The shift-add-load trio has a writing twin: shift, add, **store**.
Here's `blank`, which zeroes one element of a word array:

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

The address side is identical to the load version — same `sll` by the
stride, same `addu` with the base. Only the final mnemonic and the
direction of data flow change. And this listing shows off an old friend
in a new role: storing the constant `0` needs no `addiu` to build it,
because the `zero` register *is* the constant, usable directly as a
store's source. `sw zero, …` is the compiler's free "write a zero".

So an assignment to `a[i]` reads, bottom-up: the `sw` says *what* goes
to memory, the `addu`/`sll` pair above it says *where*. When the stored
register is an argument rather than `zero`, the C's right-hand side is
just that parameter.

The target stores one of its arguments into a word array at a variable
index — every argument pulling its weight.

## Your task

Write `func_80180690` to reproduce the target assembly.

<!-- solution -->
```c
void func_80180690(s32 *a, s32 i, s32 v) {
    a[i] = v;
}
```
