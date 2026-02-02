import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  useWindowDimensions,
} from "react-native";
import * as AC from "@bacons/apple-colors";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeIn,
  ZoomIn,
  FlipInEasyX,
} from "react-native-reanimated";
import { getTodaysWord, isValidWord } from "@/data/wordle-data";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type LetterState = "correct" | "present" | "absent" | "empty";

interface Guess {
  word: string;
  states: LetterState[];
}

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

export default function Parole() {
  const [targetWord, setTargetWord] = useState("");
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">(
    "playing"
  );
  const [error, setError] = useState("");
  const { width } = useWindowDimensions();

  useEffect(() => {
    setTargetWord(getTodaysWord());
  }, []);

  const evaluateGuess = (guess: string): LetterState[] => {
    const states: LetterState[] = Array(WORD_LENGTH).fill("absent");
    const targetLetters = targetWord.split("");
    const guessLetters = guess.split("");

    // First pass: mark correct letters
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guessLetters[i] === targetLetters[i]) {
        states[i] = "correct";
        targetLetters[i] = "";
      }
    }

    // Second pass: mark present letters
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (states[i] === "correct") continue;

      const index = targetLetters.indexOf(guessLetters[i]);
      if (index !== -1) {
        states[i] = "present";
        targetLetters[index] = "";
      }
    }

    return states;
  };

  const submitGuess = () => {
    if (currentGuess.length !== WORD_LENGTH) {
      setError("La parola deve avere 5 lettere");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!isValidWord(currentGuess)) {
      setError("Parola non valida");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setError("");
    const states = evaluateGuess(currentGuess.toUpperCase());
    const newGuess = { word: currentGuess.toUpperCase(), states };
    const newGuesses = [...guesses, newGuess];
    setGuesses(newGuesses);
    setCurrentGuess("");

    if (currentGuess.toUpperCase() === targetWord) {
      setGameStatus("won");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameStatus("lost");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const resetGame = () => {
    setGuesses([]);
    setCurrentGuess("");
    setGameStatus("playing");
    setError("");
    setTargetWord(getTodaysWord());
  };

  const cellSize = Math.min((width - 80) / WORD_LENGTH, 70);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: process.env.EXPO_OS === "web" ? 100 : 20,
        paddingBottom: 40,
        alignItems: "center",
      }}
    >
      <Animated.View
        entering={FadeIn.duration(400)}
        style={{
          marginBottom: 24,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 40, marginBottom: 8 }}>🎯</Text>
        <Text
          style={{
            fontSize: 17,
            lineHeight: 24,
            color: AC.secondaryLabel,
            textAlign: "center",
            maxWidth: 400,
          }}
        >
          Indovina la parola italiana di 5 lettere in 6 tentativi
        </Text>
      </Animated.View>

      <View style={{ gap: 8, marginBottom: 24 }}>
        {Array.from({ length: MAX_GUESSES }).map((_, index) => {
          const guess = guesses[index];
          const isCurrentRow = index === guesses.length && gameStatus === "playing";

          return (
            <View key={index} style={{ flexDirection: "row", gap: 8 }}>
              {Array.from({ length: WORD_LENGTH }).map((_, letterIndex) => {
                const letter = guess?.word[letterIndex] || (isCurrentRow ? currentGuess[letterIndex] : "");
                const state = guess?.states[letterIndex] || "empty";

                const backgroundColor =
                  state === "correct"
                    ? AC.systemGreen
                    : state === "present"
                    ? AC.systemOrange
                    : state === "absent"
                    ? AC.systemGray
                    : AC.tertiarySystemGroupedBackground;

                return (
                  <Animated.View
                    key={letterIndex}
                    entering={guess ? FlipInEasyX.delay(letterIndex * 100) : undefined}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor,
                      borderRadius: 12,
                      borderCurve: "continuous",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: state === "empty" ? 2 : 0,
                      borderColor:
                        isCurrentRow && letter
                          ? AC.systemBlue
                          : AC.separator,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: cellSize * 0.5,
                        fontWeight: "700",
                        color:
                          state === "empty"
                            ? AC.label
                            : "#FFFFFF",
                      }}
                    >
                      {letter}
                    </Text>
                  </Animated.View>
                );
              })}
            </View>
          );
        })}
      </View>

      {error ? (
        <Animated.View
          entering={ZoomIn.duration(300)}
          style={{
            backgroundColor: AC.systemRed + "20",
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
            borderCurve: "continuous",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: AC.systemRed,
              textAlign: "center",
            }}
          >
            {error}
          </Text>
        </Animated.View>
      ) : null}

      {gameStatus === "playing" && (
        <View style={{ width: "100%", maxWidth: 400, gap: 12 }}>
          <TextInput
            value={currentGuess}
            onChangeText={(text) => {
              setCurrentGuess(text.toUpperCase().slice(0, WORD_LENGTH));
              setError("");
            }}
            maxLength={WORD_LENGTH}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="Scrivi qui..."
            placeholderTextColor={AC.placeholderText}
            onSubmitEditing={submitGuess}
            style={{
              backgroundColor: AC.secondarySystemGroupedBackground,
              borderRadius: 12,
              borderCurve: "continuous",
              paddingHorizontal: 20,
              paddingVertical: 16,
              fontSize: 17,
              color: AC.label,
              textAlign: "center",
              fontWeight: "600",
            }}
          />

          <Pressable
            onPress={submitGuess}
            style={({ pressed }) => ({
              backgroundColor: pressed
                ? AC.systemGreen + "E0"
                : AC.systemGreen,
              paddingVertical: 16,
              borderRadius: 12,
              borderCurve: "continuous",
              alignItems: "center",
            })}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "700",
                color: "#FFFFFF",
              }}
            >
              Invia
            </Text>
          </Pressable>
        </View>
      )}

      {gameStatus !== "playing" && (
        <Animated.View
          entering={FadeIn.duration(600).delay(300)}
          style={{
            marginTop: 8,
            backgroundColor:
              gameStatus === "won"
                ? AC.systemGreen + "20"
                : AC.systemRed + "20",
            borderRadius: 20,
            borderCurve: "continuous",
            padding: 24,
            alignItems: "center",
            width: "100%",
            maxWidth: 400,
          }}
        >
          <Text style={{ fontSize: 48, marginBottom: 12 }}>
            {gameStatus === "won" ? "🎉" : "😔"}
          </Text>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: gameStatus === "won" ? AC.systemGreen : AC.systemRed,
              marginBottom: 8,
            }}
          >
            {gameStatus === "won" ? "Bravissimo!" : "Peccato!"}
          </Text>
          <Text
            style={{
              fontSize: 17,
              color: AC.label,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            {gameStatus === "won"
              ? `Hai indovinato in ${guesses.length} ${
                  guesses.length === 1 ? "tentativo" : "tentativi"
                }!`
              : `La parola era: ${targetWord}`}
          </Text>

          <Pressable
            onPress={resetGame}
            style={({ pressed }) => ({
              backgroundColor: pressed
                ? AC.systemBlue + "E0"
                : AC.systemBlue,
              paddingHorizontal: 32,
              paddingVertical: 14,
              borderRadius: 12,
              borderCurve: "continuous",
              marginTop: 8,
            })}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "600",
                color: "#FFFFFF",
              }}
            >
              Nuova partita
            </Text>
          </Pressable>
        </Animated.View>
      )}

      <View
        style={{
          marginTop: 32,
          backgroundColor: AC.secondarySystemGroupedBackground,
          borderRadius: 16,
          borderCurve: "continuous",
          padding: 20,
          width: "100%",
          maxWidth: 400,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: AC.label,
            marginBottom: 12,
          }}
        >
          Come si gioca:
        </Text>
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <View
              style={{
                width: 28,
                height: 28,
                backgroundColor: AC.systemGreen,
                borderRadius: 6,
                borderCurve: "continuous",
              }}
            />
            <Text style={{ fontSize: 15, color: AC.secondaryLabel, flex: 1 }}>
              Lettera corretta e nella posizione giusta
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <View
              style={{
                width: 28,
                height: 28,
                backgroundColor: AC.systemOrange,
                borderRadius: 6,
                borderCurve: "continuous",
              }}
            />
            <Text style={{ fontSize: 15, color: AC.secondaryLabel, flex: 1 }}>
              Lettera presente ma nella posizione sbagliata
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <View
              style={{
                width: 28,
                height: 28,
                backgroundColor: AC.systemGray,
                borderRadius: 6,
                borderCurve: "continuous",
              }}
            />
            <Text style={{ fontSize: 15, color: AC.secondaryLabel, flex: 1 }}>
              Lettera non presente nella parola
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
