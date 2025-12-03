import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import { Tabs } from 'expo-router';
import Colors from '../../constants/Colors';


export default function TabLayout() {

    useFonts({
        'outfit':require('./../../assets/fonts/Outfit-Regular.ttf'),
        'outfit-medium':require('./../../assets/fonts/Outfit-Medium.ttf'),
        'outfit-bold':require('./../../assets/fonts/Outfit-Bold.ttf')

    })
  return (
   <Tabs
    screenOptions={{
        tabBarActiveTintColor:Colors.PRIMARY
    }}
   >
        <Tabs.Screen name = 'home'
            options={{
                title:'Home',
                headerShown:false,
                tabBarIcon:({color})=><Ionicons name="home" size={24} color={color} />
            }}/>
        <Tabs.Screen name = 'favorite'
         options={{
                title:'Favorite',
                headerShown:false,
                tabBarIcon:({color})=><Ionicons name="heart" size={24} color={color} />
            }}/>
        
        <Tabs.Screen name = 'inbox' options={{
                title:'Inbox',
                headerShown:false,
                tabBarIcon:({color})=><Ionicons name="chatbubble" size={24} color={color} />
            }}/>
        <Tabs.Screen name = 'profile' options={{
                title:'Profile',
                headerShown:false,
                tabBarIcon:({color})=><Ionicons name="people-circle" size={24} color={color} />
            }}/>

   </Tabs>
  )
}