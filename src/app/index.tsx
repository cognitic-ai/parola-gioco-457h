import { Link } from "expo-router";
import { ScrollView, View, Text, Pressable } from "react-native";
import * as AC from "@bacons/apple-colors";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Index() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: process.env.EXPO_OS === "web" ? 100 : 20,
        paddingBottom: 40,
        gap: 24,
      }}
    >
      <Animated.View entering={FadeIn.duration(600)}>
        <Text
          style={{
            fontSize: 17,
            lineHeight: 24,
            color: AC.secondaryLabel,
            textAlign: "center",
            paddingHorizontal: 20,
            marginBottom: 12,
          }}
        >
          Impara l'italiano giocando! Learn Italian through fun, engaging games
        </Text>
      </Animated.View>

      <Link href="/caccia-parole" asChild>
        <AnimatedPressable
          entering={FadeInDown.duration(600).delay(100)}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={({ pressed }) => ({
            backgroundColor: pressed
              ? AC.systemBlue + "20"
              : AC.systemBlue + "15",
            borderRadius: 24,
            borderCurve: "continuous",
            padding: 24,
            minHeight: 180,
            justifyContent: "space-between",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <View>
            <Text
              style={{
                fontSize: 48,
                marginBottom: 8,
              }}
            >
              🔍
            </Text>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: AC.label,
                marginBottom: 8,
              }}
            >
              Caccia Parole
            </Text>
            <Text
              style={{
                fontSize: 17,
                lineHeight: 24,
                color: AC.secondaryLabel,
              }}
            >
              Find hidden Italian words in themed puzzles. Perfect for building
              vocabulary!
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 12,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "600",
                color: AC.systemBlue,
              }}
            >
              Gioca ora
            </Text>
            <Text
              style={{
                fontSize: 20,
                color: AC.systemBlue,
                marginLeft: 4,
              }}
            >
              →
            </Text>
          </View>
        </AnimatedPressable>
      </Link>

      <Link href="/parole" asChild>
        <AnimatedPressable
          entering={FadeInDown.duration(600).delay(200)}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={({ pressed }) => ({
            backgroundColor: pressed
              ? AC.systemGreen + "20"
              : AC.systemGreen + "15",
            borderRadius: 24,
            borderCurve: "continuous",
            padding: 24,
            minHeight: 180,
            justifyContent: "space-between",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <View>
            <Text
              style={{
                fontSize: 48,
                marginBottom: 8,
              }}
            >
              🎯
            </Text>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: AC.label,
                marginBottom: 8,
              }}
            >
              Paro'le
            </Text>
            <Text
              style={{
                fontSize: 17,
                lineHeight: 24,
                color: AC.secondaryLabel,
              }}
            >
              Italian Wordle! Guess the 5-letter Italian word in 6 tries. A
              daily challenge awaits!
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 12,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "600",
                color: AC.systemGreen,
              }}
            >
              Gioca ora
            </Text>
            <Text
              style={{
                fontSize: 20,
                color: AC.systemGreen,
                marginLeft: 4,
              }}
            >
              →
            </Text>
          </View>
        </AnimatedPressable>
      </Link>

      <Animated.View
        entering={FadeInDown.duration(600).delay(300)}
        style={{
          backgroundColor: AC.secondarySystemGroupedBackground,
          borderRadius: 16,
          borderCurve: "continuous",
          padding: 20,
          marginTop: 8,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            lineHeight: 22,
            color: AC.secondaryLabel,
            textAlign: "center",
          }}
        >
          🇮🇹 Made with amore for Italian learners of all levels
        </Text>
      </Animated.View>
    </ScrollView>
  );
}
