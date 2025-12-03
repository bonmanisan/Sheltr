import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./../config/FirebaseConfig";

export const GetFavList = async (user) => {
  const email = user?.primaryEmailAddress?.emailAddress;
  const docRef = doc(db, "UserFavPet", email);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    await setDoc(docRef, {
      email: email,
      favorites: []
    });

    return {
      email: email,
      favorites: []
    };
  }
};

export const UpdateFav = async (user, favorites) => {
  const email = user?.primaryEmailAddress?.emailAddress;
  const docRef = doc(db, "UserFavPet", email);

  await updateDoc(docRef, {
    favorites: favorites
  });
};

export default {
  GetFavList,
  UpdateFav,
};
