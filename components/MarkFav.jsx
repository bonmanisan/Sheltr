import { useUser } from "@clerk/clerk-expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import Shared from "./../Shared/Shared";

export default function MarkFav({ pet }) {
  const { user } = useUser();
  const [favList, setFavList] = useState([]);

  useEffect(() => {
    if (user) GetFav();
  }, [user]);

  const GetFav = async () => {
    const result = await Shared.GetFavList(user);
    setFavList(result?.favorites ?? []);
  };

  const AddToFav = async () => {
    const favResult = [...favList, pet.id];
    await Shared.UpdateFav(user, favResult);
    GetFav();
  };

  const RemoveFromFav = async () => {
    const favResult = favList.filter((item) => item !== pet.id);
    await Shared.UpdateFav(user, favResult);
    GetFav();
  };

  return (
    <View>
      {favList.includes(pet.id) ? (
        <Pressable onPress={RemoveFromFav}>
          <Ionicons name="heart" size={30} color="red" />
        </Pressable>
      ) : (
        <Pressable onPress={AddToFav}>
          <Ionicons name="heart-outline" size={30} color="black" />
        </Pressable>
      )}
    </View>
  );
}
