import {
  Client,
  Account,
  ID,
  Avatars,
  Databases,
  Query,
  Storage,
} from "react-native-appwrite";

const client = new Client();

export const appWriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.basitk.aora",
  projectId: "667309600008a06596ec",
  databaseId: "66730b0e0028dbfbc1e1",
  UserCollectionId: "66730b3700276d645f48",
  videoCollectionId: "66730b6e000532f255a8",
  storageId: "66730d09003584c36fac",
};

client
  .setEndpoint(appWriteConfig.endpoint)
  .setProject(appWriteConfig.projectId)
  .setPlatform(appWriteConfig.platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export const createUSer = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      appWriteConfig.databaseId,
      appWriteConfig.UserCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    throw new Error(error);
  }
};

export const signIn = async (email, password) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    throw new Error(error);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.UserCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    throw new Error(error);
  }
};

export const getAllPosts = async (limit = 5, offset = 0) => {
  try {
    const posts = await databases.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.videoCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(limit), Query.offset(offset)]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const getAllPostsForInitialiation = async () => {
  try {
    const posts = await databases.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.videoCollectionId,
      [Query.orderDesc("$createdAt")]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const getLatestPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.videoCollectionId,
      [Query.orderAsc("$createdAt", Query.limit(7))]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const searchPosts = async (query) => {
  try {
    const posts = await databases.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.videoCollectionId,
      [Query.search("title", query)]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const getUserPosts = async (userId) => {
  try {
    const posts = await databases.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.videoCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    throw new Error(error);
  }
};

export const getFilePreview = async (fileId, type) => {
  let fileUrl;

  try {
    if (type === "video") {
      fileUrl = storage.getFileView(appWriteConfig.storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        appWriteConfig.storageId,
        fileId,
        2000,
        2000,
        "top",
        100
      );
    } else {
      throw new Error("Invalid file type");
    }

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
};

export const uploadFile = async (file, type) => {
  if (!file) return;

  const asset = {
    name: file.fileName,
    type: file.mimeType,
    size: file.fileSize,
    uri: file.uri,
  };

  try {
    const uploadedFile = await storage.createFile(
      appWriteConfig.storageId,
      ID.unique(),
      asset
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type);

    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
};

export const createVideo = async (form) => {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.video, "video"),
    ]);

    const newPost = await databases.createDocument(
      appWriteConfig.databaseId,
      appWriteConfig.videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt: form.prompt,
        creator: form.userId,
        likes: [],
      }
    );

    return newPost;
  } catch (error) {
    throw new Error(error);
  }
};

export const likeVideo = async (videoId, userId) => {
  try {
    // Get the current document
    const video = await databases.getDocument(
      appWriteConfig.databaseId,
      appWriteConfig.videoCollectionId,
      videoId
    );

    // Log the current likes array for debugging
    console.log("Current likes:", video.likes);

    // Initialize likes array if not present
    const likes = video.likes || [];

    // Ensure all elements in likes are strings (user IDs)
    const likesUserIds = likes.map((like) => {
      return typeof like === "string" ? like : like.$id;
    });

    // Log the current userId and isLiked status for debugging
    console.log("Likes User IDs:", likesUserIds);
    const isLiked = likesUserIds.includes(userId);
    console.log("Current userId:", userId);
    console.log("isLiked status:", isLiked);

    // Update the likes array
    const updatedLikes = isLiked
      ? likesUserIds.filter((id) => id !== userId) // Remove userId if already liked (unlike functionality)
      : [...likesUserIds, userId]; // Add userId if not already liked

    // Log the updated likes array for debugging
    console.log("Updated likes:", updatedLikes);

    // Update the document
    const updatedVideo = await databases.updateDocument(
      appWriteConfig.databaseId,
      appWriteConfig.videoCollectionId,
      videoId,
      { likes: updatedLikes }
    );

    return updatedVideo;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export const saveVideo = async (videoId, userId) => {
  try {
    // Get the current document
    const video = await databases.getDocument(
      appWriteConfig.databaseId,
      appWriteConfig.videoCollectionId,
      videoId
    );

    // Log the current bookmarks array for debugging
    console.log("Current bookmarks:", video.bookmark);

    // Initialize bookmarks array if not present
    const bookmarks = video.bookmark || [];

    // Ensure all elements in bookmarks are strings (user IDs)
    const bookmarksUserIds = bookmarks.map((bookmark) => {
      return typeof bookmark === "string" ? bookmark : bookmark.$id;
    });

    // Log the current userId and isBookmarked status for debugging
    console.log("Bookmarks User IDs:", bookmarksUserIds);
    const isBookmarked = bookmarksUserIds.includes(userId);
    console.log("Current userId:", userId);
    console.log("isBookmarked status:", isBookmarked);

    // Update the bookmarks array
    const updatedBookmarks = isBookmarked
      ? bookmarksUserIds.filter((id) => id !== userId) // Remove userId if already bookmarked (unbookmark functionality)
      : [...bookmarksUserIds, userId]; // Add userId if not already bookmarked

    // Log the updated bookmarks array for debugging
    console.log("Updated bookmarks:", updatedBookmarks);

    // Update the document
    const updatedVideo = await databases.updateDocument(
      appWriteConfig.databaseId,
      appWriteConfig.videoCollectionId,
      videoId,
      { bookmark: updatedBookmarks }
    );

    return updatedVideo;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

const extractFileIdFromUrl = (url) => {
  const regex = "/files/([^?]+)/";
  const match = url.match(regex);
  return match ? match[1] : null;
};

export const deleteVideo = async (videoId) => {
  try {
    const videoDoc = await databases.getDocument(
      appWriteConfig.databaseId,
      appWriteConfig.videoCollectionId,
      videoId
    );

    const { thumbnail, video } = videoDoc;

    // Extract file IDs from URLs
    const thumbnailFileId = extractFileIdFromUrl(thumbnail);
    const videoFileId = extractFileIdFromUrl(video);

    // Delete the files from storage
    await storage.deleteFile(appWriteConfig.storageId, thumbnailFileId);
    await storage.deleteFile(appWriteConfig.storageId, videoFileId);

    // Delete the document from the database
    const result = await databases.deleteDocument(
      appWriteConfig.databaseId,
      appWriteConfig.videoCollectionId,
      videoId
    );

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

export const getSavedPosts = async (userId) => {
  try {
    // Query the database for documents where the `bookmark` attribute includes the user's ID
    const response = await databases.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.videoCollectionId,
      [Query.search("bookmark", userId)]
    );

    return response.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const searchSavedPosts = async (userId, query) => {
  try {
    // Fetch all posts
    const response = await databases.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.videoCollectionId
    );

    const allPosts = response.documents;

    // Filter posts that are saved by the user
    const savedPosts = allPosts.filter((post) =>
      post.bookmark.includes(userId)
    );

    // Filter saved posts based on the query
    const filteredPosts = savedPosts.filter((post) =>
      post.title.toLowerCase().includes(query.toLowerCase())
    );

    return filteredPosts;
  } catch (error) {
    throw new Error(error);
  }
};

export const changePassword = async (newPassword, currentPassword) => {
  try {
    const result = await account.updatePassword(newPassword, currentPassword);
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

export const changeUsername = async (userId, newUsername) => {
  try {
    const result = await databases.updateDocument(
      appWriteConfig.databaseId,
      appWriteConfig.UserCollectionId,
      userId,
      { username: newUsername }
    );

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

export const changeImage = async (userId, newImage) => {
  try {
    const result = await databases.updateDocument(
      appWriteConfig.databaseId,
      appWriteConfig.UserCollectionId,
      userId,
      { avatar: newImage }
    );

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

export const changeBio = async (userId, newBio) => {
  try {
    const result = await databases.updateDocument(
      appWriteConfig.databaseId,
      appWriteConfig.UserCollectionId,
      userId,
      { bio: newBio }
    );

    return result;
  } catch (error) {
    throw new Error(error);
  }
};
