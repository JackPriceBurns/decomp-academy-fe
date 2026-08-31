---
id: 17001c8c-6874-4247-8644-a3c000f0d51c
slug: mastery-queue-enqueue
title: "Enqueue: bcopy and the Wrap-Around"
difficulty: 3
concepts:
  - real-code
  - calls
  - structs
  - multiply
symbol: func_801c0070
hints:
  - "The `bcopy` call's a0 comes straight from the homed second parameter, and its a1 is data + top × elementSize. Remember bcopy's order — source first."
  - "After the call, top gets incremented and stored, *reloaded*, and compared against capacity; the `bnel` skips an `sh zero`. That's a wrap-to-zero `if`, then the count bump."
---

# Copying into a ring

Back to the generic queue from lesson 001 — this time the function that puts
an element *in*. It has everything a real mid-sized function has: a computed
address, a library call, state updates after the call, and a wrap-around test.

The copy itself is `bcopy`, libultra's memory copy. One sharp edge to respect:
**`bcopy` takes source first, then destination** — `bcopy(src, dst, len)`,
the reverse of `memcpy`. The extern in the context has the order spelled out.

The destination is "slot number `top`" inside the queue's storage:
base + top × elementSize. Both fields are `s16`s, and you'll see the product
formed with `multu`/`mflo` — don't let the `u` make you reach for unsigned
types. For the low 32 bits, signed and unsigned multiplies agree, so IDO uses
whichever it likes; you just write `*`.

Here's the same pattern in `binWipeNext`, which clears one cell of a bin and
advances it:

```asm
 0:  addiu sp, sp, -24
 4:  sw    ra, 20(sp)
 8:  or    a2, a0, zero      # the struct pointer vacates a0 for the call
 c:  lh    a1, 2(a2)         # b->cellSize
10:  lh    t7, 0(a2)         # b->used
14:  lw    t6, 4(a2)         # b->cells
18:  sw    a2, 24(sp)        # pointer parked in the incoming-arg slot
1c:  multu t7, a1            # used * cellSize
20:  mflo  t8
24:  addu  a0, t6, t8        # cells + used*cellSize → first argument
28:  jal   wipe
2c:  nop
30:  lw    a2, 24(sp)        # parked pointer comes back
34:  lh    t9, 0(a2)         # b->used again — memory may have changed
38:  addiu t0, t9, 1
3c:  sh    t0, 0(a2)         # b->used += 1
40:  lw    ra, 20(sp)
44:  jr    ra
48:  addiu sp, sp, 24
```

Note the rhythm: shuffle the pointer out of `a0`, build the callee's
arguments, park what must survive, call, reload, and only *then* do the
after-call bookkeeping — with fields re-loaded from memory, because a call
invalidates everything the compiler thought it knew.

The target adds one more beat after its increment: the freshly stored value is
read back and compared against another field, and a `bnel` decides whether an
`sh zero` runs. You've written that C a dozen times in tier 2 — an `if` with
one store in it. Then one last field bumps and it's done.

## Your task

Write `func_801c0070` to reproduce the target assembly.

<!-- solution -->
```c
void func_801c0070(GenericQueue *queue, void *element) {
    bcopy(element, (void *)((u32)queue->data + queue->top * queue->elementSize), queue->elementSize);

    queue->top += 1;

    if (queue->top == queue->capacity) {
        queue->top = 0;
    }

    queue->count += 1;
}
```

<!-- context -->
```c
typedef struct {
    /*00*/ s16 count;
    /*02*/ s16 capacity;
    /*04*/ s16 elementSize;
    /*06*/ s16 unk6;
    /*08*/ s16 top;
    /*0A*/ s16 bottom;
    /*0C*/ void *data;
} GenericQueue;

/* libultra's copy. Source FIRST, then destination — the reverse of memcpy. */
extern void bcopy(void *src, void *dst, s32 len);
```
