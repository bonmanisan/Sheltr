import { useAuth, useOAuth } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { router } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Colors from './../../constants/Colors';

WebBrowser.maybeCompleteAuthSession();

export const useWarmupBrowser = () => {
  useEffect(() => {
    WebBrowser.warmUpAsync();
    return () => WebBrowser.coolDownAsync();
  }, []);
};

export default function LoginScreen() {
  useWarmupBrowser();

  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { isSignedIn } = useAuth();

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      router.replace("/(tabs)/home");
    }
  }, [isSignedIn]);

  const onPress = useCallback(async () => {
    try {
      // Make sure your scheme matches what you set in app.json and Clerk
      const redirectUrl = Linking.createURL("/", { scheme: "sheltr" });

      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl,
      });

      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)/home");
      }
    } catch (err) {
      console.error('OAuth error:', err);
    }
  }, [startOAuthFlow]);

  return (
    <View style={{ backgroundColor: Colors.WHITE, height: '100%' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Image
          source={require('./../../assets/images/login1.png')}
          style={{ width: '80%', height: 500 }}
          resizeMode="contain"
        />
      </View>

      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ fontSize: 30, textAlign: 'center' }}>
          Ready to make a new Friend?
        </Text>

        <Text style={{ fontSize: 18, textAlign: 'center', color: Colors.GRAY }}>
          Adopt a pet that you like
        </Text>

        <Pressable
          onPress={onPress}
          style={{
            padding: 14,
            marginTop: 50,
            backgroundColor: Colors.PRIMARY,
            width: '100%',
            borderRadius: 14,
          }}
        >
          <Text style={{ fontSize: 20, textAlign: 'center', color: '#fff' }}>
            Get Started
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
