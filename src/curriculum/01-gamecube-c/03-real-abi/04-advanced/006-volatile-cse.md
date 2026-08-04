---
id: 642d1d73-4cbd-5ce0-acbb-5b40a9a0d61d
slug: advanced-volatile-cse
title: "Volatile Defeats CSE: Two Reads, Two Loads"
difficulty: 4
concepts:
  - volatile
  - cse
  - optimization
  - loads
symbol: func_8010b474
hints:
  - volatile forbids common-subexpression elimination, so each source read
    becomes its own load.
  - Expect two `lwz` of g_counter then `add r3, r3, r0` — a plain int would load
    once and do `add r3, r0, r0`.
---

# When the optimizer is forbidden to remember

At `-O4,p` MWCC is happy to fold repeated memory reads through CSE,
common-subexpression elimination. Load the same global twice with nothing writing
to it in between and the compiler loads it once, then reuses the value. Here's a
plain global `g_frame` added to itself:

```asm
lwz r0, g_frame@sda21(r2)   # ONE load...
add r3, r0, r0              # ...reused for both operands
blr
```

Now make `g_frame` `volatile` and everything you just saw goes backwards.
Because the standard treats each access to a `volatile` as observable behaviour,
the compiler isn't free to merge two reads into one, leave the value parked in a
register between uses, or slide the accesses around in the schedule. Reading the
variable twice in the source genuinely costs you two loads in the output.

```asm
lwz r3, g_frame@sda21(r2)   # first read
lwz r0, g_frame@sda21(r2)   # second read — not CSE'd
add r3, r3, r0
blr
```

Why does that matter for matching? Because a value that comes back from memory
more often than the arithmetic could possibly need, with nothing writing to it in
between, is about the most dependable sign of `volatile` you will ever get. When
your attempt collapses down to one load and the target stubbornly reloads, the
original was almost certainly `volatile`, and the same reasoning runs in the other
direction just as well. There's more to it than the load count, though, because
`volatile` also pins the instruction order that `,p` scheduling would otherwise be
free to rearrange, and that ordering guarantee is the whole reason hardware-
register code depends on it.

## Your task

Write `func_8010b474` using the provided `volatile int g_counter` to reproduce the
assembly above.

<!-- solution -->
```c
int func_8010b474(void) {
    return g_counter + g_counter;
}
```

<!-- context -->
```c
extern volatile int g_counter;
```
