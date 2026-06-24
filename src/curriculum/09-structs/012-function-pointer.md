---
id: structs-function-pointer
title: Calling Through a Function Pointer
difficulty: 4
concepts:
  - structs
  - function-pointers
  - vtable
  - ctr
symbol: Actor_run
hints:
  - "Call the stored pointer directly: `a->update(a);`."
  - Expect `lwz r12, 4(r3)`, `mtctr r12`, then `bctrl`.
---

# Indirect calls: load, mtctr, bctrl

Storing a function pointer in a struct is how C fakes virtual methods. To call
it, the compiler **loads the pointer, moves it into the count register (CTR),
then branches to CTR**. Given:

```c
typedef struct Actor {
    int hp;
    void (*update)(struct Actor*);
} Actor;
```

`update` is at offset 4. Because this function makes a call, it is **non-leaf**
and needs a frame to preserve the return address. The full listing is:

```asm
stwu   r1, -16(r1)  # open a stack frame
mflr   r0
stw    r0, 20(r1)   # save the return address (LR)
lwz    r12, 4(r3)   # load the function pointer
mtctr  r12          # move it into CTR
bctrl               # branch to CTR, set link  (the indirect call)
lwz    r0, 20(r1)   # restore LR
mtlr   r0
addi   r1, r1, 16   # tear down the frame
blr
```

The `stwu`/`mflr`/`stw` prologue and the matching epilogue are the standard
non-leaf frame; the indirect call itself is the middle three lines. The trio
`lwz r12, off(rX)` → `mtctr r12` → `bctrl` is the unmistakable signature of an
**indirect call through a struct field** — a vtable dispatch or callback. The
argument `a` is already in `r3`, so no extra setup is needed before the call.

## Your task

With `Actor` above, write `Actor_run` to reproduce the assembly above.

<!-- starter -->
```c
void Actor_run(Actor* a) {
}
```

<!-- solution -->
```c
void Actor_run(Actor* a) {
    a->update(a);
}
```

<!-- context -->
```c
typedef struct Actor {
    int hp;
    void (*update)(struct Actor*);
} Actor;
```
