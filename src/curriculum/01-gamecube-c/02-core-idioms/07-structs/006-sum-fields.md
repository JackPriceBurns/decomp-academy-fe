---
id: 1dc78e5b-b26e-556a-8224-e99735a292d8
slug: structs-sum-fields
title: Combining Two Fields
difficulty: 1
concepts:
  - structs
  - load
  - offsets
  - chaining
symbol: func_80371e38
hints:
  - Two loads from the same base register, at two different offsets, then one
    combining instruction.
  - Each field is read with its own `lwz off(r3)`; the offsets tell you which
    two fields, the arithmetic tells you how they're joined.
---

# Two loads, then combine

Up to now every function read a single field. Real code grabs a handful of
fields off the same struct and does something with them. The assembly is
straightforward: a load per field, all off the same base pointer, then
arithmetic to fold them together. Since the base stays in `r3`, every `lwz`
points at `r3` and just changes the displacement.

Take a health struct whose function works out how much health is missing:

```c
typedef struct { int hp; int maxHp; } Health;

int Health_missing(Health* h) {
    return h->maxHp - h->hp;
}
```

```asm
lwz   r4, 0(r3)    # r4 = h->hp     (offset 0)
lwz   r0, 4(r3)    # r0 = h->maxHp  (offset 4)
subf  r3, r4, r0   # r3 = r0 - r4  =  maxHp - hp
blr
```

The two `lwz`s park each field in a scratch register, and `subf` glues them:
`subf rD, rA, rB` is `rB − rA`. To find which field a load grabbed, look at its
offset; to find how they were combined, look at the combining instruction. The
one gotcha is ordering — the loads come out in the order the source expression
mentions the fields, not necessarily by offset.

Your assembly pulls the same trick on a different struct with a different
operation. Pair each `lwz` displacement with a field and rebuild the
arithmetic.

## Your task

Using the `Point` struct provided, write `func_80371e38` to reproduce the
target assembly.

<!-- solution -->
```c
int func_80371e38(Point* p) {
    return p->x + p->y;
}
```

<!-- context -->
```c
typedef struct { int x; int y; } Point;
```
