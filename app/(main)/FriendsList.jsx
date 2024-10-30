import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { hp, wp } from '../../helpers/common'
import { useAuth } from '../../contexts/AuthContext'
import { theme } from '../../constants/theme'
import { useRouter } from 'expo-router'
import Header from '../../components/Header'
import ScreenWrapper from '../../components/ScreenWrapper'
import Avatar from '../../components/Avatar'
import { supabase } from '../../lib/supabase'
import Loading from '../../components/Loading'

const FriendsList = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    const { data, error } = await supabase
      .from('friends')
      .select('friend_id, status')
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    if (!error) {
      const friendDetails = await Promise.all(
        data.map(async (friend) => {
          const { data: friendData, error: friendError } = await supabase
            .from('users')
            .select('id, username, image')
            .eq('id', friend.friend_id)
            .single();
          if (!friendError) {
            return friendData;
          }
        })
      );
      setFriends(friendDetails.filter(Boolean));
      setLoading(false);
    } else {
      console.error(error);
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <ScreenWrapper bg="white">
      <Header title={<Text style={styles.title}>Friends</Text>} mb={30} backAction={() => router.back()} />
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/friendProfile?id=${item.id}`)} style={styles.friendContainer}>
            <Avatar
              uri={item.image}
              size={hp(8)}
              rounded={theme.radius.xxl}
            />
            <Text style={styles.friendName}>@{item.username}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.noFriendsText}>No friends found</Text>}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: hp(3),
    fontWeight: 'bold',
    color: theme.colors.textDark,
  },
  friendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.textLight,
  },
  friendName: {
    fontSize: hp(2.2),
    fontWeight: '500',
    color: theme.colors.textDark,
    marginLeft: wp(4),
  },
  noFriendsText: {
    fontSize: hp(2),
    textAlign: 'center',
    color: theme.colors.text,
    marginTop: hp(5),
  },
});

export default FriendsList