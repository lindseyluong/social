import { View, Text, StyleSheet, ScrollView, Pressable, Image as RNImage, Alert, TouchableOpacity, TextInput } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { hp, wp } from '../../helpers/common'
import { theme } from '../../constants/theme'
import { useAuth } from '../../contexts/AuthContext'
import { getFilePath, getSupabaseFileUrl, getUserImageSrc, uploadFile } from '../../services/imageService'
import { Image } from 'expo-image'
import RichTextEditor from '../../components/RichTextEditor'
import Button from '../../components/Button'
import { AntDesign, FontAwesome, FontAwesome6, Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker';
import { Video, AVPlaybackStatus } from 'expo-av';
import { createOrUpdatePost } from '../../services/postService'
import Header from '../../components/Header'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Avatar from '../../components/Avatar'
import Icon from '../../assets/icons'
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SpotifySearch = ({ onSelectSong }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchSpotify = async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const expirationDate = await AsyncStorage.getItem('expirationDate');
      const currentTime = Date.now();

      // Check if the token is still valid
      if (!token || !expirationDate || currentTime >= parseInt(expirationDate)) {
        console.error('Spotify token is either invalid or expired. Please authenticate again.');
        Alert.alert("Spotify Authentication", "Please re-authenticate with Spotify to continue.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`https://api.spotify.com/v1/search`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          q: searchQuery,
          type: 'track',
          limit: 10,
        },
      });
      setSearchResults(response.data.tracks.items);
    } catch (error) {
      console.error('Error searching Spotify:', error);
      Alert.alert('Spotify Error', 'An error occurred while searching Spotify. Please try again.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.spotifySearchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search for a song..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={searchSpotify}
      />
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        searchResults.map((track) => (
          <TouchableOpacity key={track.id} onPress={() => onSelectSong({
            name: track.name,
            artist: track.artists[0].name,
            uri: track.uri,
          })}>
            <Text style={styles.trackText}>{track.name} by {track.artists[0].name}</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

const NewPost = () => {
  const {user} = useAuth();
  const post = useLocalSearchParams();
  console.log('post: ', post);
  const [file, setFile] = useState(null);
  const bodyRef = useRef('');
  const [loading, setLoading] = useState(false);
  const editorRef = useRef(null);
  const router = useRouter();
  const [selectedSong, setSelectedSong] = useState(null);  // State to store selected Spotify song

  useEffect(()=>{
    if(post && post.id){
      bodyRef.current = post.body;
      setFile(post.file || null);
      setSelectedSong(post.song || null);  // Load the existing song if editing
      setTimeout(() => {
        editorRef?.current?.setContentHTML(post.body);
      }, (300));
    }
  },[])

  const onPick = async (isImage) => {
    let mediaConfig = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    }

    if(!isImage){
      mediaConfig = {
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
      }
    }
    let result = await ImagePicker.launchImageLibraryAsync(mediaConfig);

    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  };

  const onSubmit = async ()=>{
    if(!bodyRef.current && !file && !selectedSong){
      Alert.alert('Post', "Please choose an image, add post body, or select a song!");
      return;
    }

    setLoading(true);
    let data = {
      file,
      body: bodyRef.current,
      userId: user?.id,
      song: selectedSong,  // Include the selected song in the post data
    }
    if(post && post.id) data.id = post.id;

    let res = await createOrUpdatePost(data);
    setLoading(false);
    if(res.success){
      setFile(null);
      bodyRef.current = '';
      setSelectedSong(null);
      editorRef.current?.setContentHTML('');
      router.back();
    }else{
      Alert.alert('Post', res.msg);
    }
  }

  const isLocalFile = file=>{
    if(!file) return null;
    if(typeof file == 'object') return true;
    return false;
  }

  const getFileType = file=>{
    if(!file) return null;
    if(isLocalFile(file)){
      return file.type;
    }
    if(file.includes('postImages')){
      return 'image';
    }
    return 'video';
  }

  const getFileUri = file=>{
    if(!file) return null;
    if(isLocalFile(file)){
      return file.uri;
    }else{
      return getSupabaseFileUrl(file)?.uri;
    }
  }

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Header title="Create Post" mb={15} />
          
        <ScrollView contentContainerStyle={{gap: 20}}>
          <View style={styles.header}>
              <Avatar
                uri={user?.image}
                size={hp(6.5)}
                rounded={theme.radius.xl}
              />
              <View style={{gap: 2}}>
                <Text style={styles.username}>{user && user.name}</Text>
                <Text style={styles.publicText}>Public</Text>
              </View>
          </View>
          <View style={styles.textEditor}>
            <RichTextEditor editorRef={editorRef} onChange={body=> bodyRef.current = body} />
          </View>
          {
            file && (
              <View style={styles.file}>
                {
                  getFileType(file)=='video'? (
                    <Video
                      style={{flex: 1}}
                      source={{
                        uri: getFileUri(file)
                      }}
                      useNativeControls
                      resizeMode="cover"
                      isLooping
                    />
                  ):(
                    <Image source={{uri: getFileUri(file)}} contentFit='cover' style={{flex: 1}} />
                  )
                }
                <Pressable style={styles.closeIcon} onPress={()=> setFile(null)}>
                  <AntDesign name="closecircle" size={25} color="rgba(255, 0,0,0.6)" />
                </Pressable>
              </View>
            )
          }  
          {
            selectedSong && (
              <View style={styles.songContainer}>
                <Text style={styles.songTitle}>{selectedSong.name} by {selectedSong.artist}</Text>
                <Pressable style={styles.closeIcon} onPress={() => setSelectedSong(null)}>
                  <AntDesign name="closecircle" size={25} color="rgba(255, 0,0,0.6)" />
                </Pressable>
              </View>
            )
          } 
          <View style={styles.media}>
            <Text style={styles.addImageText}>Add to your post</Text>
            <View style={styles.mediaIcons}>
              <TouchableOpacity onPress={()=> onPick(true)}>
                <Icon name="image" size={30} color={theme.colors.dark} />
              </TouchableOpacity>
              <TouchableOpacity onPress={()=> onPick(false)}>
                <Icon name="video" size={33} color={theme.colors.dark} />
              </TouchableOpacity>
              <SpotifySearch onSelectSong={(song) => setSelectedSong(song)} />
            </View>
          </View> 
        </ScrollView>
        <Button 
          buttonStyle={{height: hp(6.2)}} 
          title={post && post.id? "Update": "Post"}
          loading={loading}
          hasShadow={false} 
          onPress={onSubmit}
        />
      </View>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30,
    paddingHorizontal: wp(4),
    gap: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  username: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  publicText: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
  },
  textEditor: {},
  media: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    padding: 12,
    paddingHorizontal: 18,
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    borderColor: theme.colors.gray
  },
  mediaIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15
  },
  addImageText: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  file: {
    height: hp(30),
    width: '100%',
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    borderCurve: 'continuous'
  },
  songContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.gray,
    borderRadius: theme.radius.md,
  },
  songTitle: {
    fontSize: hp(2),
    color: theme.colors.text,
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  spotifySearchContainer: {
    marginTop: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: theme.colors.gray,
    padding: 10,
    borderRadius: theme.radius.md,
  },
  trackText: {
    paddingVertical: 5,
    fontSize: hp(1.8),
    color: theme.colors.text,
  }
})

export default NewPost;