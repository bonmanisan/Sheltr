import { useAuth, useOAuth } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { router } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Colors from './../../constants/Colors';


export const useWarmupBrowser = () => {
  React.useEffect(() => {
    WebBrowser.warmUpAsync();
    return () => WebBrowser.coolDownAsync();
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  useWarmupBrowser();

  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });


  const { isSignedIn } = useAuth();

  React.useEffect(() => {
    if (isSignedIn) {
      router.replace("/(tabs)/home");
    }
  }, [isSignedIn]);

  const onPress = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL("/", { scheme: "sheltr" }),
      });

      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)/home");
      }
      
    } catch (err) {
      console.error('OAuth error:', err);
    }
  }, []);

  return (
    <View style={{ backgroundColor: Colors.WHITE, height: '100%' }}>
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <Image
          source={require('./../../assets/images/login2.png')}
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
            marginTop: 100,
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