import { deleteDoc, doc } from 'firebase/firestore';
import { authClient, firestoreClient } from '../_firebase/firebase_client';
import { apiGetUser } from './firestore_user_service';

/* ------------------------------ NOTE NOTIFICATION -------------------------- */

export async function apiDeleteNotification(id: string) {
  try {
    const fbUser = authClient.currentUser;
    const user = await apiGetUser(fbUser!.uid);
    if (!user) throw new Error('No user found!');
    if (!user.isSuperAdmin && !user.isAdmin) throw new Error('You are not authorized to create notifications.');

    await deleteDoc(doc(firestoreClient, 'notifications', id));
    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
