import { useUser } from '@clerk/clerk-expo';
import { useNavigation } from 'expo-router';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { db } from '../../config/FirebaseConfig';
import Colors from '../../constants/Colors';
import PetListItem from './../../components/Home/PetListItem';

export default function UserPost() {
  const navigation = useNavigation();
  const { user } = useUser();
  const [loader, setLoader] = useState(false);
  const [userPostList, setUserPostList] = useState([]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'My Posts',
    });

    if (user) GetUserPost();
  }, [user]);

  // Add focus listener to refresh when returning from edit screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (user) GetUserPost();
    });
    return unsubscribe;
  }, [navigation, user]);

  const GetUserPost = async () => {
    setLoader(true);
    setUserPostList([]);

    const q = query(
      collection(db, 'Pets'),
      where('email', '==', user?.primaryEmailAddress?.emailAddress)
    );

    const querySnapshot = await getDocs(q);

    const posts = [];
    querySnapshot.forEach((docSnap) => {
      posts.push({ id: docSnap.id, ...docSnap.data() });
    });

    setUserPostList(posts);
    setLoader(false);
  };

  const OnDeletePost = (docId) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => deletePost(docId) },
      ]
    );
  };

  const deletePost = async (docId) => {
    await deleteDoc(doc(db, 'Pets', docId));
    GetUserPost();
  };

  // Updated edit function to pass post data properly
  const OnEditPost = (post) => {
    // Navigate to edit screen with post data
    navigation.navigate('editPost', { 
      postId: post.id,
      ...post // Spread all post data as separate params
    });
  };

  return (
    <View style={{ padding: 20, flex: 1 }}>
      <Text style={{ fontFamily: 'outfit-medium', fontSize: 30, marginBottom: 20 }}>
        My Posts
      </Text>

      <FlatList
        data={userPostList}
        numColumns={2}
        refreshing={loader}
        onRefresh={GetUserPost}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.postContainer}>
            <PetListItem pet={item} />
            
            <View style={styles.buttonContainer}>
              <Pressable
                onPress={() => OnEditPost(item)}
                style={[styles.actionButton, styles.editButton]}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </Pressable>
              
              <Pressable
                onPress={() => OnDeletePost(item.id)}
                style={[styles.actionButton, styles.deleteButton]}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          !loader ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts found</Text>
              <Text style={styles.emptySubtext}>Create your first pet post!</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  postContainer: {
    flex: 1,
    marginBottom: 15,
    marginRight: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 7,
    marginHorizontal: 2,
  },
  editButton: {
    backgroundColor: Colors.PRIMARY,
  },
  deleteButton: {
    backgroundColor: Colors.SECONDARY,
  },
  buttonText: {
    fontFamily: 'outfit-medium',
    textAlign: 'center',
    color: Colors.WHITE,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontFamily: 'outfit-medium',
    fontSize: 18,
    color: Colors.GRAY,
  },
  emptySubtext: {
    fontFamily: 'outfit',
    fontSize: 14,
    color: Colors.LIGHTGRAY,
    marginTop: 5,
  },
});