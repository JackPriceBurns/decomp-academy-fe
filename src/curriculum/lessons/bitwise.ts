import { LessonSource } from "@/lib/lessons/types";

export const bitwise: LessonSource[] = [
  {
    id: "bitwise-and-mask",
    chapter: "bitwise",
    order: 1,
    title: "Masking Bits With AND",
    difficulty: 1,
    concepts: ["bitwise", "and", "masks"],
    brief: `
# Keeping only the bits you want

A bitwise **AND** against a constant *mask* keeps the bits that are set in the
mask and clears the rest. When the mask has scattered (non-contiguous) bits,
MWCC reaches for the immediate-AND instruction **\`andi.\`**:

\`\`\`asm
andi.  r3, r3, 18    # r3 = x & 0x12
blr
\`\`\`

Two things to notice. First, \`andi.\` takes a 16-bit immediate, so it can only
mask the low half-word directly. Second, the trailing **dot** means it also
updates condition register \`cr0\` as a side effect — MWCC uses \`andi.\` even when
nobody reads the flags, simply because it's the only immediate AND PowerPC has.

(Watch out: a *contiguous* mask like \`0xF0\` takes a different path — covered in
"Testing Whether a Bit Is Set". For now we use \`0x12\`, whose bits don't form a
run.)

## Your task

Write \`mask_bits\` to match the target.
`,
    symbol: "mask_bits",
    starter: `u32 mask_bits(u32 x) {
    return 0;
}
`,
    solution: `u32 mask_bits(u32 x) {
    return x & 0x12;
}
`,
    hints: [
      "AND against a small constant mask uses the immediate form.",
      "`x & 0x12` compiles to `andi. r3, r3, 18` (0x12 == 18).",
      "The dot on `andi.` is just a flag side effect; ignore it.",
    ],
  },
  {
    id: "bitwise-or",
    chapter: "bitwise",
    order: 2,
    title: "Combining Bits With OR",
    difficulty: 1,
    concepts: ["bitwise", "or", "immediates"],
    brief: `
# Forcing bits on

A bitwise **OR** turns bits *on*: every bit set in the mask becomes set in the
result, and the others pass through untouched. MWCC emits the immediate form
**\`ori\`**:

\`\`\`asm
ori  r3, r3, 18    # r3 = x | 0x12
blr
\`\`\`

Unlike \`andi.\`, plain \`ori\` has **no dot** and never touches the condition
register. Notice OR doesn't care whether the mask bits are contiguous: \`ori\`
handles any 16-bit pattern, so you won't see the rotate tricks that AND
sometimes triggers.

One limit to keep in mind: \`ori\` only carries a 16-bit immediate. A constant
wider than 16 bits (say \`x | 0x12345\`) splits into two instructions — \`oris\`
for the high half-word, then \`ori\` for the low — so don't be surprised to see a
pair when the mask outgrows the bottom 16 bits.

## Your task

Write \`set_bits\` to match the target.
`,
    symbol: "set_bits",
    starter: `u32 set_bits(u32 x) {
    return 0;
}
`,
    solution: `u32 set_bits(u32 x) {
    return x | 0x12;
}
`,
    hints: [
      "OR against a constant uses the immediate form `ori`.",
      "`x | 0x12` compiles to `ori r3, r3, 18`.",
    ],
  },
  {
    id: "bitwise-xor",
    chapter: "bitwise",
    order: 3,
    title: "Flipping Bits With XOR",
    difficulty: 1,
    concepts: ["bitwise", "xor", "immediates"],
    brief: `
# Toggling bits

A bitwise **XOR** *flips* every bit that is set in the mask: a 1 in the mask
inverts the corresponding bit of the value, a 0 leaves it alone. The immediate
instruction is **\`xori\`**:

\`\`\`asm
xori  r3, r3, 64    # r3 = x ^ 0x40
blr
\`\`\`

XOR is the bit-twiddler's toggle switch: applying the same mask twice returns
the original value. Like \`ori\`, \`xori\` carries no dot and leaves the condition
register alone.

## Your task

Write \`toggle_bit\` to match the target.
`,
    symbol: "toggle_bit",
    starter: `u32 toggle_bit(u32 x) {
    return 0;
}
`,
    solution: `u32 toggle_bit(u32 x) {
    return x ^ 0x40;
}
`,
    hints: [
      "XOR against a constant uses the immediate form `xori`.",
      "`x ^ 0x40` compiles to `xori r3, r3, 64` (0x40 == 64).",
    ],
  },
  {
    id: "bitwise-set-flag",
    chapter: "bitwise",
    order: 4,
    title: "Setting a Single Flag Bit",
    difficulty: 2,
    concepts: ["bitwise", "or", "flags"],
    brief: `
# The \`|=\` idiom for flags

Game code is full of flag words where each bit means something — *visible*,
*active*, *dirty*. To **set** one flag you OR in a single-bit mask, usually
written with the compound assignment \`x |= mask\`:

\`\`\`asm
ori  r3, r3, 64    # x |= 0x40
blr
\`\`\`

Because \`0x40\` is a single bit inside the low 16, this collapses to one \`ori\`.
The whole point of \`|=\` is that it preserves every *other* flag — only the named
bit changes. Seeing a lone \`ori\` with a power-of-two immediate is a strong tell
that the original C was \`flags |= SOME_FLAG;\`.

## Your task

Write \`set_flag\` so it compiles to the \`ori\` above.
`,
    symbol: "set_flag",
    starter: `u32 set_flag(u32 x) {
    return 0;
}
`,
    solution: `u32 set_flag(u32 x) {
    x |= 0x40;
    return x;
}
`,
    hints: [
      "Setting a flag means OR-ing in its bit and keeping the rest.",
      "`x |= 0x40` is the same as `x = x | 0x40` → one `ori`.",
      "0x40 is a single bit (bit 6), so a power-of-two immediate appears.",
      "In real code a lone `ori` with a power-of-two immediate usually means the source used a named constant (`#define SOME_FLAG 0x40`); writing the constant compiles identically.",
    ],
  },
  {
    id: "bitwise-clear-flag",
    chapter: "bitwise",
    order: 5,
    title: "Clearing a Bit: The rlwinm Surprise",
    difficulty: 2,
    concepts: ["bitwise", "and", "rlwinm", "mwcc-idiom"],
    brief: `
# Why clearing a bit is *not* an \`andi.\`

To **clear** a single flag you AND with the *inverse* mask. The natural C is
\`x &= ~0x80\`. You might expect an \`andi.\` like the earlier AND lesson — but watch
what actually comes out:

\`\`\`asm
rlwinm  r3, r3, 0, 25, 23    # x & ~0x80
blr
\`\`\`

That's **\`rlwinm\`** (rotate-left-word-immediate-then-AND-with-mask), *not*
\`andi.\`. The reason is decisive: \`~0x80\` is \`0xFFFFFF7F\`, a 32-bit constant.
\`andi.\` only has a **16-bit** immediate and could never express the high bits, so
MWCC uses \`rlwinm\` with a rotate of 0 and a mask that spans everything except the
one bit being cleared. To derive that mask yourself: \`~0x80\` is \`0xFFFFFF7F\`, so
the only cleared bit is the one in \`0x80\`. PowerPC numbers bits from the MSB
(bit 0 = \`0x80000000\`, bit 31 = \`0x1\`), which puts \`0x80\` at **bit 24**. The mask
\`[MB,ME] = [25,23]\` therefore *wraps around* the word, covering bits 25-31 and
0-23 — everything except bit 24.

**This is a key MWCC idiom.** Write \`x &= ~0x80\` and you get \`rlwinm\`. If you had
instead written \`x &= 0xFF7F\`, you'd get an \`andi.\` — but note that isn't a
stylistic alternative: \`0xFF7F\` is \`0x0000FF7F\`, which also zeroes every bit above
bit 15, unlike \`~0x80\` (\`0xFFFFFF7F\`). So it's both the wrong instruction *and* the
wrong result — the source you write decides the instruction.

## Your task

Write \`clear_flag\` so it compiles to the \`rlwinm\` above.
`,
    symbol: "clear_flag",
    starter: `u32 clear_flag(u32 x) {
    return 0;
}
`,
    solution: `u32 clear_flag(u32 x) {
    x &= ~0x80;
    return x;
}
`,
    hints: [
      "Clearing a bit ANDs with the complement: `x &= ~0x80`.",
      "`~0x80` is a full 32-bit constant, too wide for `andi.` — expect `rlwinm`.",
      "Avoid `x &= 0xFF7F` here — it produces `andi.`, which won't match the target.",
    ],
  },
  {
    id: "bitwise-test-bit",
    chapter: "bitwise",
    order: 6,
    title: "Testing Whether a Bit Is Set",
    difficulty: 2,
    concepts: ["bitwise", "and", "rlwinm", "masks"],
    brief: `
# Isolating one bit

To **test** a flag you AND the value with that single bit and return the result
(zero if clear, the bit's value if set). The mask \`0x80\` is a single contiguous
bit, and MWCC isolates it with a single **\`rlwinm\`**:

\`\`\`asm
rlwinm  r3, r3, 0, 24, 24    # x & 0x80
blr
\`\`\`

Here the rotate is again 0 and the mask is exactly **one** bit wide: \`[24,24]\`
selects bit 24, which is \`0x80\`. (PPC counts bits from the MSB: bit 0 is
\`0x80000000\`, bit 24 is \`0x80\`, bit 31 is \`0x1\` — so the value \`0x80\` lands at
bit number 24.) This is the mirror image of the AND-mask lesson — a *contiguous*
mask (even a one-bit one) goes through \`rlwinm\`, while a *scattered* mask like
\`0x12\` went through \`andi.\`. Contiguity, not size, is what steers AND between the
two instructions.

## Your task

Write \`test_bit\` to reproduce the assembly above.
`,
    symbol: "test_bit",
    starter: `u32 test_bit(u32 x) {
    return 0;
}
`,
    solution: `u32 test_bit(u32 x) {
    return x & 0x80;
}
`,
    hints: [
      "Isolate the bit by AND-ing with its single-bit mask.",
      "A contiguous one-bit mask like 0x80 compiles to `rlwinm`, not `andi.`.",
      "Expect `rlwinm r3, r3, 0, 24, 24` — mask `[24,24]` is exactly bit 0x80.",
    ],
  },
  {
    id: "bitwise-shift-left",
    chapter: "bitwise",
    order: 7,
    title: "Shifting Left by a Constant",
    difficulty: 2,
    concepts: ["bitwise", "shifts", "rlwinm"],
    brief: `
# \`slwi\` — shift left, fill with zeros

Shifting left by a constant moves bits toward the high end and pads the low end
with zeros. PowerPC has no dedicated immediate left-shift; instead MWCC uses
\`rlwinm\` and the assembler prints the friendly **\`slwi\`** extended mnemonic:

\`\`\`asm
slwi  r3, r3, 4    # x << 4
blr
\`\`\`

Under the hood \`slwi r3, r3, 4\` *is* \`rlwinm r3, r3, 4, 0, 27\` — rotate left by 4
and keep the top 28 bits. You don't have to decode that by hand; recognizing the
\`slwi\` mnemonic as "left shift by a constant" is enough. (As a mental check,
\`x << n\` equals \`x * 2^n\` arithmetically — and because MWCC strength-reduces a
power-of-two multiply, \`x * 16\` and \`x << 4\` compile to the *same* \`slwi\`. Write
whichever matches the original's intent.)

## Your task

Write \`shl4\` so it compiles to the \`slwi\` above.
`,
    symbol: "shl4",
    starter: `u32 shl4(u32 x) {
    return 0;
}
`,
    solution: `u32 shl4(u32 x) {
    return x << 4;
}
`,
    hints: [
      "A constant left shift is the `slwi` extended mnemonic.",
      "`x << 4` compiles to `slwi r3, r3, 4`.",
    ],
  },
  {
    id: "bitwise-shift-right-unsigned",
    chapter: "bitwise",
    order: 8,
    title: "Logical Right Shift (Unsigned)",
    difficulty: 3,
    concepts: ["bitwise", "shifts", "unsigned", "srwi"],
    brief: `
# \`srwi\` — shift right, fill with zeros

Right-shifting an **unsigned** value is a *logical* shift: bits move toward the
low end and the high end is filled with zeros. MWCC emits \`rlwinm\`, printed as
the extended mnemonic **\`srwi\`**:

\`\`\`asm
srwi  r3, r3, 3    # (u32)x >> 3
blr
\`\`\`

The **type drives this**. Because \`x\` is \`u32\`, the compiler knows the top bits
must come in as zero, so a plain masked rotate suffices — \`srwi r3, r3, 3\` is
really \`rlwinm r3, r3, 29, 3, 31\`. If \`x\` were signed, the high bits would
instead be filled with the sign bit, which needs a *different* instruction
entirely (the next lesson).

## Your task

Write \`lsr3\` so it compiles to the \`srwi\` above.
`,
    symbol: "lsr3",
    starter: `u32 lsr3(u32 x) {
    return 0;
}
`,
    solution: `u32 lsr3(u32 x) {
    return x >> 3;
}
`,
    hints: [
      "An unsigned right shift fills with zeros — the `srwi` mnemonic.",
      "`x >> 3` on a u32 compiles to `srwi r3, r3, 3`.",
      "Keep the type `u32`; a signed type would change the instruction.",
    ],
  },
  {
    id: "bitwise-shift-right-signed",
    chapter: "bitwise",
    order: 9,
    title: "Arithmetic Right Shift (Signed)",
    difficulty: 3,
    concepts: ["bitwise", "shifts", "signed", "srawi"],
    brief: `
# \`srawi\` — shift right, fill with the sign

Right-shifting a **signed** value is an *arithmetic* shift: the vacated high bits
are filled with copies of the sign bit, so a negative number stays negative. This
needs a dedicated instruction, **\`srawi\`** (shift right algebraic word
immediate):

\`\`\`asm
srawi  r3, r3, 3    # (s32)x >> 3
blr
\`\`\`

Notice this is a *real* opcode, not an \`rlwinm\` mnemonic — sign extension can't be
done with a rotate-and-mask. The signed/unsigned distinction is invisible in the
C operator (\`>>\` either way) and decided **entirely by the operand's type**:
\`srwi\` for \`u32\`, \`srawi\` for \`s32\`. (When the shift *amount* is a variable
instead of a constant, you get the register-form \`sraw\`/\`srw\`/\`slw\` — the next
lesson.)

## Your task

Write \`asr3\` so it compiles to the \`srawi\` above.
`,
    symbol: "asr3",
    starter: `s32 asr3(s32 x) {
    return 0;
}
`,
    solution: `s32 asr3(s32 x) {
    return x >> 3;
}
`,
    hints: [
      "A signed right shift preserves the sign — use the algebraic shift.",
      "`x >> 3` on an s32 compiles to `srawi r3, r3, 3`.",
      "The type, not the operator, picks `srawi` over `srwi`.",
    ],
  },
  {
    id: "bitwise-shift-variable",
    chapter: "bitwise",
    order: 9.5,
    title: "Shifting by a Variable Amount",
    difficulty: 3,
    concepts: ["bitwise", "shifts", "variable-shift", "slw"],
    brief: `
# When the shift count is a register

Every shift so far used a *constant* amount, which let MWCC fold it into an
\`rlwinm\` (\`slwi\`/\`srwi\`) or an \`srawi\`. When the amount is a **runtime value**,
there's nothing to fold — PowerPC has dedicated register-shift opcodes that take
the count in a second register:

\`\`\`asm
slw  r3, r3, r4    # x << n, shift amount in r4
blr
\`\`\`

The family mirrors the constant case by sign: **\`slw\`** (shift left), **\`srw\`**
(shift right, logical — for unsigned), and **\`sraw\`** (shift right algebraic —
for signed). Same signed/unsigned rule as before; the only difference is the
count lives in a register instead of the instruction. Seeing \`slw\`/\`srw\`/\`sraw\`
(no trailing \`i\`) tells you the shift distance was a variable in the original C.

## Your task

Write \`shl_var\` to match the target.
`,
    symbol: "shl_var",
    starter: `int shl_var(int x, int n) {
    return 0;
}
`,
    solution: `int shl_var(int x, int n) {
    return x << n;
}
`,
    hints: [
      "A runtime shift amount can't fold into `rlwinm` — it uses the register-form shift.",
      "`x << n` with `n` in a register compiles to `slw r3, r3, r4`.",
    ],
  },
  {
    id: "bitwise-extract-field",
    chapter: "bitwise",
    order: 10,
    title: "Extracting a Bitfield in One rlwinm",
    difficulty: 4,
    concepts: ["bitwise", "rlwinm", "bitfields", "instruction-selection"],
    brief: `
# Shift *and* mask, fused into a single instruction

Extracting a packed field means shifting it down to bit 0 and masking off the
neighbours: \`(x >> 4) & 0xF\` pulls out the 4-bit nibble sitting at bits 4-7. In C
that reads like two operations, but \`rlwinm\` does **rotate and mask together**, so
MWCC fuses the whole thing into one instruction:

\`\`\`asm
rlwinm  r3, r3, 28, 28, 31    # (x >> 4) & 0xF
blr
\`\`\`

Read the operands: rotate left by **28** (which is the same as rotating *right* by
4, moving bits 4-7 down to bits 0-3). Concretely, \`0x000000F0\` rotated left by 28
becomes \`0x0000000F\` — the nibble at bits 4-7 lands at bits 0-3. Then keep mask
\`[28,31]\` — the bottom 4 bits. One \`rlwinm\` expresses the entire \`>>\`-then-\`&\`
field extract. This is one of the most useful \`rlwinm\` patterns to recognize:
whenever you see a rotate amount paired with a low-bit mask, read it back as
\`(x >> shift) & ((1 << width) - 1)\`.

## Your task

Write \`extract_nibble\` to reproduce the assembly above.
`,
    symbol: "extract_nibble",
    starter: `u32 extract_nibble(u32 x) {
    return 0;
}
`,
    solution: `u32 extract_nibble(u32 x) {
    return (x >> 4) & 0xF;
}
`,
    hints: [
      "Shift the field down, then mask off the unwanted high bits.",
      "`rlwinm` fuses the shift and the mask into one instruction.",
      "Expect `rlwinm r3, r3, 28, 28, 31`: rotate-left-28 (= right-4), keep low 4 bits.",
    ],
  },
];
