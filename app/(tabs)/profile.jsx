import { useAuth, useUser } from '@clerk/clerk-expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';

export default function Profile() {
  const Menu = [
    {
      id: 1,
      name: 'Add New Pet',
      icon: 'add-circle',
      path: '/add-new-pet'
    },
        {
      id: 5,
      name: 'My Post',
      icon: 'bookmark',
      path: '/../user-post'
    },
    {
      id: 2,
      name: 'Favorite',
      icon: 'heart',
      path: '/(tabs)/favorite'
    },
    {
      id: 3,
      name: 'Inbox',
      icon: 'chatbubble',
      path: '/(tabs)/inbox'
    },
    {
      id: 4,
      name: 'Logout',
      icon: 'exit',
      path: 'logout'
    }
  ]

  const { user } = useUser();
  const router = useRouter();
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const onPressMenu = async (menu) => {
    if (menu.name === 'Logout') {
      setIsLoading(true);
      try {
        await signOut();
        // Redirect to login page after successful logout
        router.replace('/login'); // Adjust this path based on your login page location
      } catch (error) {
        console.error('Logout error:', error);
        setIsLoading(false);
      }
      return;
    }

    router.push(menu.path);
  }

  return (
    <View style={{
      padding: 20,
      marginTop: 20,
      flex: 1
    }}>
      <Text style={{
        fontFamily: 'outfit-medium',
        fontSize: 30
      }}>Profile</Text>

      <View style={{
        display: 'flex',
        alignItems: 'center',
        marginVertical: 25
      }}>
        <Image source={{ uri: user?.imageUrl }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 99,
          }} />

        <Text style={{
          fontFamily: 'outfit-bold',
          fontSize: 20,
          marginTop: 6
        }}>{user?.fullName}</Text>
        <Text style={{
          fontFamily: 'outfit',
          fontSize: 16,
          color: Colors.GRAY
        }}>{user?.primaryEmailAddress?.emailAddress}</Text>
      </View>

      <FlatList
        data={Menu}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => onPressMenu(item)}
            disabled={item.name === 'Logout' && isLoading}
            key={item.id}
            style={{
              marginVertical: 10,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: Colors.WHITE,
              padding: 10,
              borderRadius: 10,
              opacity: item.name === 'Logout' && isLoading ? 0.6 : 1
            }}>
            <Ionicons name={item?.icon} size={30}
              color={Colors.PRIMARY}
              style={{
                padding: 10,
                backgroundColor: Colors.LIGHTSECONDARY,
                borderRadius: 10
              }}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Text style={{
                fontFamily: 'outfit',
                fontSize: 20,
                flex: 1
              }}>{item.name}</Text>
              {item.name === 'Logout' && isLoading && (
                <ActivityIndicator size="small" color={Colors.PRIMARY} style={{ marginLeft: 10 }} />
              )}
            </View>
          </TouchableOpacity>
        )}
      />

    </View>
  )
}