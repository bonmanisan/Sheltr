import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import PetListItem from '../../components/Home/PetListItem';
import { db } from '../../config/FirebaseConfig';
import Category from './Category';

export default function PetListByCategory() {
  const [petList, setPetList] = useState([]);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    GetPetList('Dogs');
  }, []);

  const GetPetList = async (category) => {
    setLoader(true);
    setPetList([]);

    const q = query(
      collection(db, 'Pets'),
      where('category', '==', category)
    );

    const querySnapshot = await getDocs(q);

    const list = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setPetList(list);
    setLoader(false);
  };

  return (
    <View>
      <Category category={(value) => GetPetList(value)} />
      <FlatList
        data={petList}
        style={{ marginTop: 10 }}
        horizontal={true}
        refreshing={loader}
        onRefresh={() => GetPetList('Dogs')}
        renderItem={({ item }) => (
          <PetListItem pet={item} />
        )}
      />
    </View>
  );
}
