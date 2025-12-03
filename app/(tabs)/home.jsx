import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Header from '../../components/Home/Header';
import PetListByCategory from '../../components/Home/PetListByCategory';
import Slider from '../../components/Home/Slider';
import Colors from '../../constants/Colors';

export default function Home() {
  return (
    <View style={{ padding:20, marginTop:20 }}>

      {/* Header */}
      <Header />

      {/* Slider */}
      <Slider />

      {/* PetListByCategory */}
      <PetListByCategory />

      {/* Add New Pet Option */}
      <Link href={'/add-new-pet'}
      
      style={styles.addNewPetContainer}> 
        <MaterialIcons name="pets" size={24} color={Colors.PRIMARY} />
        <Text style={{
          fontFamily:'outfit-medium',
          color:Colors.PRIMARY,
          fontSize:18
        }}>
          Add New Pet
        </Text>
      </Link>

    </View>
  );
}

const styles = StyleSheet.create({
  addNewPetContainer:{
    display:'flex',
    flexDirection:'row',
    gap:10,
    alignItems:'center',
    padding:20,
    marginTop:20,
    textAlign:'center',
    backgroundColor:Colors.LIGHTSECONDARY,
    borderWidth:1,
    borderColor:Colors.PRIMARY,
    borderRadius:15,
    borderStyle:'dashed',
    justifyContent:'center'
  }
});
