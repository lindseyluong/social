import React from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import Icon from '../../assets/icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import Avatar from '../../components/Avatar';

const FriendsListModal = ({ friends }) => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const renderFriendItem = ({ item }) => (
    <View style={styles.friendItemContainer}>
      <Avatar uri={item?.image} size={50} rounded={theme.radius.xxl} />
      <View style={styles.friendInfoContainer}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendStatus}>{item.status}</Text>
      </View>
    </View>
  );

  const filteredFriends = friends.filter(friend => friend.status === 'accepted');

  return (
    <ScreenWrapper bg="white">
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Friends List</Text>
        <Pressable style={styles.closeButton} onPress={handleGoBack}>
          <Icon name="close" size={24} color={theme.colors.textDark} />
        </Pressable>
      </View>
      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFriendItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.noFriendsText}>No friends found.</Text>}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textDark,
  },
  closeButton: {
    padding: 5,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  friendItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  friendInfoContainer: {
    marginLeft: 15,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textDark,
  },
  friendStatus: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: 5,
  },
  noFriendsText: {
    textAlign: 'center',
    color: theme.colors.textLight,
    marginTop: 20,
  },
});

export default FriendsListModal;
