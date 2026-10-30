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
  - "The a0 of the `bcopy` call comes straight from the homed second parameter, and its a1 is data + top × elementSize. Remember the order of bcopy's arguments: source first."
  - "After the call, top is incremented and stored, then *reloaded* and compared with capacity. The `bnel` skips an `sh zero`. That is an `if` that wraps top to zero, followed by the count increment."
---

# Copying into a ring buffer

This lesson returns to the generic queue from lesson 001. This time the
function puts an element *in*. It has what a typical mid-sized function has: a
computed address, a library call, state updates after the call, and a
wrap-around test.

The copy uses `bcopy`, libultra's memory copy. Be careful with one detail:
**`bcopy` takes source first, then destination**, as in `bcopy(src, dst, len)`.
This is the reverse of `memcpy`. The extern in the context shows the order.

The destination is "slot number `top`" inside the queue's storage:
base + top × elementSize. Both fields are `s16`s, and the product is computed
with `multu`/`mflo`. The `u` does not mean you need unsigned types. For the low
32 bits, signed and unsigned multiplies give the same result, so IDO may use
either one. You write a plain `*`.

Here is the same pattern in `binWipeNext`, which clears one cell of a bin and
advances it:

```asm
 0:  addiu sp, sp, -24
 4:  sw    ra, 20(sp)
 8:  or    a2, a0, zero      # the struct pointer moves out of a0 for the call
 c:  lh    a1, 2(a2)         # b->cellSize
10:  lh    t7, 0(a2)         # b->used
14:  lw    t6, 4(a2)         # b->cells
18:  sw    a2, 24(sp)        # pointer saved in the incoming-arg slot
1c:  multu t7, a1            # used * cellSize
20:  mflo  t8
24:  addu  a0, t6, t8        # cells + used*cellSize → first argument
28:  jal   wipe
2c:  nop
30:  lw    a2, 24(sp)        # saved pointer is reloaded
34:  lh    t9, 0(a2)         # b->used again: memory may have changed
38:  addiu t0, t9, 1
3c:  sh    t0, 0(a2)         # b->used += 1
40:  lw    ra, 20(sp)
44:  jr    ra
48:  addiu sp, sp, 24
```

Note the order of the steps. The pointer moves out of `a0`, the callee's
arguments are built, values that must survive the call are saved, the call
runs, and the saved values are reloaded. Only *then* does the bookkeeping after
the call happen. Its fields are loaded again from memory, because the call
could have changed anything in memory, so the compiler cannot reuse values it
loaded before.

The target adds one more step after its increment. The value it just stored is
read back and compared with another field, and a `bnel` decides whether an
`sh zero` runs. You wrote that kind of C many times in tier 2: an `if` with one
store in it. Finally, one more field is incremented and the function ends.

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
