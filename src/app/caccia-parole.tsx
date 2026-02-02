import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from "react-native";
import * as AC from "@bacons/apple-colors";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { categories, WordSearchCategory } from "@/data/word-search-data";
import { router } from "expo-router";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function CacciaParole() {
  const { width } = useWindowDimensions();
  const cardWidth = width > 600 ? (width - 60) / 2 : width - 40;

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
      <Animated.View entering={FadeIn.duration(400)}>
        <Text
          style={{
            fontSize: 17,
            lineHeight: 24,
            color: AC.secondaryLabel,
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          Scegli una categoria per iniziare
        </Text>
      </Animated.View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 16,
          justifyContent: width > 600 ? "flex-start" : "center",
        }}
      >
        {categories.map((category, index) => (
          <AnimatedPressable
            key={category.id}
            entering={FadeInDown.duration(400).delay(index * 50)}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push({
                pathname: "/caccia-parole-game",
                params: { categoryId: category.id },
              });
            }}
            style={({ pressed }) => ({
              width: cardWidth,
              backgroundColor: AC.secondarySystemGroupedBackground,
              borderRadius: 20,
              borderCurve: "continuous",
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
          >
            <View>
              <Text
                style={{
                  fontSize: 48,
                  marginBottom: 12,
                }}
              >
                {category.emoji}
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: AC.label,
                  marginBottom: 6,
                }}
              >
                {category.name}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  lineHeight: 20,
                  color: AC.secondaryLabel,
                  marginBottom: 12,
                }}
              >
                {category.description}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: AC.tertiaryLabel,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {category.words.length} parole • {category.gridSize}×
                {category.gridSize} griglia
              </Text>
            </View>
          </AnimatedPressable>
        ))}
      </View>
    </ScrollView>
  );
}
