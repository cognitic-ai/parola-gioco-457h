import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import * as AC from "@bacons/apple-colors";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { categories } from "@/data/word-search-data";
import { generateWordSearch } from "@/utils/word-search-generator";
import { WordSearchGrid } from "@/components/word-search-grid";
import Animated, { FadeIn } from "react-native-reanimated";

export default function CacciaParoleGame() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const [grid, setGrid] = useState<string[][] | null>(null);
  const [showComplete, setShowComplete] = useState(false);

  const category = categories.find((c) => c.id === categoryId);

  useEffect(() => {
    if (category) {
      const newGrid = generateWordSearch(category.words, category.gridSize);
      setGrid(newGrid);
    }
  }, [categoryId]);

  if (!category) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: AC.label, fontSize: 17 }}>
          Categoria non trovata
        </Text>
      </View>
    );
  }

  if (!grid) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={AC.systemBlue} />
        <Text
          style={{
            marginTop: 16,
            fontSize: 17,
            color: AC.secondaryLabel,
          }}
        >
          Creazione puzzle...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: process.env.EXPO_OS === "web" ? 100 : 20,
        paddingBottom: 40,
      }}
    >
      <Animated.View
        entering={FadeIn.duration(400)}
        style={{
          backgroundColor: AC.secondarySystemGroupedBackground,
          borderRadius: 16,
          borderCurve: "continuous",
          padding: 16,
          marginBottom: 20,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Text style={{ fontSize: 36 }}>{category.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: AC.label,
              marginBottom: 2,
            }}
          >
            {category.name}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: AC.secondaryLabel,
            }}
          >
            Swipe across letters to find words
          </Text>
        </View>
      </Animated.View>

      <WordSearchGrid
        grid={grid}
        words={category.words}
        onComplete={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setShowComplete(true);
        }}
      />

      {showComplete && (
        <Animated.View
          entering={FadeIn.duration(600)}
          style={{
            marginTop: 24,
            backgroundColor: AC.systemGreen + "20",
            borderRadius: 20,
            borderCurve: "continuous",
            padding: 24,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🎉</Text>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: AC.systemGreen,
              marginBottom: 8,
            }}
          >
            Complimenti!
          </Text>
          <Text
            style={{
              fontSize: 17,
              color: AC.label,
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Hai trovato tutte le parole!
          </Text>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowComplete(false);
                const newGrid = generateWordSearch(
                  category.words,
                  category.gridSize
                );
                setGrid(newGrid);
              }}
              style={({ pressed }) => ({
                backgroundColor: pressed
                  ? AC.systemBlue + "E0"
                  : AC.systemBlue,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 12,
                borderCurve: "continuous",
              })}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "600",
                  color: "#FFFFFF",
                }}
              >
                Gioca ancora
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              style={({ pressed }) => ({
                backgroundColor: pressed
                  ? AC.tertiarySystemGroupedBackground
                  : AC.secondarySystemGroupedBackground,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 12,
                borderCurve: "continuous",
              })}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "600",
                  color: AC.label,
                }}
              >
                Categorie
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      )}
    </ScrollView>
  );
}
