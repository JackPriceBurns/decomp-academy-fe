---
id: workflow-first-guided-match
title: Your First Guided Match
difficulty: 1
concepts:
  - workflow
  - arithmetic
  - idioms
symbol: scale
hints:
  - "`slwi r3,r3,2` shifts left by 2 bits, which multiplies by 4."
  - Write the intent — `x * 4` — not the shift. MWCC turns
    multiply-by-power-of-two into `slwi`.
  - Keep the parameter and return type as plain `int` — that's the type that
    produces this exact `slwi` here.
---

# Your first guided match

Let's run the loop for real on a tiny function. Here's the target asm:

```asm
<scale>:
   0:	54 63 10 3a 	slwi    r3,r3,2
   4:	4e 80 00 20 	blr
```

## Reasoning it out, the way a decomper would

**Read the asm.** Two instructions. `slwi r3,r3,2` is *shift left word
immediate* — it shifts `r3` left by 2 bits. Then `blr` returns. One argument
arrives in `r3`, and the result leaves in `r3`.

**What does shifting left by 2 do?** Shifting an integer left by 2 bits multiplies
it by 4 (each left shift doubles). So this function takes its argument and
returns it times 4.

**Now the key move — write plausible C, not asm.** A 2002 developer would *not*
write `x << 2` to mean "times four"; they'd write what they meant:

```c
return x * 4;
```

Won't that emit a multiply? No — and this is the whole point of letting the
compiler be the authority. MWCC knows that multiplying by a power of two is a
shift, so `x * 4` compiles to exactly `slwi r3,r3,2`. The clean, readable C
*is* the matching C. You don't have to obfuscate to match; you have to write what
the original author wrote and trust the compiler to lower it.

**Compile and diff.** If your two instructions are `slwi r3,r3,2` then `blr`,
you're at 100%. If not, the first diverging line tells you what to reconsider.

## Your task

Write `scale` so it compiles to the `slwi` above. Write the *meaning*, let MWCC
pick the instruction, and confirm you get a 100% match.

<!-- starter -->
```c
int scale(int x) {
    // return x times four -- write the meaning, let MWCC pick the idiom
    return 0;
}
```

<!-- solution -->
```c
int scale(int x) {
    return x * 4;
}
```
