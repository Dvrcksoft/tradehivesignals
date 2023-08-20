import axios from 'axios';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { SignalModel } from '../models/model.signal';
import { authClient, firestoreClient } from '../_firebase/firebase_client';
import { apiGetUser } from './firestore_user_service';
import subDays from 'date-fns/subDays';

/* ------------------------------- NOTE SIGNALS ------------------------------ */

interface ISignalForm {
  id?: string;
  signal?: SignalModel;
  sendNotification?: boolean;
  dbPath: string;
  isClosed?: boolean;
}
export async function apiCreateSignal({ signal, sendNotification, dbPath = 'signalsCrypto' }: ISignalForm): Promise<boolean> {
  if (!signal) throw new Error('No signal provided!');
  try {
    const fbUser = authClient.currentUser;
    const user = await apiGetUser(fbUser!.uid);
    if (!user) throw new Error('No user found!');
    if (!user.isSuperAdmin && !user.isAdmin) throw new Error('You are not authorized to create signals.');

    const jsonWebToken = await authClient.currentUser?.getIdToken(true);

    await addDoc(collection(firestoreClient, dbPath), {
      ...SignalModel.toJson(signal),
      timestampCreated: serverTimestamp(),
      timestampUpdated: serverTimestamp(),
      timestampLastAutoCheck: serverTimestamp()
    });

    await apiAggregateSignals({ dbPath });
    await apiSignalAggrPerfromance({ dbPath });

    if (sendNotification)
      await axios.post(`/api/notifications`, { title: 'Signal', body: `New ${signal.symbol} signal added`, jsonWebToken, runAggregation: true });
    return true;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
}

export async function apiUpdateSignal({
  id,
  signal,
  sendNotification,
  dbPath = 'signalsCrypto',
  isClosed = false
}: ISignalForm): Promise<boolean> {
  if (!id) throw new Error('No id provided!');
  if (!signal) throw new Error('No signal provided!');

  try {
    const fbUser = authClient.currentUser;
    const user = await apiGetUser(fbUser!.uid);
    if (!user) throw new Error('No user found!');
    if (!user.isSuperAdmin && !user.isAdmin) throw new Error('You are not authorized to create signals.');

    const jsonWebToken = await authClient.currentUser?.getIdToken(true);

    const signal_json = SignalModel.toJson(signal);
    delete signal_json.timestampLastAutoCheck;

    if (!isClosed) {
      await updateDoc(doc(firestoreClient, dbPath, id), { ...SignalModel.toJson(signal_json), timestampUpdated: serverTimestamp() });
      if (sendNotification)
        await axios.post(`/api/notifications`, { title: 'Signal', body: `${signal.symbol} Signal updated`, jsonWebToken, runAggregation: true });
    }

    if (isClosed) {
      await updateDoc(doc(firestoreClient, dbPath, id), {
        ...SignalModel.toJson(signal_json),
        isClosedManual: true,
        isClosedAuto: false,
        isClosed: true,
        timestampClosed: serverTimestamp()
      });
      if (sendNotification)
        await axios.post(`/api/notifications`, {
          title: 'Signal',
          body: `${signal.symbol} Signal closed closed`,
          jsonWebToken,
          runAggregation: true
        });
    }

    await apiAggregateSignals({ dbPath });
    await apiSignalAggrPerfromance({ dbPath });

    return true;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
}

export async function apiUpdateSignalCloseManually({ id, sendNotification, dbPath = 'signalsCrypto', signal }: ISignalForm): Promise<boolean> {
  if (!id) throw new Error('No id provided!');
  if (!signal) throw new Error('No signal provided!');

  try {
    const fbUser = authClient.currentUser;
    const user = await apiGetUser(fbUser!.uid);
    if (!user) throw new Error('No user found!');
    if (!user.isSuperAdmin && !user.isAdmin) throw new Error('You are not authorized to create signals.');

    const jsonWebToken = await authClient.currentUser?.getIdToken(true);

    await updateDoc(doc(firestoreClient, dbPath, id), {
      ...SignalModel.toJson(signal),
      isClosedManual: true,
      isClosedAuto: false,
      isClosed: true,
      timestampClosed: serverTimestamp()
    });

    if (sendNotification)
      await axios.post(`/api/notifications`, { title: 'Signal', body: 'Signal closed added', jsonWebToken, runAggregation: true });

    await apiAggregateSignals({ dbPath });
    await apiSignalAggrPerfromance({ dbPath });
    return true;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
}

export async function apiGetSignal({ id, dbPath }: ISignalForm): Promise<SignalModel | null> {
  if (!id) throw new Error('No id provided!');
  try {
    const x = await getDoc(doc(firestoreClient, dbPath, id));
    if (!x.data()) return null;
    return SignalModel.fromJson({ ...x.data(), id: x.id });
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function apiDeleteSignal({ id, dbPath }: ISignalForm): Promise<boolean> {
  if (!id) throw new Error('No id provided!');
  try {
    const fbUser = authClient.currentUser;
    const user = await apiGetUser(fbUser!.uid);
    if (!user) throw new Error('No user found!');
    if (!user.isSuperAdmin && !user.isAdmin) throw new Error('You are not authorized to delete signals.');

    await deleteDoc(doc(firestoreClient, dbPath, id));
    await apiAggregateSignals({ dbPath });
    await apiSignalAggrPerfromance({ dbPath });

    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
export async function apiGetSignalsOpen({ dbPath }: { dbPath: string }): Promise<SignalModel[]> {
  try {
    const x = await getDocs(query(collection(firestoreClient, dbPath), where('isClosed', '==', false)));
    const vals = x.docs.map((doc) => SignalModel.fromJson({ ...doc.data(), id: doc.id }));
    // sort by getEntryDateTime decs
    return vals.sort((a, b) => (a.getEntryDateTime > b.getEntryDateTime ? -1 : 1));
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function apiAggregateSignals({ dbPath }: { dbPath: string }): Promise<boolean> {
  try {
    const signals = await apiGetSignalsOpen({ dbPath });
    const data = signals.map((signal) => {
      return SignalModel.toJson(signal);
    });

    let docPath = 'crypto';
    if (dbPath === 'signalsForex') docPath = 'forex';
    if (dbPath === 'signalsStocks') docPath = 'stocks';

    const hasData = data.length > 0;
    await setDoc(doc(firestoreClient, 'signalsAggrOpen', docPath), { data, hasData, timestampUpdated: serverTimestamp() }, { merge: true });

    return true;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
}

export async function apiSignalAggrPerfromance({ dbPath }: { dbPath: string }): Promise<boolean> {
  try {
    const days30Ago = subDays(new Date(), 30);

    const x = await getDocs(query(collection(firestoreClient, dbPath), where('entryDateTime', '>', days30Ago)));
    let signals30Days = x.docs.map((doc) => SignalModel.fromJson({ ...doc.data(), id: doc.id }));
    signals30Days = signals30Days.filter((signal) => signal.takeProfit1DateTime || signal.stopLossDateTime);

    const signals14Days = signals30Days.filter((signal) => signal.getEntryDateTime > subDays(new Date(), 14));
    const signals7Days = signals30Days.filter((signal) => signal.getEntryDateTime > subDays(new Date(), 7));

    const trades30Days = signals30Days.length;
    const trades14Days = signals14Days.length;
    const trades7Days = signals7Days.length;

    const wins30Days = signals30Days.filter((signal) => signal.takeProfit1Hit).length;
    const wins14Days = signals14Days.filter((signal) => signal.takeProfit1Hit).length;
    const wins7Days = signals7Days.filter((signal) => signal.takeProfit1Hit).length;

    const winRate30Days = trades30Days > 0 ? wins30Days / trades30Days : 0;
    const winRate14Days = trades14Days > 0 ? wins14Days / trades14Days : 0;
    const winRate7Days = trades7Days > 0 ? wins7Days / trades7Days : 0;

    const performance7Days = { trades: trades7Days, profitPercentPerTrade: 0, wins: wins7Days, winRate: winRate7Days };
    const performance14Days = { trades: trades14Days, profitPercentPerTrade: 0, wins: wins14Days, winRate: winRate14Days };
    const performance30Days = { trades: trades30Days, profitPercentPerTrade: 0, wins: wins30Days, winRate: winRate30Days };

    let docPath = 'crypto';
    if (dbPath === 'signalsForex') docPath = 'forex';
    if (dbPath === 'signalsStocks') docPath = 'stocks';

    await setDoc(
      doc(firestoreClient, 'signalsAggrOpen', docPath),
      { performance7Days, performance14Days, performance30Days, timestampUpdated: serverTimestamp() },
      { merge: true }
    );

    return true;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
}
