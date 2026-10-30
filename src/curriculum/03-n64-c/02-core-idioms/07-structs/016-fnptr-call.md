---
id: 136b3fc8-24e3-45ca-9e7a-a0f5cdb24e8b
slug: structs-fnptr-call
title: "Calling Through a Field"
difficulty: 3
concepts:
  - structs
  - function-pointers
  - jalr
symbol: func_800dacfc
hints:
  - "The `lw` into `t9` reads the function pointer. Its offset tells you which field of `Sprite` is being called."
  - "The call takes no arguments, and the whole function is that one call. When you write it, the compiler adds the frame lines for you."
---

# obj->handler()

Game objects often store *behavior* as data: a struct field that holds the
address of a function. Calling it takes one load plus one new instruction.
Here is `runThink`, which calls an actor's `think` callback:

```c
typedef struct {
    s32 id;                // offset 0
    void (*think)(void);   // offset 4
} Actor;

void runThink(Actor *a) {
    a->think();
}
```

```asm
 0:  addiu sp, sp, -24   # frame setup
 4:  sw    ra, 20(sp)    #    save the return address
 8:  lw    t9, 4(a0)     # load the function POINTER field
 c:  jalr  t9            # call whatever address t9 holds
10:  nop                 # (delay slot)
14:  lw    ra, 20(sp)    # frame teardown
18:  addiu sp, sp, 24    #
1c:  jr    ra
20:  nop
```

The important part is two lines. `lw t9, 4(a0)` reads the field at offset 4.
The value it loads is an *address to jump to*. Then **`jalr t9`**
(jump-and-link register) calls it. It jumps to the address in `t9` and leaves
the return address in `ra`. This is what `jal name` does when the destination
is known at compile time. IDO always makes an indirect call through `t9`.
Treat `lw t9` + `jalr t9` as one unit that means *"call the function stored
here."*

Also notice what the call *costs*: four extra lines. As soon as a function
calls anything, the call overwrites the function's own `ra`. So the function
must save `ra` on the stack first (`addiu sp`/`sw ra`) and restore it
afterwards (`lw ra`/`addiu sp`). That is a **stack frame**, and the next tier
covers stack frames in detail. For now, read the four lines as one fixed
wrapper around any call, and don't let them distract you.

In the target, a `Sprite`'s callback is called. Check the `lw t9` offset
against the layout below to see which field that is.

## Your task

Write `func_800dacfc` to reproduce the target assembly.

<!-- solution -->
```c
void func_800dacfc(Sprite *s) {
    s->draw();
}
```

<!-- context -->
```c
typedef struct {
    s32 kind;
    s32 state;
    void (*draw)(void);
} Sprite;
```
