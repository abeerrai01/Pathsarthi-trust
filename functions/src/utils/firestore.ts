import * as admin from "firebase-admin";

export const getFirestore = () => admin.firestore();

// Add helper functions for common firestore operations here
export const getDocument = async (collection: string, docId: string) => {
  const doc = await getFirestore().collection(collection).doc(docId).get();
  if (doc.exists) {
    return { id: doc.id, ...doc.data() };
  }
  return null;
};
