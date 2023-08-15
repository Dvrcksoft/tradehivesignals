import { limit, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import { AnalModel } from '../models/model.anal';
import { authClient, firestoreClient } from '../_firebase/firebase_client';
import { apiGetUser } from './firestore_user_service';

export async function apiCreateAnal(x: AnalModel): Promise<boolean> {
  try {
    const fbUser = authClient.currentUser;
    const user = await apiGetUser(fbUser!.uid);
    if (!user) throw new Error('No user found!');
    if (!user.isSuperAdmin && !user.isAdmin) throw new Error('You are not authorized to update links settings.');

    const qName = query(collection(firestoreClient, 'anals'), where('name', '==', x.title));
    const qSlug = query(collection(firestoreClient, 'anals'), where('slug', '==', x.slug));

    const qNameSnapshot = await getDocs(qName);
    const qSlugSnapshot = await getDocs(qSlug);

    if (qNameSnapshot.size > 0 || qSlugSnapshot.size > 0) {
      throw new Error('analytic name or slug already exists');
    }

    await addDoc(collection(firestoreClient, 'anals'), {
      ...AnalModel.toJson(x),
      timestampCreated: serverTimestamp(),
      timestampUpdated: serverTimestamp()
    });

    await apiAggregateAnals();

    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function apiUpdateAnal(id: string, x: AnalModel): Promise<boolean> {
  let anal = { ...AnalModel.toJson(x), timestampUpdated: serverTimestamp() };
  delete anal.timestampCreated;
  try {
    const fbUser = authClient.currentUser;
    const user = await apiGetUser(fbUser!.uid);
    if (!user) throw new Error('No user found!');
    if (!user.isSuperAdmin && !user.isAdmin) throw new Error('You are not authorized to update links settings.');

    await updateDoc(doc(firestoreClient, 'anals', id), { ...anal });
    await apiAggregateAnals();

    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function apiGetAnal(id: string): Promise<AnalModel | null> {
  try {
    const anal = await getDoc(doc(firestoreClient, 'anals', id));
    if (!anal.data()) return null;
    return AnalModel.fromJson({
      ...anal.data(),
      id: anal.id
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function apiGetAnals() {
  try {
    const anals = await getDocs(query(collection(firestoreClient, 'anals'), where('status', '==', 'Published'), limit(50)));
    return anals.docs.map((videoLesson) => {
      return AnalModel.fromJson({ ...videoLesson.data(), id: videoLesson.id });
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function apiDeleteAnal(id: string): Promise<boolean> {
  try {
    const fbUser = authClient.currentUser;
    const user = await apiGetUser(fbUser!.uid);
    if (!user) throw new Error('No user found!');
    if (!user.isSuperAdmin && !user.isAdmin) throw new Error('You are not authorized to update links settings.');

    await deleteDoc(doc(firestoreClient, 'anals', id));
    await apiAggregateAnals();

    return true;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
}

export async function apiAggregateAnals(): Promise<boolean> {
  try {
    const signals = await apiGetAnals();

    const data = signals.map((signal) => {
      return AnalModel.toJson(signal);
    });

    await setDoc(doc(firestoreClient, 'analsAggr', 'anals'), { data, timestampUpdated: serverTimestamp() });

    return true;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
}
