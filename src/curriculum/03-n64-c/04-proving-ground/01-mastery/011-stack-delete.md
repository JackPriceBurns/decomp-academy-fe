---
id: b3018808-f0bc-4d20-a638-b2685ec8e96f
slug: mastery-stack-delete
title: Deleting From the Middle
difficulty: 4
concepts:
  - real-code
  - loops
  - calls
  - saved-registers
symbol: func_800c0620
hints:
  - "Three pointers are set up before the loop: the end from `count`, the source from `idx + 1` (the `addiu` adding 1 to `a1` before the second `multu`), and the destination one element below the source. Both products use the same `elementSize`."
  - "Inside the loop, `elementSize` is *reloaded* from the struct after the call, and then both pointers advance by it. The compiler cannot assume memory is unchanged across `bcopy`. Write the advances after the copy and IDO handles the rest."
---

# Closing a gap in the stack

The generic stack is related to the queue, and its struct is in the context.
Sometimes it needs to remove an element from the *middle*, for example to
cancel one queued effect and keep the rest in order. The shipped code does
this in the simple, slow way: it uses `bcopy` to move every element above the
gap down one slot.

This is your first target with the full setup of a loop in a non-leaf
function: five saved registers, a call in every iteration, and pointer
arithmetic done once before the loop. Here is the basic structure on its own,
in `flushRange`, which walks a byte range and makes one call per chunk:

```asm
 0:  addiu sp, sp, -40
 4:  sw    s2, 32(sp)
 8:  sw    s1, 28(sp)
 c:  sw    s0, 24(sp)
10:  or    s0, a0, zero      # cursor → s0: it must survive the calls
14:  or    s1, a2, zero      # chunk  → s1
18:  or    s2, a1, zero      # end    → s2
1c:  sw    ra, 36(sp)
20:  sltu  at, s0, s2        # cursor < end?  pointers compare UNSIGNED
24:  beqz  at, 0x44          # empty range → skip the loop entirely
28:  or    a0, s0, zero      #   (slot) first call's argument
2c:  jal   flush
30:  or    a1, s1, zero      #   (slot) second argument, set in the jal's slot
34:  addu  s0, s0, s1        # cursor += chunk
38:  sltu  at, s0, s2
3c:  bnezl at, 0x2c          # more → go again
40:  or    a0, s0, zero      #   (slot) refresh the argument
44:  lw    ra, 36(sp)
48:  lw    s0, 24(sp)
4c:  lw    s1, 28(sp)
50:  lw    s2, 32(sp)
54:  jr    ra
58:  addiu sp, sp, 40
```

Every piece comes from a tier-3 lesson. Loop values live in `s`-registers
because `t`-registers are lost at each `jal`. The guard test is copied above
the loop. Call arguments are set up in delay slots. `sltu` is used because
pointer comparisons are unsigned.

The target adds three complications. First, the loop bounds are *computed*.
There is an end pointer from `count`, a source pointer from `idx + 1` (look for
an `addiu` of 1 before one of the two `multu`s), and a destination one element
behind the source (the `subu` right at the branch). Second, the element size is
kept in an `s`-register, but it is **read again from the struct inside the
loop**. After a call, the compiler must load values from memory again. For the
advances, your C must use the field itself instead of a copy saved in a local,
so that the compiler is free to do this. Third, when the loop ends, `count`
goes down by one.

Label the three pointers on paper first. The C is shorter than the long
listing suggests.

## Your task

Write `func_800c0620` to reproduce the target assembly.

<!-- solution -->
```c
void func_800c0620(GenericStack *stack, s32 idx) {
    u8 *end;
    u8 *src;
    u8 *dst;

    end = (u8 *)((u32)stack->data + stack->count * stack->elementSize);

    src = (u8 *)((u32)stack->data + (idx + 1) * stack->elementSize);
    dst = src - stack->elementSize;

    while (src < end) {
        bcopy(src, dst, stack->elementSize);

        src += stack->elementSize;
        dst += stack->elementSize;
    }

    stack->count -= 1;
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
    /*0C*/ void *data;
} GenericStack;

/* libultra's copy. Source FIRST, then destination — the reverse of memcpy. */
extern void bcopy(void *src, void *dst, s32 len);
```
