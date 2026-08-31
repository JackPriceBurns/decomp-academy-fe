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
  - "The `lw` into `t9` reads the function pointer — its offset tells you which field of `Sprite` is being called."
  - "The call takes no arguments and the whole function is just that one call. The frame lines come free when you write it."
---

# obj->handler()

Game objects carry *behavior* as data: a struct field that holds a
function's address. Calling it is one load plus one new instruction.
Here's `runThink`, which invokes an actor's `think` callback:

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
 0:  addiu sp, sp, -24   # ── frame setup
 4:  sw    ra, 20(sp)    #    save the return address
 8:  lw    t9, 4(a0)     # load the function POINTER field
 c:  jalr  t9            # call whatever address t9 holds
10:  nop                 # (delay slot)
14:  lw    ra, 20(sp)    # ── frame teardown
18:  addiu sp, sp, 24    #
1c:  jr    ra
20:  nop
```

The heart is two lines. `lw t9, 4(a0)` reads the field at offset 4 —
not a value to compute with, but an *address to jump to*. Then
**`jalr t9`** — jump-and-link register — calls it: jump to the address
in `t9`, leaving the return address in `ra`, exactly what `jal name`
does when the destination is known at compile time. IDO always stages
an indirect call through `t9`; treat `lw t9` + `jalr t9` as one unit
meaning *"call the function stored here."*

And notice what the call *cost*: four lines of scaffolding. The moment
a function calls anything, its own `ra` gets overwritten by the call —
so it must park `ra` on the stack first (`addiu sp`/`sw ra`) and
restore it after (`lw ra`/`addiu sp`). That's a **stack frame**, and
the next tier is all about them. For now, read the four lines as one
fixed sandwich around any call and don't let them distract you.

In the target, a `Sprite`'s callback gets invoked — check the `lw t9`
offset against the layout below to see which field that is.

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
