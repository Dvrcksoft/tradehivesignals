import { limit, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import { StrategModel } from '../models/model.strateg';
import { authClient, firestoreClient } from '../_firebase/firebase_client';
import { apiGetUser } from './firestore_user_service';

export async function apiCreateStrateg(x: StrategModel): Promise<boolean> {
  try {
    const fbUser = authClient.currentUser;
    const user = await apiGetUser(fbUser!.uid);
    if (!user) throw new Error('No user found!');
    if (!user.isSuperAdmin && !user.isAdmin) throw new Error('You are not authorized to update links settings.');

    const qName = query(collection(firestoreClient, 'strategy'), where('name', '==', x.title));
    const qSlug = query(collection(firestoreClient, 'strategy'), where('slug', '==', x.slug));

    const qNameSnapshot = await getDocs(qName);
    const qSlugSnapshot = await getDocs(qSlug);

    if (qNameSnapshot.size > 0 || qSlugSnapshot.size > 0) {
      throw new Error('Strategy name or slug already exists');
    }

    await addDoc(collection(firestoreClient, 'strategy'), {
      ...StrategModel.toJson(x),
      timestampCreated: serverTimestamp(),
      timestampUpdated: serverTimestamp()
    });

    await apiAggregateStrategy();

    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function apiUpdateStrateg(id: string, x: StrategModel): Promise<boolean> {
  let strateg = { ...StrategModel.toJson(x), timestampUpdated: serverTimestamp() };
  delete strateg.timestampCreated;
  try {
    const fbUser = authClient.currentUser;
    const user = await apiGetUser(fbUser!.uid);
    if (!user) throw new Error('No user found!');
    if (!user.isSuperAdmin && !user.isAdmin) throw new Error('You are not authorized to update links settings.');

    await updateDoc(doc(firestoreClient, 'strategy', id), { ...strateg });
    await apiAggregateStrategy();

    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function apiGetStrateg(id: string): Promise<StrategModel | null> {
  try {
    const strateg = await getDoc(doc(firestoreClient, 'strategy', id));
    if (!strateg.data()) return null;
    return StrategModel.fromJson({
      ...strateg.data(),
      id: strateg.id
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function apiGetStrategy() {
  try {
    const strategy = await getDocs(query(collection(firestoreClient, 'strategy'), where('status', '==', 'Published'), limit(50)));
    return strategy.docs.map((videoLesson) => {
      return StrategModel.fromJson({ ...videoLesson.data(), id: videoLesson.id });
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function apiDeleteStrateg(id: string): Promise<boolean> {
  try {
    const fbUser = authClient.currentUser;
    const user = await apiGetUser(fbUser!.uid);
    if (!user) throw new Error('No user found!');
    if (!user.isSuperAdmin && !user.isAdmin) throw new Error('You are not authorized to update links settings.');

    await deleteDoc(doc(firestoreClient, 'strategy', id));
    await apiAggregateStrategy();

    return true;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
}

export async function apiAggregateStrategy(): Promise<boolean> {
  try {
    const signals = await apiGetStrategy();

    const data = signals.map((signal) => {
      return StrategModel.toJson(signal);
    });

    await setDoc(doc(firestoreClient, 'strategyAggr', 'strategy'), { data, timestampUpdated: serverTimestamp() });

    return true;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
}
