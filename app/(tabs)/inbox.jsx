import { useUser } from '@clerk/clerk-expo';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import UserItem from '../../components/Inbox/UserItem';
import { db } from '../../config/FirebaseConfig';

export default function Inbox() {
  const { user } = useUser();
  const [userList, setUserList] = useState([]);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    user && GetUserList();
  }, [user]);

  const GetUserList = async () => {
    setLoader(true);
    setUserList([]);

    const q = query(
      collection(db, 'Chat'),
      where('userIds', 'array-contains', user?.primaryEmailAddress?.emailAddress)
    );

    const querySnapshot = await getDocs(q);

    const tempList = [];
    querySnapshot.forEach(doc => tempList.push(doc.data()));

    setUserList(tempList);
    setLoader(false);
  };

  const MapOtherUserList = () => {
    const list = [];

    userList.forEach(record => {
      const otherUser = record.users?.filter(
        u => u?.email !== user?.primaryEmailAddress?.emailAddress
      );

      const result = {
        docId: record.id,
        ...otherUser[0]
      };
      list.push(result);
    });

    return list;
  };

  return (
    <View style={{ padding: 20, marginTop: 20 }}>
      <Text style={{ fontFamily: 'outfit-medium', fontSize: 30 }}>Inbox</Text>

      <FlatList
        data={MapOtherUserList()}
        refreshing={loader}
        onRefresh={GetUserList}
        style={{ marginTop: 20 }}
        renderItem={({ item, index }) => (
          <UserItem userInfo={item} key={index} />
        )}
      />
    </View>
  );
}
