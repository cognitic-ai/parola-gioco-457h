import { ThemeProvider } from "@/components/theme-provider";
import Stack from "expo-router/stack";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import * as AC from "@bacons/apple-colors";

const AppleStackPreset: NativeStackNavigationOptions =
  process.env.EXPO_OS !== "ios"
    ? {}
    : isLiquidGlassAvailable()
    ? {
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: {
          backgroundColor: "transparent",
        },
        headerTitleStyle: {
          color: AC.label as any,
        },
        headerBlurEffect: "none",
        headerBackButtonDisplayMode: "minimal",
      }
    : {
        headerTransparent: true,
        headerShadowVisible: true,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: {
          backgroundColor: "transparent",
        },
        headerBlurEffect: "systemChromeMaterial",
        headerBackButtonDisplayMode: "default",
      };

export default function Layout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={AppleStackPreset}>
        <Stack.Screen
          name="index"
          options={{
            title: "Giochi Italiani",
            headerLargeTitle: true,
          }}
        />
        <Stack.Screen
          name="caccia-parole"
          options={{
            title: "Caccia Parole",
            headerLargeTitle: false,
          }}
        />
        <Stack.Screen
          name="parole"
          options={{
            title: "Paro'le",
            headerLargeTitle: false,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
