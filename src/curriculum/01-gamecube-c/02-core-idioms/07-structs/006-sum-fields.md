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
symbol: Point_sum
hints:
  - Two loads from the same base register, at two different offsets, then one
    combining instruction.
  - Each field is read with its own `lwz off(r3)`; the offsets tell you which
    two fields, the arithmetic tells you how they're joined.
---

# Two loads, then combine

Up to now every function has read a single field. That isn't how real code
behaves. It grabs a handful of fields off the same struct and does something with
them, and the assembly for that is about as plain as it gets: a load per field,
all hanging off the same base pointer, then some arithmetic to fold them
together. Since the base lives in `r3` and never moves, every `lwz` points at
`r3` and just changes the displacement.

Take a health struct whose function works out how much health is missing.

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

So the two `lwz`s park each field in a scratch register, and `subf` glues them:
`subf rD, rA, rB` is `rB − rA`. Want to know which field a load grabbed? Look at
its offset. Want to know how the two were combined? Look at the instruction that
did it. The one gotcha is ordering. The loads come out in the order the source
expression mentions the fields, which has nothing to do with their offsets.

Your assembly pulls the same trick on a different struct and uses a different
operation to join the values. Pair each `lwz` displacement with a field and
rebuild the arithmetic.

## Your task

With the `Point` struct above, write `Point_sum` to reproduce the assembly above.

<!-- solution -->
```c
int Point_sum(Point* p) {
    return p->x + p->y;
}
```

<!-- context -->
```c
typedef struct { int x; int y; } Point;
```
