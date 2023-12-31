import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { DashboardModel } from '../models/model.dashboard';
import { firestoreClient } from '../_firebase/firebase_client';

export async function apiGetDashboardAggregation(): Promise<DashboardModel> {
  try {
    const collusers = query(collection(firestoreClient, 'users'));
    const usersSnapshot = await getCountFromServer(collusers);
    const totalUsers = usersSnapshot.data().count;

    const collVideoLessons = query(collection(firestoreClient, 'videoLessons'), where('status', '==', 'Published'));
    const videoLessonsSnapshot = await getCountFromServer(collVideoLessons);
    const totalVideoLessons = videoLessonsSnapshot.data().count;

    const collAnnouncements = query(collection(firestoreClient, 'announcements'));
    const announcementsSnapshot = await getCountFromServer(collAnnouncements);
    const totalAnnouncements = announcementsSnapshot.data().count;

    const collPins = query(collection(firestoreClient, 'pins'));
    const pinsSnapshot = await getCountFromServer(collPins);
    const totalPins = pinsSnapshot.data().count;

    const collSignalsForexOpen = query(collection(firestoreClient, 'signalsForex'), where('isClosed', '==', false));
    const signalsForexSnapshotOpen = await getCountFromServer(collSignalsForexOpen);
    const totalSignalsForexOpen = signalsForexSnapshotOpen.data().count;

    const collSignalsForexClosed = query(collection(firestoreClient, 'signalsForex'), where('isClosed', '==', true));
    const signalsForexSnapshotClosed = await getCountFromServer(collSignalsForexClosed);
    const totalSignalsForexClosed = signalsForexSnapshotClosed.data().count;

    const collSignalsCryptoOpen = query(collection(firestoreClient, 'signalsCrypto'), where('isClosed', '==', false));
    const signalsCryptoSnapshotOpen = await getCountFromServer(collSignalsCryptoOpen);
    const totalSignalsCryptoOpen = signalsCryptoSnapshotOpen.data().count;

    const collSignalsCryptoClosed = query(collection(firestoreClient, 'signalsCrypto'), where('isClosed', '==', true));
    const signalsCryptoSnapshotClosed = await getCountFromServer(collSignalsCryptoClosed);
    const totalSignalsCryptoClosed = signalsCryptoSnapshotClosed.data().count;

    const collSignalsStocksOpen = query(collection(firestoreClient, 'signalsStocks'), where('isClosed', '==', false));
    const signalsStocksSnapshotOpen = await getCountFromServer(collSignalsStocksOpen);
    const totalSignalsStocksOpen = signalsStocksSnapshotOpen.data().count;

    const collSignalsStocksClosed = query(collection(firestoreClient, 'signalsStocks'), where('isClosed', '==', true));
    const signalsStocksSnapshotClosed = await getCountFromServer(collSignalsStocksClosed);
    const totalSignalsStocksClosed = signalsStocksSnapshotClosed.data().count;

    const collPosts = query(collection(firestoreClient, 'posts'));
    const postsSnapshot = await getCountFromServer(collPosts);
    const totalPosts = postsSnapshot.data().count;

    const collAnals = query(collection(firestoreClient, 'anals'));
    const analsSnapshot = await getCountFromServer(collAnals);
    const totalAnals = analsSnapshot.data().count;
    
    const collSrats = query(collection(firestoreClient, 'srats'));
    const sratsSnapshot = await getCountFromServer(collSrats);
    const totalSrats = sratsSnapshot.data().count;

    const collLessns = query(collection(firestoreClient, 'lessns'));
    const lessnsSnapshot = await getCountFromServer(collLessns);
    const totalLessns = lessnsSnapshot.data().count;


    return DashboardModel.fromJson({
      totalUsers,
      totalVideoLessons,
      totalAnnouncements,
      totalPins,
      totalSignalsForexOpen,
      totalSignalsForexClosed,
      totalSignalsStocksOpen,
      totalSignalsStocksClosed,
      totalSignalsCryptoOpen,
      totalSignalsCryptoClosed,
      totalPosts,
      totalAnals,
      totalSrats,
      totalLessns
    });
  } catch (error) {
    return DashboardModel.fromJson({});
  }
}
