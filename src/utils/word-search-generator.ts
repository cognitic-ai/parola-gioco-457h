interface Position {
  row: number;
  col: number;
}

interface Direction {
  dr: number;
  dc: number;
}

const DIRECTIONS: Direction[] = [
  { dr: 0, dc: 1 }, // right
  { dr: 1, dc: 0 }, // down
  { dr: 1, dc: 1 }, // diagonal down-right
  { dr: -1, dc: 1 }, // diagonal up-right
  { dr: 0, dc: -1 }, // left
  { dr: -1, dc: 0 }, // up
  { dr: -1, dc: -1 }, // diagonal up-left
  { dr: 1, dc: -1 }, // diagonal down-left
];

export function generateWordSearch(
  words: string[],
  gridSize: number
): string[][] {
  // Initialize empty grid
  const grid: string[][] = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(""));

  // Sort words by length (longest first) for better placement
  const sortedWords = [...words].sort((a, b) => b.length - a.length);

  // Try to place each word
  for (const word of sortedWords) {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!placed && attempts < maxAttempts) {
      const direction =
        DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const startRow = Math.floor(Math.random() * gridSize);
      const startCol = Math.floor(Math.random() * gridSize);

      if (
        canPlaceWord(grid, word, startRow, startCol, direction, gridSize)
      ) {
        placeWord(grid, word, startRow, startCol, direction);
        placed = true;
      }
      attempts++;
    }
  }

  // Fill empty cells with random letters
  const letters = "ABCDEFGHILMNOPQRSTUVZ"; // Italian alphabet
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] === "") {
        grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }

  return grid;
}

function canPlaceWord(
  grid: string[][],
  word: string,
  startRow: number,
  startCol: number,
  direction: Direction,
  gridSize: number
): boolean {
  const { dr, dc } = direction;

  // Check if word fits in grid
  const endRow = startRow + dr * (word.length - 1);
  const endCol = startCol + dc * (word.length - 1);

  if (
    endRow < 0 ||
    endRow >= gridSize ||
    endCol < 0 ||
    endCol >= gridSize
  ) {
    return false;
  }

  // Check if cells are empty or match the word
  for (let i = 0; i < word.length; i++) {
    const row = startRow + dr * i;
    const col = startCol + dc * i;
    const cell = grid[row][col];

    if (cell !== "" && cell !== word[i]) {
      return false;
    }
  }

  return true;
}

function placeWord(
  grid: string[][],
  word: string,
  startRow: number,
  startCol: number,
  direction: Direction
): void {
  const { dr, dc } = direction;

  for (let i = 0; i < word.length; i++) {
    const row = startRow + dr * i;
    const col = startCol + dc * i;
    grid[row][col] = word[i];
  }
}
