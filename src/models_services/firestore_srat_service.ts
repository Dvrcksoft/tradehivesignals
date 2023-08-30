import { limit, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import { SratModel } from '../models/model.srat';
import { authClient, firestoreClient } from '../_firebase/firebase_client';
import { apiGetUser } from './firestore_user_service';

export async function apiCreateSrat(x: SratModel): Promise<boolean> {
  try {
    const fbUser = authClient.currentUser;
    const user = await apiGetUser(fbUser!.uid);
    if (!user) throw new Error('No user found!');
    if (!user.isSuperAdmin && !user.isAdmin) throw new Error('You are not authorized to update links settings.');

    const qName = query(collection(firestoreClient, 'srats'), where('name', '==', x.title));
    const qSlug = query(collection(firestoreClient, 'srats'), where('slug', '==', x.slug));

    const qNameSnapshot = await getDocs(qName);
    const qSlugSnapshot = await getDocs(qSlug);

    if (qNameSnapshot.size > 0 || qSlugSnapshot.size > 0) {
      throw new Error('Strategy name or slug already exists');
    }

    await addDoc(collection(firestoreClient, 'srats'), {
      ...SratModel.toJson(x),
      timestampCreated: serverTimestamp(),
      timestampUpdated: serverTimestamp()
    });

    await apiAggregateSrats();

    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function apiUpdateSrat(id: string, x: SratModel): Promise<boolean> {
  let srat = { ...SratModel.toJson(x), timestampUpdated: serverTimestamp() };
  delete srat.timestampCreated;
  try {
    const fbUser = authClient.currentUser;
    const user = await apiGetUser(fbUser!.uid);
    if (!user) throw new Error('No user found!');
    if (!user.isSuperAdmin && !user.isAdmin) throw new Error('You are not authorized to update links settings.');

    await updateDoc(doc(firestoreClient, 'srats', id), { ...srat });
    await apiAggregateSrats();

    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function apiGetSrat(id: string): Promise<SratModel | null> {
  try {
    const srat = await getDoc(doc(firestoreClient, 'srats', id));
    if (!srat.data()) return null;
    return SratModel.fromJson({
      ...srat.data(),
      id: srat.id
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function apiGetSrats() {
  try {
    const srats = await getDocs(query(collection(firestoreClient, 'srats'), where('status', '==', 'Published'), limit(50)));
    return srats.docs.map((videoLesson) => {
      return SratModel.fromJson({ ...videoLesson.data(), id: videoLesson.id });
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function apiDeleteSrat(id: string): Promise<boolean> {
  try {
    const fbUser = authClient.currentUser;
    const user = await apiGetUser(fbUser!.uid);
    if (!user) throw new Error('No user found!');
    if (!user.isSuperAdmin && !user.isAdmin) throw new Error('You are not authorized to update links settings.');

    await deleteDoc(doc(firestoreClient, 'srats', id));
    await apiAggregateSrats();

    return true;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
}

export async function apiAggregateSrats(): Promise<boolean> {
  try {
    const signals = await apiGetSrats();

    const data = signals.map((signal) => {
      return SratModel.toJson(signal);
    });

    await setDoc(doc(firestoreClient, 'sratsAggr', 'srats'), { data, timestampUpdated: serverTimestamp() });

    return true;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
}
