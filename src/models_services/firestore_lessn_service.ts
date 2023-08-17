import { limit, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import { LessnModel } from '../models/model.lessn';
import { authClient, firestoreClient } from '../_firebase/firebase_client';
import { apiGetUser } from './firestore_user_service';

export async function apiCreateLessn(x: LessnModel): Promise<boolean> {
  try {
    const fbUser = authClient.currentUser;
    const user = await apiGetUser(fbUser!.uid);
    if (!user) throw new Error('No user found!');
    if (!user.isSuperAdmin && !user.isAdmin) throw new Error('You are not authorized to update links settings.');

    const qName = query(collection(firestoreClient, 'lessns'), where('name', '==', x.title));
    const qSlug = query(collection(firestoreClient, 'lessns'), where('slug', '==', x.slug));

    const qNameSnapshot = await getDocs(qName);
    const qSlugSnapshot = await getDocs(qSlug);

    if (qNameSnapshot.size > 0 || qSlugSnapshot.size > 0) {
      throw new Error('Strategy name or slug already exists');
    }

    await addDoc(collection(firestoreClient, 'lessns'), {
      ...LessnModel.toJson(x),
      timestampCreated: serverTimestamp(),
      timestampUpdated: serverTimestamp()
    });

    await apiAggregateLessns();

    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function apiUpdateLessn(id: string, x: LessnModel): Promise<boolean> {
  let lessn = { ...LessnModel.toJson(x), timestampUpdated: serverTimestamp() };
  delete lessn.timestampCreated;
  try {
    const fbUser = authClient.currentUser;
    const user = await apiGetUser(fbUser!.uid);
    if (!user) throw new Error('No user found!');
    if (!user.isSuperAdmin && !user.isAdmin) throw new Error('You are not authorized to update links settings.');

    await updateDoc(doc(firestoreClient, 'lessns', id), { ...lessn });
    await apiAggregateLessns();

    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function apiGetLessn(id: string): Promise<LessnModel | null> {
  try {
    const lessn = await getDoc(doc(firestoreClient, 'lessn', id));
    if (!lessn.data()) return null;
    return LessnModel.fromJson({
      ...lessn.data(),
      id: lessn.id
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function apiGetLessns() {
  try {
    const lessns = await getDocs(query(collection(firestoreClient, 'lessns'), where('status', '==', 'Published'), limit(50)));
    return lessns.docs.map((videoLesson) => {
      return LessnModel.fromJson({ ...videoLesson.data(), id: videoLesson.id });
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function apiDeleteLessn(id: string): Promise<boolean> {
  try {
    const fbUser = authClient.currentUser;
    const user = await apiGetUser(fbUser!.uid);
    if (!user) throw new Error('No user found!');
    if (!user.isSuperAdmin && !user.isAdmin) throw new Error('You are not authorized to update links settings.');

    await deleteDoc(doc(firestoreClient, 'lessns', id));
    await apiAggregateLessns();

    return true;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
}

export async function apiAggregateLessns(): Promise<boolean> {
  try {
    const signals = await apiGetLessns();

    const data = signals.map((signal) => {
      return LessnModel.toJson(signal);
    });

    await setDoc(doc(firestoreClient, 'lessnsAggr', 'lessns'), { data, timestampUpdated: serverTimestamp() });

    return true;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
}
