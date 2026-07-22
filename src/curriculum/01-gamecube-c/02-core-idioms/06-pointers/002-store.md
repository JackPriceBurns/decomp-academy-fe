---
id: e81fb62b-c48a-5511-b73e-ba3e21076419
slug: pointers-store
title: Storing Through a Pointer
difficulty: 1
concepts:
  - stores
  - pointers
  - memory
symbol: store_int
hints:
  - Writing through a pointer is a store; the value is in r4.
  - "`*p = v` compiles to `stw r4, 0(r3)` — source register first."
---

# Writing to memory

A store is just a load run backwards. `stw rS, off(rA)`, store word, takes the
32-bit value sitting in `rS` and drops it at the address `rA + off`.

What trips people up is the operand order. The source register `rS` comes first
and the address `off(rA)` follows, which is backwards from the way a C assignment
reads left to right. So in `stw r4, 4(r3)`, it is `r4` that holds the value
heading out and `r3` that holds the base address.

Here is a function writing into the second element of an array:

```c
void write_second(int* p, int v) {
    p[1] = v;
}
```

```asm
stw  r4, 4(r3)    # write v to p + 4 bytes
blr
```

Nothing comes back from a store, so there is nothing to return, and the function
simply tumbles into `blr`. That same base-plus-displacement addressing you saw on
loads carries over here without a change.

Now turn to the target assembly for `store_int`. The displacement tells you the
element, and the two register numbers tell you which one is the pointer and which
is the value.

## Your task

Write `store_int` so it compiles to the `stw` above.

<!-- solution -->
```c
void store_int(int* p, int v) {
    *p = v;
}
```
