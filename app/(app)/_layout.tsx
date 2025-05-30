// app/(app)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";

export default function AppTabsLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: "#007AFF",
        tabBarStyle: { paddingBottom: 5 },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            index: "home-outline",
            profile: "person-outline",
            settings: "settings-outline",
          };
          return (
            <Ionicons
              name={(icons[route.name] ?? "apps-outline") as React.ComponentProps<typeof Ionicons>["name"]}
              size={size}
              color={color}
            />
          );
        },
      })}
    />
  );
}
