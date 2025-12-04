import { useUser } from '@clerk/clerk-expo';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import UserItem from '../../components/Inbox/UserItem';
import { db } from '../../config/FirebaseConfig';

export default function Inbox() {
  const { user } = useUser();
  const [userList, setUserList] = useState([]);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    if (user) GetUserList();
  }, [user]);

  const GetUserList = async () => {
    try {
      setLoader(true);

      const q = query(
        collection(db, 'Chat'),
        where('userIds', 'array-contains', user?.primaryEmailAddress?.emailAddress)
      );

      const querySnapshot = await getDocs(q);

      const tempList = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,         // FIX: include document ID
        ...docSnap.data()
      }));

      setUserList(tempList);
    } catch (error) {
      console.log("Inbox Fetch Error:", error);
    }

    setLoader(false);
  };

  // Map other users only once when userList changes
  const OtherUsers = useMemo(() => {
    return userList.map(record => {
      const other = record.users?.filter(
        u => u?.email !== user?.primaryEmailAddress?.emailAddress
      );

      return {
        docId: record.id,
        ...(other?.[0] || {})   // safe fallback
      };
    });
  }, [userList]);

  return (
    <View style={{ padding: 20, marginTop: 20 }}>
      <Text style={{ fontFamily: 'outfit-medium', fontSize: 30 }}>
        Inbox
      </Text>

      <FlatList
        data={OtherUsers}
        refreshing={loader}
        onRefresh={GetUserList}
        keyExtractor={(item) => item.docId}
        style={{ marginTop: 20 }}
        renderItem={({ item }) => (
          <UserItem userInfo={item} />
        )}
      />
    </View>
  );
}
