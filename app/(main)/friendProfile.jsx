import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { hp, wp } from '../../helpers/common'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { theme } from '../../constants/theme'
import { supabase } from '../../lib/supabase'
import Header from '../../components/Header'
import ScreenWrapper from '../../components/ScreenWrapper'
import Avatar from '../../components/Avatar'
import Loading from '../../components/Loading'
import PostCard from '../../components/PostCard'

const FriendProfile = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [friend, setFriend] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriendProfile();
  }, [id]);

  const fetchFriendProfile = async () => {
    const { data: friendData, error: friendError } = await supabase
      .from('users')
      .select('id, username, name, image, bio')
      .eq('id', id)
      .single();

    if (!friendError) {
      setFriend(friendData);
      fetchFriendPosts(friendData.id);
    } else {
      console.error(friendError);
      setLoading(false);
    }
  };

  const fetchFriendPosts = async (friendId) => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', friendId);

    if (!error) {
      setPosts(data);
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
      <Header title={<Text style={styles.usernameText}>@{friend && friend.username}</Text>} mb={30} backAction={() => router.back()} />
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Avatar uri={friend?.image} size={hp(12)} rounded={theme.radius.xxl * 1.4} />
          <View style={{ marginLeft: wp(4) }}>
            <Text style={styles.nameText}>{friend?.name}</Text>
            <Text style={styles.bio}>{friend?.bio}</Text>
          </View>
        </View>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard
            item={item}
            currentUser={friend}
            router={router}
          />
        )}
        ListEmptyComponent={<Text style={styles.noPostsText}>No posts available</Text>}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
  },
  nameText: {
    fontSize: hp(3),
    fontWeight: '500',
    color: theme.colors.textDark,
  },
  bio: {
    fontSize: hp(2),
    color: theme.colors.text,
    marginTop: hp(1),
  },
  usernameText: {
    fontSize: hp(2.5),
    fontWeight: '500',
    color: theme.colors.textLight,
  },
  noPostsText: {
    fontSize: hp(2),
    textAlign: 'center',
    color: theme.colors.text,
    marginTop: hp(5),
  },
});

export default FriendProfile