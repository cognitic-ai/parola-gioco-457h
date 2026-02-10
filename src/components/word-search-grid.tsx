import { useState, useCallback, useRef, useMemo } from "react";
import { View, Text, useWindowDimensions, LayoutChangeEvent } from "react-native";
import * as AC from "@bacons/apple-colors";
import * as Haptics from "expo-haptics";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

interface CellCoord {
  row: number;
  col: number;
}

interface FoundWord {
  word: string;
  cells: CellCoord[];
}

interface Props {
  grid: string[][];
  words: string[];
  onComplete: () => void;
}

const GAP = 4;
const PADDING = 12;

export function WordSearchGrid({ grid, words, onComplete }: Props) {
  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
  const [selectedCells, setSelectedCells] = useState<CellCoord[]>([]);
  const [flashState, setFlashState] = useState<"none" | "success" | "error">("none");
  const { width } = useWindowDimensions();
  const gridOriginRef = useRef({ x: 0, y: 0 });
  const shakeX = useSharedValue(0);

  const gridSize = grid.length;
  const cellSize = Math.min(
    (width - 40 - PADDING * 2 - GAP * (gridSize - 1)) / gridSize,
    44
  );
  const totalGridWidth = cellSize * gridSize + GAP * (gridSize - 1) + PADDING * 2;

  const foundCellSet = useMemo(() => {
    const s = new Set<string>();
    for (const fw of foundWords) {
      for (const c of fw.cells) s.add(`${c.row},${c.col}`);
    }
    return s;
  }, [foundWords]);

  const selectedCellSet = useMemo(() => {
    const s = new Set<string>();
    for (const c of selectedCells) s.add(`${c.row},${c.col}`);
    return s;
  }, [selectedCells]);

  // Convert touch position to grid cell
  const posToCell = (x: number, y: number): CellCoord | null => {
    const localX = x - PADDING;
    const localY = y - PADDING;
    const col = Math.floor((localX + GAP / 2) / (cellSize + GAP));
    const row = Math.floor((localY + GAP / 2) / (cellSize + GAP));
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return null;
    return { row, col };
  };

  // Given a start cell and a current cell, compute all cells along the
  // nearest valid line (horizontal, vertical, or diagonal).
  const computeLine = (
    start: CellCoord,
    end: CellCoord
  ): CellCoord[] => {
    const dr = end.row - start.row;
    const dc = end.col - start.col;

    if (dr === 0 && dc === 0) return [start];

    // Determine dominant direction
    const absDr = Math.abs(dr);
    const absDc = Math.abs(dc);

    let stepR: number, stepC: number, steps: number;
    if (absDr >= absDc * 1.5) {
      // Vertical
      stepR = dr > 0 ? 1 : -1;
      stepC = 0;
      steps = absDr;
    } else if (absDc >= absDr * 1.5) {
      // Horizontal
      stepR = 0;
      stepC = dc > 0 ? 1 : -1;
      steps = absDc;
    } else {
      // Diagonal
      stepR = dr > 0 ? 1 : -1;
      stepC = dc > 0 ? 1 : -1;
      steps = Math.max(absDr, absDc);
    }

    const cells: CellCoord[] = [];
    for (let i = 0; i <= steps; i++) {
      const r = start.row + stepR * i;
      const c = start.col + stepC * i;
      if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) break;
      cells.push({ row: r, col: c });
    }
    return cells;
  };

  const handleSelectionUpdate = useCallback(
    (cells: CellCoord[]) => {
      setSelectedCells(cells);
    },
    []
  );

  const handleSelectionEnd = useCallback(
    (cells: CellCoord[]) => {
      if (cells.length < 2) {
        setSelectedCells([]);
        return;
      }

      const word = cells.map((c) => grid[c.row][c.col]).join("");
      const reverseWord = word.split("").reverse().join("");

      const foundWord = words.find(
        (w) =>
          (w === word || w === reverseWord) &&
          !foundWords.some((fw) => fw.word === w)
      );

      if (foundWord) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setFlashState("success");
        const newFoundWords = [...foundWords, { word: foundWord, cells }];
        setFoundWords(newFoundWords);
        setTimeout(() => setFlashState("none"), 400);
        if (newFoundWords.length === words.length) {
          setTimeout(onComplete, 600);
        }
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setFlashState("error");
        // Shake animation
        shakeX.value = withSequence(
          withTiming(-8, { duration: 50 }),
          withTiming(8, { duration: 50 }),
          withTiming(-6, { duration: 50 }),
          withTiming(6, { duration: 50 }),
          withTiming(-3, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );
        setTimeout(() => setFlashState("none"), 400);
      }

      setSelectedCells([]);
    },
    [grid, words, foundWords, onComplete, shakeX]
  );

  // Track the start cell and last computed line with refs to avoid closure stale-ness in worklet callbacks
  const startCellRef = useRef<CellCoord | null>(null);
  const lastLineRef = useRef<CellCoord[]>([]);
  const lastHapticCountRef = useRef(0);

  const doHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const pan = Gesture.Pan()
    .onBegin((e) => {
      const cell = posToCell(e.x, e.y);
      if (cell) {
        startCellRef.current = cell;
        lastLineRef.current = [cell];
        lastHapticCountRef.current = 1;
        runOnJS(handleSelectionUpdate)([cell]);
        runOnJS(doHaptic)();
      }
    })
    .onUpdate((e) => {
      if (!startCellRef.current) return;
      const cell = posToCell(e.x, e.y);
      if (!cell) return;
      const line = computeLine(startCellRef.current, cell);
      // Only update if line changed
      if (
        line.length !== lastLineRef.current.length ||
        line.some(
          (c, i) =>
            c.row !== lastLineRef.current[i]?.row ||
            c.col !== lastLineRef.current[i]?.col
        )
      ) {
        lastLineRef.current = line;
        runOnJS(handleSelectionUpdate)(line);
        if (line.length !== lastHapticCountRef.current) {
          lastHapticCountRef.current = line.length;
          runOnJS(doHaptic)();
        }
      }
    })
    .onEnd(() => {
      const cells = lastLineRef.current;
      startCellRef.current = null;
      lastLineRef.current = [];
      lastHapticCountRef.current = 0;
      runOnJS(handleSelectionEnd)(cells);
    })
    .onFinalize(() => {
      startCellRef.current = null;
      lastLineRef.current = [];
      lastHapticCountRef.current = 0;
    })
    .minDistance(0)
    .shouldCancelWhenOutside(false);

  const gridShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  return (
    <View style={{ alignItems: "center" }}>
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            {
              backgroundColor:
                flashState === "success"
                  ? AC.systemGreen + "15"
                  : flashState === "error"
                  ? AC.systemRed + "15"
                  : AC.secondarySystemGroupedBackground,
              borderRadius: 16,
              borderCurve: "continuous",
              padding: PADDING,
              width: totalGridWidth,
            },
            gridShakeStyle,
          ]}
        >
          <View style={{ gap: GAP }}>
            {grid.map((row, rowIndex) => (
              <View key={rowIndex} style={{ flexDirection: "row", gap: GAP }}>
                {row.map((letter, colIndex) => {
                  const key = `${rowIndex},${colIndex}`;
                  const isSelected = selectedCellSet.has(key);
                  const isFound = foundCellSet.has(key);

                  return (
                    <View
                      key={key}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isFound
                          ? AC.systemGreen + "35"
                          : isSelected
                          ? AC.systemOrange + "40"
                          : AC.tertiarySystemGroupedBackground,
                        borderRadius: 8,
                        borderCurve: "continuous",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: cellSize * 0.48,
                          fontWeight: isFound || isSelected ? "800" : "600",
                          color: isFound
                            ? AC.systemGreen
                            : isSelected
                            ? AC.systemOrange
                            : AC.label,
                        }}
                      >
                        {letter}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Found counter */}
      <View
        style={{
          marginTop: 16,
          backgroundColor: AC.secondarySystemGroupedBackground,
          borderRadius: 10,
          borderCurve: "continuous",
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: AC.secondaryLabel,
            fontVariant: ["tabular-nums"],
          }}
        >
          {foundWords.length} / {words.length} parole trovate
        </Text>
      </View>

      {/* Word list */}
      <View
        style={{
          marginTop: 16,
          gap: 8,
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          paddingHorizontal: 8,
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
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 10,
                borderCurve: "continuous",
              }}
            >
              <Text
                selectable
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
