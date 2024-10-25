import { StyleSheet, Text, View, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native'; // Import useRoute for navigation
import { supabase } from '../../lib/supabase'; // Import Supabase client
import Avatar from '../../components/Avatar';
import ScreenWrapper from '../../components/ScreenWrapper';

const FriendsList = () => {
  const route = useRoute(); // Use useRoute to access route params
  const { userId } = route.params; // Get userId from route params
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    const { data, error } = await supabase
      .from('friends')
      .select('friend_id, status, users!friends_friend_id(name, image, username)')
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (!error) {
      const formattedFriends = data.map(friend => ({
        id: friend.friend_id,
        name: friend.users.name,
        image: friend.users.image,
        username: friend.users.username,
        status: friend.status,
      }));
      setFriends(formattedFriends);
    }
  };

  const renderFriendItem = ({ item }) => (
    <View style={styles.friendItemContainer}>
      <Avatar uri={item?.image} size={50} rounded={30} />
      <View style={styles.friendInfoContainer}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendUsername}>@{item.username}</Text>
      </View>
    </View>
  );

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Friends List</Text>
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFriendItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.noFriendsText}>No friends found.</Text>}
        />
      </View>
    </ScreenWrapper>
  );
};

export default FriendsList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  friendItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  friendInfoContainer: {
    marginLeft: 15,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  friendUsername: {
    fontSize: 14,
    color: '#777',
  },
  noFriendsText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
  },
  listContainer: {
    paddingBottom: 30,
  },
});
