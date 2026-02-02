import { useState, useCallback, useMemo } from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import * as AC from "@bacons/apple-colors";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";

interface Cell {
  letter: string;
  row: number;
  col: number;
}

interface FoundWord {
  word: string;
  cells: Cell[];
}

interface Props {
  grid: string[][];
  words: string[];
  onComplete: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function WordSearchGrid({ grid, words, onComplete }: Props) {
  const [selectedCells, setSelectedCells] = useState<Cell[]>([]);
  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { width } = useWindowDimensions();

  const gridSize = grid.length;
  const cellSize = Math.min((width - 80) / gridSize, 45);

  const isCellSelected = useCallback(
    (row: number, col: number) => {
      return selectedCells.some((cell) => cell.row === row && cell.col === col);
    },
    [selectedCells]
  );

  const isCellFound = useCallback(
    (row: number, col: number) => {
      return foundWords.some((fw) =>
        fw.cells.some((cell) => cell.row === row && cell.col === col)
      );
    },
    [foundWords]
  );

  const checkWord = useCallback(
    (cells: Cell[]) => {
      const word = cells.map((c) => c.letter).join("");
      const reverseWord = word.split("").reverse().join("");

      const foundWord = words.find(
        (w) => w === word || w === reverseWord
      );

      if (foundWord && !foundWords.some((fw) => fw.word === foundWord)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const newFoundWords = [...foundWords, { word: foundWord, cells }];
        setFoundWords(newFoundWords);

        if (newFoundWords.length === words.length) {
          setTimeout(onComplete, 500);
        }
        return true;
      }
      return false;
    },
    [words, foundWords, onComplete]
  );

  const handleCellPress = useCallback(
    (row: number, col: number, letter: string) => {
      if (isCellFound(row, col)) return;

      const newCell = { letter, row, col };
      const newSelected = [...selectedCells, newCell];
      setSelectedCells(newSelected);
      setIsDragging(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [selectedCells, isCellFound]
  );

  const handleCellHover = useCallback(
    (row: number, col: number, letter: string) => {
      if (!isDragging || isCellFound(row, col)) return;

      if (!isCellSelected(row, col)) {
        const newCell = { letter, row, col };
        setSelectedCells((prev) => [...prev, newCell]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [isDragging, isCellSelected, isCellFound]
  );

  const handleRelease = useCallback(() => {
    if (selectedCells.length > 0) {
      const isValid = checkWord(selectedCells);
      if (!isValid) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    setSelectedCells([]);
    setIsDragging(false);
  }, [selectedCells, checkWord]);

  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          backgroundColor: AC.secondarySystemGroupedBackground,
          borderRadius: 16,
          borderCurve: "continuous",
          padding: 12,
        }}
      >
        {grid.map((row, rowIndex) => (
          <View
            key={rowIndex}
            style={{ flexDirection: "row", gap: 4 }}
          >
            {row.map((letter, colIndex) => {
              const isSelected = isCellSelected(rowIndex, colIndex);
              const isFound = isCellFound(rowIndex, colIndex);

              return (
                <AnimatedPressable
                  key={`${rowIndex}-${colIndex}`}
                  onPressIn={() => handleCellPress(rowIndex, colIndex, letter)}
                  onPressOut={handleRelease}
                  onHoverIn={() => handleCellHover(rowIndex, colIndex, letter)}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isFound
                      ? AC.systemGreen + "40"
                      : isSelected
                      ? AC.systemBlue + "40"
                      : AC.tertiarySystemGroupedBackground,
                    borderRadius: 8,
                    borderCurve: "continuous",
                  }}
                >
                  <Text
                    style={{
                      fontSize: cellSize * 0.5,
                      fontWeight: isFound || isSelected ? "700" : "600",
                      color: isFound
                        ? AC.systemGreen
                        : isSelected
                        ? AC.systemBlue
                        : AC.label,
                    }}
                  >
                    {letter}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>
        ))}
      </View>

      <View
        style={{
          marginTop: 24,
          gap: 8,
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {words.map((word) => {
          const isFound = foundWords.some((fw) => fw.word === word);
          return (
            <View
              key={word}
              style={{
                backgroundColor: isFound
                  ? AC.systemGreen + "20"
                  : AC.tertiarySystemGroupedBackground,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 12,
                borderCurve: "continuous",
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: isFound ? AC.systemGreen : AC.secondaryLabel,
                  textDecorationLine: isFound ? "line-through" : "none",
                }}
              >
                {word}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
