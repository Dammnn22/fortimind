
import { db } from '../firebase'; // Using 'db' as the Firestore instance from firebase.ts
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, Timestamp, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { AIPersona, AiChatMessage } from '../types';

interface SaveAiInteractionParams {
  userId: string;
  userMessageText: string;
  aiMessageText: string;
  persona: AIPersona;
}

/**
 * Saves a user-AI interaction to Firestore.
 * This data can be used later to provide context to the AI for personalization.
 */
export const saveAiInteractionToFirestore = async ({
  userId,
  userMessageText,
  aiMessageText,
  persona,
}: SaveAiInteractionParams): Promise<void> => {
  if (!userId) {
    console.error("User ID is required to save AI interaction to Firestore.");
    return;
  }
  try {
    // Stores interactions in a subcollection 'ai_chat_history' under each user's document in the 'users' collection.
    const historyCollectionRef = collection(db, `users/${userId}/ai_chat_history`);
    await addDoc(historyCollectionRef, {
      userMessage: userMessageText,
      aiMessage: aiMessageText,
      persona: persona, // Storing the persona context for this interaction
      timestamp: serverTimestamp(), // Firestore server-side timestamp for ordering
    });
    // console.log("AI interaction saved to Firestore for user:", userId);
  } catch (error) {
    console.error("Error saving AI interaction to Firestore:", error);
    // Depending on requirements, this error could be handled more explicitly (e.g., notifying the user or retrying).
  }
};

interface StoredAiInteraction {
  userMessage: string;
  aiMessage: string;
  persona: AIPersona;
  timestamp: Timestamp; 
}

/**
 * Retrieves the most recent AI interactions for a user from Firestore.
 * @param userId The ID of the user.
 * @param limitCount The maximum number of recent interactions to retrieve.
 * @returns A Promise resolving to an array of interaction objects.
 */
export const getRecentAiInteractionsFromFirestore = async (
  userId: string,
  limitCount: number = 10
): Promise<Array<{ userMessage: string; aiMessage: string; persona: AIPersona }>> => {
  if (!userId) {
    console.warn("User ID is required to fetch AI interaction history.");
    return [];
  }
  try {
    const historyCollectionRef = collection(db, `users/${userId}/ai_chat_history`);
    const q = query(historyCollectionRef, orderBy("timestamp", "desc"), limit(limitCount));
    const querySnapshot = await getDocs(q);

    const interactions: Array<{ userMessage: string; aiMessage: string; persona: AIPersona }> = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as StoredAiInteraction; // Cast to expected structure
      interactions.push({
        userMessage: data.userMessage,
        aiMessage: data.aiMessage,
        persona: data.persona,
      });
    });
    
    return interactions.reverse(); // Reverse to get chronological order (oldest first) for prompt building
  } catch (error) {
    console.error("Error fetching AI interaction history from Firestore:", error);
    return [];
  }
};


/**
 * Saves a user's FCM token to Firestore, allowing for push notifications.
 * @param userId The ID of the user.
 * @param token The FCM token to save.
 */
export const saveFcmToken = async (userId: string, token: string): Promise<void> => {
    if (!userId || !token) {
        console.error("User ID and FCM token are required to save.");
        return;
    }
    try {
        // Store the token in a subcollection, using the token itself as the document ID for easy lookup and deduplication.
        const tokenDocRef = doc(db, `users/${userId}/fcmTokens`, token);
        await setDoc(tokenDocRef, { 
            createdAt: serverTimestamp(),
            platform: 'web' // You can add more metadata if needed
        });
    } catch (error) {
        console.error("Error saving FCM token to Firestore:", error);
    }
};

/**
 * Removes a user's FCM token from Firestore, opting them out of push notifications from that device.
 * @param userId The ID of the user.
 * @param token The FCM token to remove.
 */
export const removeFcmToken = async (userId: string, token: string): Promise<void> => {
    if (!userId || !token) {
        console.error("User ID and FCM token are required to remove.");
        return;
    }
    try {
        const tokenDocRef = doc(db, `users/${userId}/fcmTokens`, token);
        await deleteDoc(tokenDocRef);
    } catch (error) {
        console.error("Error removing FCM token from Firestore:", error);
    }
};
