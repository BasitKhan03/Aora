import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getCurrentUser,
  likeVideo,
  saveVideo,
  getAllPostsForInitialiation,
  getAllPosts,
  getUserPosts,
  getSavedPosts,
} from "../lib/appwrite";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [initializePosts, setInitializePosts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [limit] = useState(5);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [savedPosts, setSavedPosts] = useState([]);
  const [isSavedPostsLoading, setIsSavedPostsLoading] = useState(true);

  const [profilePosts, setProfilePosts] = useState([]);
  const [isProfilePostsLoading, setIsProfilePostsLoading] = useState(true);

  const [likedVideos, setLikedVideos] = useState({});
  const [likesCount, setLikesCount] = useState({});
  const [savedVideos, setSavedVideos] = useState({});

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if (res) {
          setIsLoggedIn(true);
          setUser(res);
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      })
      .catch((error) => console.log(error))
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const fetchInitializePostsData = async () => {
    if (!user) return;

    try {
      const response = await getAllPostsForInitialiation();
      setInitializePosts(response);
    } catch (error) {
      console.log("Error", error.message);
    }
  };

  const fetchPosts = async (reset = false, currentOffset = 0) => {
    if (!user || isPostsLoading || (loadingMore && !reset)) return;
    if (!reset && !hasMore) return;
  
    setIsPostsLoading(true);
    setLoadingMore(!reset);
  
    try {
      const fetchedPosts = await getAllPosts(limit, currentOffset); 
  
      setPosts((prevPosts) => (reset ? fetchedPosts : [...prevPosts, ...fetchedPosts]));
  
      if (fetchedPosts.length < limit) {
        setHasMore(false);
      } else {
        setHasMore(true);
        setOffset(currentOffset + limit); 
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsPostsLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchSavedPosts = async () => {
    if (!user) return;

    setIsSavedPostsLoading(true);

    try {
      const response = await getSavedPosts(user.$id);
      setSavedPosts(response);
    } catch (error) {
      console.log("Error", error.message);
    } finally {
      setIsSavedPostsLoading(false);
    }
  };

  const fetchProfilePostsData = async () => {
    if (!user) return;

    setIsProfilePostsLoading(true);

    try {
      const response = await getUserPosts(user.$id);
      setProfilePosts(response);
    } catch (error) {
      console.log("Error", error.message);
    } finally {
      setIsProfilePostsLoading(false);
    }
  };

  const refetchInitializePosts = () => fetchInitializePostsData();

  const refetchPosts = () => fetchPosts(true);

  const refetchSavedPosts = () => fetchSavedPosts();

  const refetchProfilePosts = () => fetchProfilePostsData();

  useEffect(() => {
    if (user) {
      fetchInitializePostsData();
    }
  }, [user]);

  useEffect(() => {
    if (user && initializePosts) {
      fetchPosts(true);
    }
  }, [user, initializePosts]);

  useEffect(() => {
    if (user) {
      fetchSavedPosts();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfilePostsData();
    }
  }, [user]);

  useEffect(() => {
    const initializeLikes = () => {
      if (initializePosts && user) {
        const initialLikedVideos = {};
        const initialLikesCount = {};
        initializePosts.forEach((post) => {
          initialLikedVideos[post.$id] = (post.likes || []).some(
            (like) => like.$id === user.$id
          );
          initialLikesCount[post.$id] = post.likes.length;
        });
        setLikedVideos(initialLikedVideos);
        setLikesCount(initialLikesCount);
      }
    };

    const initializeBookmark = async () => {
      if (initializePosts && user) {
        const initialSavedVideos = {};

        const savedVideosList = await getSavedPosts(user.$id);
        const savedVideoIds = savedVideosList.map(
          (savedVideo) => savedVideo.$id
        );

        initializePosts.forEach((post) => {
          initialSavedVideos[post.$id] = savedVideoIds.includes(post.$id);
        });

        setSavedVideos(initialSavedVideos);
      }
    };

    if (user) {
      initializeLikes();
      initializeBookmark();
    }
  }, [posts, user]);

  const handleLike = async (videoId) => {
    try {
      setLikedVideos((prevLikedVideos) => ({
        ...prevLikedVideos,
        [videoId]: !prevLikedVideos[videoId],
      }));

      setLikesCount((prevLikesCount) => ({
        ...prevLikesCount,
        [videoId]: likedVideos[videoId]
          ? prevLikesCount[videoId] - 1
          : prevLikesCount[videoId] + 1,
      }));

      await likeVideo(videoId, user.$id);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async (videoId) => {
    try {
      setSavedVideos((prevSavedVideos) => ({
        ...prevSavedVideos,
        [videoId]: !prevSavedVideos[videoId],
      }));

      await saveVideo(videoId, user.$id);
      await refetchSavedPosts();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
        isLoading,
        likedVideos,
        likesCount,
        savedVideos,
        handleLike,
        handleSave,
        posts,
        fetchPosts,
        refetchPosts,
        loadingMore,
        setLoadingMore,
        hasMore,
        setHasMore,
        profilePosts,
        refetchProfilePosts,
        savedPosts,
        refetchSavedPosts,
        refetchInitializePosts,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
