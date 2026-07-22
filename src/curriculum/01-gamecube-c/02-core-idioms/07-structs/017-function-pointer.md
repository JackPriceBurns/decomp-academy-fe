---
id: cc8c0583-b4f8-546e-89f2-813f27d51c4c
slug: structs-function-pointer
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

Stash a function pointer inside a struct and you've reinvented the virtual method
without a line of C++. Calling one takes three moves. The compiler loads the
pointer out of the struct, drops it into the count register (CTR), and branches
through CTR. The struct in question:

```c
typedef struct Actor {
    int hp;
    void (*update)(struct Actor*);
} Actor;
```

`update` sits at offset 4. And because this function actually calls something,
it's **non-leaf**, so it has to stand up a frame and stash the return address
somewhere safe. Here's the whole thing:

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

Strip away the `stwu`/`mflr`/`stw` prologue and its mirror-image epilogue, the
usual non-leaf bookkeeping, and the real work is three instructions in the
middle. `lwz r12, off(rX)` → `mtctr r12` → `bctrl`. See that trio and you're
looking at an **indirect call through a struct field**, whether that's a vtable
dispatch or a plain callback. Notice too that `a` is already parked in `r3`, so
nothing extra needs to happen before the branch.

## Your task

With `Actor` above, write `Actor_run` to reproduce the assembly above.

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
