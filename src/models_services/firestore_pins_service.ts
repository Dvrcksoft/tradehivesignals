import axios from 'axios';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { PinModel } from '../models/model.pin';
import { authClient, firestoreClient } from '../_firebase/firebase_client';
import { apiGetUser } from './firestore_user_service';

/* ------------------------------ NOTE Pin ----------------------------- */
export async function apiCreatePin(x: PinModel) {
  try {
    const fbUser = authClient.currentUser;
    const user = await apiGetUser(fbUser!.uid);
    if (!user) throw new Error('No user found!');
    if (!user.isSuperAdmin && !user.isAdmin) throw new Error('You are not authorized to create pins.');

    const jsonWebToken = await authClient.currentUser?.getIdToken(true);
    await addDoc(collection(firestoreClient, 'pins'), { ...PinModel.toJson(x), timestampCreated: serverTimestamp() });
    await apiAggregatePins();
    await axios.post(`/api/notifications`, { title: x.title, body: x.body.substring(0, 50), jsonWebToken });
    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function apiUpdatePin(id: string, pin: PinModel) {
  const _pin = { ...PinModel.toJson(pin), timestampUpdated: serverTimestamp() };
  delete _pin.timestampCreated;

  try {
    const fbUser = authClient.currentUser;
    const user = await apiGetUser(fbUser!.uid);
    if (!user) throw new Error('No user found!');
    if (!user.isSuperAdmin && !user.isAdmin) throw new Error('You are not authorized to update pins.');

    await updateDoc(doc(firestoreClient, 'pins', id), { ..._pin });
    await apiAggregatePins();

    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function apiGetPin(id: string) {
  try {
    const pin = await getDoc(doc(firestoreClient, 'pins', id));
    if (!pin.data()) return null;
    return PinModel.fromJson({ ...pin.data(), id: pin.id });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function apiGetPins(amt: number = 50) {
  try {
    const annoucements = await getDocs(query(collection(firestoreClient, 'pins'), limit(amt)));
    return annoucements.docs.map((videoLesson) => {
      return PinModel.fromJson({ ...videoLesson.data(), id: videoLesson.id });
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function apiDeletePin(id: string) {
  try {
    const fbUser = authClient.currentUser;
    const user = await apiGetUser(fbUser!.uid);
    if (!user) throw new Error('No user found!');
    if (!user.isSuperAdmin && !user.isAdmin) throw new Error('You are not authorized to create pins.');

    await deleteDoc(doc(firestoreClient, 'pins', id));
    await apiAggregatePins();
    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function apiAggregatePins(): Promise<boolean> {
  try {
    const signals = await apiGetPins(50);

    const data: PinModel[] = signals.map((signal) => {
      return PinModel.toJson(signal);
    });

    // sort by timestampCreated descending
    data.sort((a, b) => {
      return b.timestampCreated!.getTime() - a.timestampCreated!.getTime();
    });

    await setDoc(doc(firestoreClient, 'pinsAggr', 'pins'), { data, timestampUpdated: serverTimestamp() });

    return true;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
}
