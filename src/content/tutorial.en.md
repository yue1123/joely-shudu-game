# How to Play Sudoku

## 🎯 Game Objective

Fill the 9×9 grid with digits 1–9 so that:

- **Each row** contains 1–9 exactly once
- **Each column** contains 1–9 exactly once
- **Each 3×3 box** contains 1–9 exactly once

## 🎮 Basic Controls

### Keyboard Controls
- **Arrow Keys / WASD** - Move selection
- **1-9 Number Keys** - Fill in digit
- **Delete / Backspace / 0** - Clear current cell
- **N Key** - Toggle notes mode
- **Z Key** - Undo last action
- **H Key** - Get hint
- **Space Key** - Pause/Resume game

### Mouse Controls
- **Click empty cell** - Select cell
- **Click number (1–9)** - Fill digit or highlight same digits
- **Click "Clear"** - Erase selected cell
- **Click "Notes"** - Toggle notes mode to add candidate digits
- **Click "Hint"** - Reveal correct answer (counts as hint)
- **Click "Undo"** - Go back one step

## 💡 Solving Techniques

### 1️⃣ Naked Single

**Principle**: If a cell has only one possible digit, fill it directly.

**Example**:
```
Row 1 has: 1 2 3 4 5 6 7 8 _
          ↑ Last cell must be 9
```

**Tips**:
- Prioritize rows/columns/boxes with 8 digits
- Use notes to track candidate digits
- Fill immediately when only one candidate remains

### 2️⃣ Hidden Single

**Principle**: In a row/column/box, if a digit can only go in one position.

**Example**:
```
In a 3×3 box:
┌─────┬─────┬─────┐
│ 1 2 │ _ 4 │ 5 6 │  Row 1
├─────┼─────┼─────┤
│ 3 _ │ _ _ │ 7 8 │  Row 2
├─────┼─────┼─────┤
│ _ _ │ _ _ │ 9 _ │  Row 3
└─────┴─────┴─────┘

Box has: 1 2 3 4 5 6 7 8 9, missing "9"
Rows 1 & 2 already have 9, so 9 must be in Row 3
Column 3 already has 9, so 9 can only be at (3,5)
```

### 3️⃣ Box/Line Reduction

**Principle**: Use box-row/column intersections to eliminate candidates.

**Example**:
```
If digit 7 in Box 1 can only be in Row 1,
eliminate 7 from Row 1 in other boxes
```

### 4️⃣ Naked Pair

**Principle**: Two cells with same two candidates eliminate those digits from other cells in the row/column/box.

**Example**:
```
In a row:
Cell A candidates: [3, 7]
Cell B candidates: [3, 7]

→ 3 and 7 must occupy A & B
→ Other cells in row cannot be 3 or 7
```

### 5️⃣ Chain Reasoning

**Principle**: Use "if A, then B, then C, then not D..." logic chains to find contradictions or answers.

**Use Cases**:
- Hard difficulty puzzles
- When basic techniques don't work
- Hypothetical testing scenarios

## 🎯 Advanced Strategies

### 🔍 Observation Priority

1. **Check boxes first** - 3×3 boxes have strongest constraints
2. **Then rows/columns** - Look for nearly complete rows/columns
3. **Track key digits** - Process digits that appear frequently

### 📝 Using Notes System

- Mark all possible candidate digits (1-9) in empty cells
- Update candidates immediately after filling any digit
- When a cell has only one candidate left, that's the answer!

### ⚡ Speed Tips

1. **Memorize box positions** - Quickly identify which box a cell belongs to
2. **Multi-focus** - Observe multiple areas simultaneously
3. **Digit by digit** - Fill all 1s first, then all 2s, etc.
4. **Easy first** - Start simple, hard parts become easier as you progress

## ⚠️ Common Mistakes

❌ **Guessing hastily** - Wrong guesses waste time and count as errors  
✅ **Logical deduction** - Every move should have reasoning

❌ **Skipping notes** - Memory alone is error-prone  
✅ **Use notes** - Track candidates with small digits

❌ **Tunnel vision** - Staring at one spot when stuck  
✅ **Change perspective** - Look at other areas for breakthroughs

## 🏆 Difficulty Levels

- **Easy** - Beginner-friendly, many naked singles
- **Medium** - Requires hidden singles and box/line reduction
- **Hard** - Needs pairs, chains, and advanced techniques

## 🎁 Tips

- 💾 Game auto-saves progress, quit anytime
- 🔊 Toggle sound effects in top-right corner
- 🌓 Switch between light/dark themes
- ⏱️ No time pressure, think carefully
- 🎯 Game ends after 3 errors, play cautiously

Have fun! 🎉
