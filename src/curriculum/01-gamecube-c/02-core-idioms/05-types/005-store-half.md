---
id: a706a32c-875e-5fab-9f28-32a79e58c851
slug: types-store-half
title: Storing a Halfword
difficulty: 2
concepts:
  - stores
  - truncation
symbol: func_801c1a8c
hints:
  - Writing one halfword uses `sth` (store halfword).
  - "`p[0] = v;` compiles to `sth r4, 0(r3)`."
---

# `sth` is the 16-bit store

Writing a halfword goes through **`sth`** (*store halfword*), which lays down
the **low 16 bits** of a register and nothing above them:

```asm
sth  r4, 6(r3)   # table[3] = val
blr
```

The example above writes index 3 of a `u16` array — six bytes in — with the
pointer in `r3` and the value in `r4`.

Every store has a twin among the loads at the same width: alongside `sth`
there's `stb` down at the byte level and `stw` up at the full word. Sign never
enters into it — a store only truncates its operand to the right width and
copies it across. When you need a signed value back, that work falls to the
*load* later on, never the store.

## Your task

Write `func_801c1a8c` to produce a single `sth`.

<!-- solution -->
```c
void func_801c1a8c(u16* p, u16 v) {
    p[0] = v;
}
```
