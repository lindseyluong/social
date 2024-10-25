import { View, Text, StyleSheet, ScrollView, Pressable, TouchableOpacity, Alert, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import { hp, wp } from '../../helpers/common'
import { useAuth } from '../../contexts/AuthContext'
import { theme } from '../../constants/theme'
import { Feather, Ionicons, SimpleLineIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { getUserImageSrc } from '../../services/imageService'
import { Image } from 'expo-image';
import Header from '../../components/Header'
import ScreenWrapper from '../../components/ScreenWrapper'
import Icon from '../../assets/icons'
import Avatar from '../../components/Avatar'
import { supabase } from '../../lib/supabase'
import { fetchPosts } from '../../services/postService'
import PostCard from '../../components/PostCard'
import Loading from '../../components/Loading'

var limit = 0;
const Profile = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [friendsCount, setFriendsCount] = useState(0);

  useEffect(() => {
    fetchFriendsCount();
  }, []);

  const fetchFriendsCount = async () => {
    const { count, error } = await supabase
      .from('friends')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    if (!error) {
      setFriendsCount(count);
    }
  };

  // Fetch posts function
  const getPosts = async () => {
    if (!hasMore) return null; // if no more posts then don't call the api
    limit = limit + 10; // get 10 more posts everytime
    console.log('fetching posts: ', limit);
    let res = await fetchPosts(limit, user.id);
    if (res.success) {
      if (posts.length == res.data.length) setHasMore(false);
      setPosts(res.data);
    }
  }

  const onLogout = async () => {
    setAuth(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error Signing Out User", error.message);
    }
  }

  const handleLogout = () => {
    Alert.alert('Confirm', 'Are you sure you want log out?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel'),
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: () => onLogout(),
        style: 'destructive'
      },
    ]);
  }

  return (
    <ScreenWrapper bg="white">
      {/* first create UserHeader and use it here, then move it to header comp when implementing user posts */}
      {/* posts */}
      <FlatList
        data={posts}
        ListHeaderComponent={<UserHeader user={user} handleLogout={handleLogout} router={router} friendsCount={friendsCount} />}
        ListHeaderComponentStyle={{ marginBottom: 30 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listStyle}
        keyExtractor={(item, index) => item.id.toString()}
        renderItem={({ item }) => <PostCard
          item={item}
          currentUser={user}
          router={router}
        />}
        onEndReached={() => {
          getPosts();
          console.log('got to the end');
        }}
        onEndReachedThreshold={0} //  Specifies how close to the bottom the user must scroll before endreached is triggers, 0 -> 1
        ListFooterComponent={hasMore ? (
          <View style={{ marginTop: posts.length == 0 ? 100 : 30 }}>
            <Loading />
          </View>
        ) : (
          <View style={{ marginVertical: 30 }}>
            <Text style={styles.noPosts}>No more posts</Text>
          </View>
        )
        }
      />
    </ScreenWrapper>
  )
}

const UserHeader = ({ user, handleLogout, router, friendsCount }) => {
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View>
        <Header title={<Text style={styles.usernameText}> @{user && user.username} </Text>} mb={30} />
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Icon name="logout" size={26} color={theme.colors.rose} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* avatar */}
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={styles.avatarContainer}>
            <Avatar
              uri={user?.image}
              size={hp(12)}
              rounded={theme.radius.xxl * 1.4}
            />
            {/* <Image source={getUserImageSrc(user?.image)} style={styles.avatar} /> */}
            <Pressable style={styles.editIcon} onPress={() => router.push('/editProfile')}>
              <Icon name="edit" strokeWidth={2.5} size={20} />
            </Pressable>
          </View>

          {/* post count and friends */}
          <View style={styles.postfrenContainer}>
            <View style={styles.friendpoContainer}>
              <Text>Posts</Text>
              <Text>10</Text>
            </View>
            <View style={styles.friendpoContainer}>
              <Text>Friends</Text>
              <Pressable
                onPress={() => router.push('/friendsList')}>
                <Text>{friendsCount}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* name & username */}
        <View style={{ flex: 2, flexDirection: 'row' }}>
          <Text style={styles.usersName}> {user && user.name} </Text>
          {/* <Text style={styles.usernameText}> @{user && user.username} </Text> */}
        </View>

        {/* bio*/}
        <View>
          {
            user && user.bio && (
              <Text style={[styles.bio]}>{user.bio}</Text>
            )
          }
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // flexDirection: 'row',
    gap: '10',
  },
  headerContainer: {
    marginHorizontal: wp(4),
    marginBottom: 20
  },
  headerShape: {
    width: wp(100),
    height: hp(20)
  },
  avatarContainer: {
    height: hp(12),
    width: hp(12),
    alignSelf: 'flex-start'
    // alignSelf: 'center'
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: -12,
    padding: 7,
    borderRadius: 50,
    backgroundColor: 'white',
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7
  },
  usersName: {
    fontSize: hp(3),
    fontWeight: '500',
    color: theme.colors.textDark
  },
  bio: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: 8
  },
  usernameText: {
    fontSize: hp(2),
    fontWeight: '500',
    color: theme.colors.textLight,
    marginTop: 14
  },
  logoutButton: {
    position: 'absolute',
    right: 0,
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: '#fee2e2'
  },
  listStyle: {
    paddingHorizontal: wp(4),
    paddingBottom: 30,

  },
  noPosts: {
    fontSize: hp(2),
    textAlign: 'center',
    color: theme.colors.text
  },
  postfrenContainer: {
    flex: 2, flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  friendpoContainer: {
    flexDirection: 'column',
    gap: 10,
    alignItems: 'center'
  }

})

export default Profile
