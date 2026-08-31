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
  - "Three pointers before the loop — end from `count`, source from `idx + 1` (the `addiu` adding 1 to `a1` before the second `multu`), destination one element below source. Both products use the same `elementSize`."
  - "Inside the loop, `elementSize` is *reloaded* from the struct after the call before both pointers advance by it — the compiler can't trust memory across `bcopy`. Write the advances after the copy and IDO does the rest."
---

# Shuffling a hole shut

The generic stack (a sibling of the queue — its struct is in the context)
sometimes needs to remove an element from the *middle*: cancel one queued
effect, keep the rest in order. The shipped answer is honest brute force —
`bcopy` every element above the hole down one slot.

This is your first target with the full non-leaf loop apparatus: five saved
registers, a call per iteration, and pointer arithmetic done once up front.
Here's the skeleton on its own, in `flushRange` — walk a byte range, calling
out once per chunk:

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
30:  or    a1, s1, zero      #   (slot) second argument rides the jal
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

Every piece is a tier-3 lesson doing its job: loop values in `s`-registers
because `t`-registers die at each `jal`, the guard test cloned above the loop,
call arguments staged in delay slots, `sltu` because pointer comparisons are
unsigned.

The target stacks three wrinkles on top. The loop bounds are *computed*: an
end pointer from `count`, a source pointer from `idx + 1` — watch for an
`addiu` of 1 before one of the two `multu`s — and a destination trailing the
source by one element (`subu` right at the branch). The element size rides in
an `s`-register but is **re-read from the struct inside the loop** — after a
call, the compiler re-proves what memory holds, and your C must leave it the
freedom to do so by using the field, not a stashed local, for the advances.
And when the loop settles, `count` drops by one.

Label the three pointers on paper first. The C is shorter than the listing
wants you to believe.

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
