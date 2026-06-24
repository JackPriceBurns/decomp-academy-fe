---
id: structs-read-field
title: Reading a Struct Field
difficulty: 1
concepts:
  - structs
  - load
  - offsets
symbol: Point_getY
hints:
  - "`y` is the second `int`, so it sits at byte offset 4."
  - "`p->y` compiles to `lwz r3, 4(r3)`."
---

# A struct is just an offset into memory

A pointer to a struct arrives in `r3` like any other pointer. Reading a field is
a single **load at the field's byte offset**. Given:

```c
typedef struct { int x; int y; } Point;
```

`x` lives at offset 0 and `y` at offset 4 (each `int` is 4 bytes). So
`p->y` is a word load four bytes past the base:

```asm
lwz  r3, 4(r3)   # load p->y
blr
```

That `4(r3)` is the whole story — `lwz rD, off(rA)` means "load the word at
`rA + off`". When you see a bare `lwz r3, 4(r3)`, it's tempting to read it as
`*(int*)((char*)p + 4)`, but that bare offset is really a clue: the original was
almost certainly a **named field** of a struct, and recovering that name and
offset is the job.

## Your task

With the `Point` struct above, write `Point_getY` to match the target.

<!-- starter -->
```c
int Point_getY(Point* p) {
    return 0;
}
```

<!-- solution -->
```c
int Point_getY(Point* p) {
    return p->y;
}
```

<!-- context -->
```c
typedef struct { int x; int y; } Point;
```
