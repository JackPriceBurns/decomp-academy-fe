---
id: e81fb62b-c48a-5511-b73e-ba3e21076419
slug: pointers-store
title: Storing Through a Pointer
difficulty: 1
concepts:
  - stores
  - pointers
  - memory
symbol: func_80207ed8
hints:
  - Writing through a pointer is a store; the value is in r4.
  - "`*p = v` compiles to `stw r4, 0(r3)` — source register first."
---

# Writing to memory

A store is a load in reverse. `stw rS, off(rA)` takes the 32-bit value in `rS` and
writes it to `rA + off`.

Watch the operand order. The source register comes first, then the address — the
opposite of a left-to-right C assignment. In `stw r4, 4(r3)`, `r4` is the value and
`r3` is the base address.

Here's a function writing into the second element of an array:

```c
void write_second(int* p, int v) {
    p[1] = v;
}
```

```asm
stw  r4, 4(r3)    # write v to p + 4 bytes
blr
```

A store returns nothing, so the function just falls through to `blr`. The same
base-plus-displacement addressing from loads applies here.

Now look at the target assembly for `func_80207ed8`. The displacement tells you the
element, and the two register numbers tell you which is the pointer and which is the
value.

## Your task

Write `func_80207ed8` so it compiles to the `stw` above.

<!-- solution -->
```c
void func_80207ed8(int* p, int v) {
    *p = v;
}
```
