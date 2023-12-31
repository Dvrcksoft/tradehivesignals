import { collection, doc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { create } from 'zustand';
import { AnnouncementModel } from '../models/model.announcement';
import { PinModel } from '../models/model.pin';
import { AuthUserModel } from '../models/model.authuser';
import { NotificationModel } from '../models/model.notification';
import { PostModel } from '../models/model.post';
import { AnalModel } from '../models/model.anal';
import { SratModel } from '../models/model.srat';
import { LessnModel } from '../models/model.lessn';
import { SignalModel } from '../models/model.signal';
import { VideoLessonModel } from '../models/model.video_lesson';
import { authClient, firestoreClient } from '../_firebase/firebase_client';

import { convertToDate } from '../utils/convert_to_date';
import { DashboardModel } from '../models/model.dashboard';
import { apiGetDashboardAggregation } from '../models_services/firestore_dashboard_service';
import { AppControlsPublicModel } from '../models/model.app_controls';
import { SymbolsAggr } from '../models/symbol_aggr';

type State = {
  isInitialized: boolean;
  isAuthenticated: boolean;
  authUser: AuthUserModel | null;
  hasAdminRole: boolean | null;
  streamFirebaseUser: () => void;
  streamAuthUserAdmin: () => void;

  dashboard: DashboardModel;
  apiControlsPublic: AppControlsPublicModel;

  signalsCryptoOpen: SignalModel[];
  signalsForexOpen: SignalModel[];
  signalsStocksOpen: SignalModel[];

  signalsCryptoClosed: SignalModel[];
  signalsForexClosed: SignalModel[];
  signalsStocksClosed: SignalModel[];

  announcements: AnnouncementModel[];
  pins: PinModel[];
  notifications: NotificationModel[];
  authUsers: AuthUserModel[];
  posts: PostModel[];
  anals: AnalModel[];
  srats: SratModel[];
  lessns: LessnModel[];
  videoLessons: VideoLessonModel[];
  subscriptions: any;

  symbolAggr: SymbolsAggr;

  getDashboard: () => void;
  streamAppControlsPublic: () => void;

  streamSignalsCryptoOpen: () => void;
  streamSignalsForexOpen: () => void;
  streamSignalsStocksOpen: () => void;

  streamSignalsCryptoClosed: () => void;
  streamSignalsForexClosed: () => void;
  streamSignalsStocksClosed: () => void;

  streamAnnouncements: () => void;
  streamPins: () => void;
  streamNotifications: () => void;
  streamAuthUsers: () => void;
  streamPostsSubscription: () => void;
  streamAnalsSubscription: () => void;
  streamSratsSubscription: () => void;
  streamLessnsSubscription: () => void;
  streamVideoLessonsSubscription: () => void;
  streamSymbolAggr: () => void;

  closeSubscriptions: () => void;

  isHandlePostSubmitCalled: boolean;
  setIsHandlePostSubmitCalled: (isHandlePostSubmitCalled: boolean) => void;

  isHandleAnalSubmitCalled: boolean;
  setIsHandleAnalSubmitCalled: (isHandleAnalSubmitCalled: boolean) => void;

  isHandleSratSubmitCalled: boolean;
  setIsHandleSratSubmitCalled: (isHandleSratSubmitCalled: boolean) => void;

  isHandleLessnSubmitCalled: boolean;
  setIsHandleLessnSubmitCalled: (isHandleLessnSubmitCalled: boolean) => void;


  isHandleTermsSubmitCalled: boolean;
  setIsHandleTermsSubmitCalled: (isHandleTermsSubmitCalled: boolean) => void;

  isHandlePrivacySubmitCalled: boolean;
  setIsHandlePrivacySubmitCalled: (isHandlePrivacySubmitCalled: boolean) => void;
};

export const useFirestoreStoreAdmin = create<State>((set, get) => ({
  isInitialized: false,
  isAuthenticated: false,
  authUser: null,
  hasAdminRole: null,
  dashboard: DashboardModel.fromJson({}),
  apiControlsPublic: AppControlsPublicModel.fromJson({}),

  subscriptions: {},

  signalsCryptoOpen: [],
  signalsForexOpen: [],
  signalsStocksOpen: [],

  signalsCryptoClosed: [],
  signalsForexClosed: [],
  signalsStocksClosed: [],

  announcements: [],
  pins: [],
  notifications: [],
  authUsers: [],
  posts: [],
  anals: [],
  srats: [],
  lessns: [],
  videoLessons: [],

  symbolAggr: SymbolsAggr.fromJson({}),

  isHandlePostSubmitCalled: false,
  isHandleAnalSubmitCalled: false,
  isHandleSratSubmitCalled: false,
  isHandleLessnSubmitCalled: false,
  isHandleTermsSubmitCalled: false,
  isHandlePrivacySubmitCalled: false,

  setIsHandlePostSubmitCalled: (isHandlePostSubmitCalled: boolean) => set({ isHandlePostSubmitCalled }),
  setIsHandleAnalSubmitCalled: (isHandleAnalSubmitCalled: boolean) => set({ isHandleAnalSubmitCalled }),
  setIsHandleSratSubmitCalled: (isHandleSratSubmitCalled: boolean) => set({ isHandleSratSubmitCalled }),
  setIsHandleLessnSubmitCalled: (isHandleLessnSubmitCalled: boolean) => set({ isHandleLessnSubmitCalled }),
  setIsHandleTermsSubmitCalled: (isHandleTermsSubmitCalled: boolean) => set({ isHandleTermsSubmitCalled }),
  setIsHandlePrivacySubmitCalled: (isHandlePrivacySubmitCalled: boolean) => set({ isHandlePrivacySubmitCalled }),

  getDashboard: async () => {
    const dashboard = await apiGetDashboardAggregation();

    set((state) => {
      return { ...state, dashboard };
    });
  },

  streamFirebaseUser: () => {
    authClient.onAuthStateChanged((u: any) => {
      set((state) => {
        return { ...state, isAuthenticated: u ? true : false, isInitialized: true };
      });

      if (!u) get().closeSubscriptions();
    });
  },

  streamSignalsCryptoOpen: () => {
    const q = query(collection(firestoreClient, 'signalsCrypto'), where('isClosed', '==', false), orderBy('timestampCreated', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const x = querySnapshot.docs.map((doc) => {
        return SignalModel.fromJson({ ...doc.data(), id: doc.id });
      });

      set((state) => {
        return { ...state, signalsCryptoOpen: x };
      });
    });

    set((state) => {
      return { ...state, subscriptions: { ...state.subscriptions, signalsCryptoOpen: unsubscribe } };
    });
  },

  streamSignalsCryptoClosed: () => {
    const q = query(collection(firestoreClient, 'signalsCrypto'), where('isClosed', '==', true), orderBy('timestampCreated', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const x = querySnapshot.docs.map((doc) => {
        return SignalModel.fromJson({ ...doc.data(), id: doc.id });
      });

      set((state) => {
        return { ...state, signalsCryptoClosed: x };
      });
    });

    set((state) => {
      return { ...state, subscriptions: { ...state.subscriptions, signalsCryptoClosed: unsubscribe } };
    });
  },

  streamAppControlsPublic: () => {
    const q = doc(firestoreClient, 'appControlsPublic', 'appControlsPublic');
    const unsubscribe = onSnapshot(q, (doc) => {
      const x = AppControlsPublicModel.fromJson({ ...doc.data(), id: doc.id });

      set((state) => {
        return { ...state, apiControlsPublic: x };
      });
    });

    set((state) => {
      return { ...state, subscriptions: { ...state.subscriptions, apiControlsPublic: unsubscribe } };
    });
  },

  streamSignalsForexOpen: () => {
    const q = query(collection(firestoreClient, 'signalsForex'), where('isClosed', '==', false), orderBy('timestampCreated', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const x = querySnapshot.docs.map((doc) => {
        return SignalModel.fromJson({ ...doc.data(), id: doc.id });
      });

      set((state) => {
        return { ...state, signalsForexOpen: x };
      });
    });

    set((state) => {
      return { ...state, subscriptions: { ...state.subscriptions, signalsForexOpen: unsubscribe } };
    });
  },

  streamSignalsForexClosed: () => {
    const q = query(collection(firestoreClient, 'signalsForex'), where('isClosed', '==', true), orderBy('timestampCreated', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const x = querySnapshot.docs.map((doc) => {
        return SignalModel.fromJson({ ...doc.data(), id: doc.id });
      });

      set((state) => {
        return { ...state, signalsForexClosed: x };
      });
    });

    set((state) => {
      return { ...state, subscriptions: { ...state.subscriptions, signalsForexClosed: unsubscribe } };
    });
  },

  streamSignalsStocksOpen: () => {
    const q = query(collection(firestoreClient, 'signalsStocks'), where('isClosed', '==', false), orderBy('timestampCreated', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const x = querySnapshot.docs.map((doc) => {
        return SignalModel.fromJson({ ...doc.data(), id: doc.id });
      });

      set((state) => {
        return { ...state, signalsStocksOpen: x };
      });
    });

    set((state) => {
      return { ...state, subscriptions: { ...state.subscriptions, signalsStocksOpen: unsubscribe } };
    });
  },

  streamSignalsStocksClosed: () => {
    const q = query(collection(firestoreClient, 'signalsStocks'), where('isClosed', '==', true), orderBy('timestampCreated', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const x = querySnapshot.docs.map((doc) => {
        return SignalModel.fromJson({ ...doc.data(), id: doc.id });
      });

      set((state) => {
        return { ...state, signalsStocksClosed: x };
      });
    });

    set((state) => {
      return { ...state, subscriptions: { ...state.subscriptions, signalsStocksClosed: unsubscribe } };
    });
  },

  streamAnnouncements: () => {
    const q = query(collection(firestoreClient, 'announcements'), orderBy('timestampCreated', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const x = querySnapshot.docs.map((doc) => {
        return AnnouncementModel.fromJson({ ...doc.data(), id: doc.id });
      });

      set((state) => {
        return { ...state, announcements: x };
      });
    });

    set((state) => {
      return { ...state, subscriptions: { ...state.subscriptions, announcements: unsubscribe } };
    });
  },

  streamPins: () => {
    const q = query(collection(firestoreClient, 'pins'), orderBy('timestampCreated', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const x = querySnapshot.docs.map((doc) => {
        return PinModel.fromJson({ ...doc.data(), id: doc.id });
      });

      set((state) => {
        return { ...state, pins: x };
      });
    });

    set((state) => {
      return { ...state, subscriptions: { ...state.subscriptions, pins: unsubscribe } };
    });
  },

  streamNotifications: () => {
    const q = query(collection(firestoreClient, 'notifications'), orderBy('timestampCreated', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const x = querySnapshot.docs.map((doc) => {
        return NotificationModel.fromJson({ ...doc.data(), id: doc.id });
      });

      set((state) => {
        return { ...state, notifications: x };
      });
    });

    set((state) => {
      return { ...state, subscriptions: { ...state.subscriptions, notifications: unsubscribe } };
    });
  },

  streamVideoLessonsSubscription: () => {
    const q = query(collection(firestoreClient, 'videoLessons'), orderBy('timestampCreated', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const x = querySnapshot.docs.map((doc) => {
        return VideoLessonModel.fromJson({ ...doc.data(), id: doc.id });
      });
      set((state) => {
        return { ...state, videoLessons: x };
      });
    });
    set((state) => {
      return { ...state, subscriptions: { ...state.subscriptions, videoLessons: unsubscribe } };
    });
  },
  streamSymbolAggr: () => {
    // stream single doc
    const unsubscribe = onSnapshot(doc(firestoreClient, 'symbolsAggr', 'symbolsAggr'), (doc) => {
      const x = SymbolsAggr.fromJson({ ...doc.data(), id: doc.id });
      set((state) => {
        return { ...state, symbolAggr: x };
      });

      set((state) => {
        return { ...state, subscriptions: { ...state.subscriptions, symbolAggr: unsubscribe } };
      });
    });
  },

  streamPostsSubscription: () => {
    const q = query(collection(firestoreClient, 'posts'), orderBy('timestampCreated', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const x = querySnapshot.docs.map((doc) => {
        return PostModel.fromJson({
          ...doc.data(),
          id: doc.id,
          timestampCreated: convertToDate(doc.data()!.timestampCreated),
          timestampUpdated: convertToDate(doc.data()!.timestampUpdated),
          postDate: convertToDate(doc.data()!.postDate),
          postDateTime: convertToDate(doc.data()!.postDateTime)
        });
      });

      set((state) => {
        return { ...state, posts: x };
      });
    });

    set((state) => {
      return { ...state, subscriptions: { ...state.subscriptions, posts: unsubscribe } };
    });
  },

  streamAnalsSubscription: () => {
    const q = query(collection(firestoreClient, 'anals'), orderBy('timestampCreated', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const x = querySnapshot.docs.map((doc) => {
        return AnalModel.fromJson({
          ...doc.data(),
          id: doc.id,
          timestampCreated: convertToDate(doc.data()!.timestampCreated),
          timestampUpdated: convertToDate(doc.data()!.timestampUpdated),
          analDate: convertToDate(doc.data()!.analDate),
          analDateTime: convertToDate(doc.data()!.analDateTime)
        });
      });

      set((state) => {
        return { ...state, anals: x };
      });
    });

    set((state) => {
      return { ...state, subscriptions: { ...state.subscriptions, anals: unsubscribe } };
    });
  },

  streamSratsSubscription: () => {
    const q = query(collection(firestoreClient, 'srats'), orderBy('timestampCreated', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const x = querySnapshot.docs.map((doc) => {
        return SratModel.fromJson({
          ...doc.data(),
          id: doc.id,
          timestampCreated: convertToDate(doc.data()!.timestampCreated),
          timestampUpdated: convertToDate(doc.data()!.timestampUpdated),
          sratDate: convertToDate(doc.data()!.sratDate),
          sratDateTime: convertToDate(doc.data()!.sratDateTime)
        });
      });

      set((state) => {
        return { ...state, srats: x };
      });
    });

    set((state) => {
      return { ...state, subscriptions: { ...state.subscriptions, srats: unsubscribe } };
    });
  },

  streamLessnsSubscription: () => {
    const q = query(collection(firestoreClient, 'lessns'), orderBy('timestampCreated', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const x = querySnapshot.docs.map((doc) => {
        return LessnModel.fromJson({
          ...doc.data(),
          id: doc.id,
          timestampCreated: convertToDate(doc.data()!.timestampCreated),
          timestampUpdated: convertToDate(doc.data()!.timestampUpdated),
          lessnDate: convertToDate(doc.data()!.lessnDate),
          lessnDateTime: convertToDate(doc.data()!.lessnDateTime)
        });
      });

      set((state) => {
        return { ...state, lessns: x };
      });
    });

    set((state) => {
      return { ...state, subscriptions: { ...state.subscriptions, lessns: unsubscribe } };
    });
  },

  streamAuthUsers: () => {
    const q = query(collection(firestoreClient, 'users'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const x = querySnapshot.docs.map((doc) => {
        return AuthUserModel.fromJson({ ...doc.data(), id: doc.id });
      });
      set((state) => {
        return { ...state, authUsers: x };
      });
    });

    set((state) => {
      return { ...state, subscriptions: { ...state.subscriptions, authUsers: unsubscribe } };
    });
  },

  streamAuthUserAdmin: () => {
    const fbuser = authClient.currentUser;
    if (!fbuser) return get().closeSubscriptions();

    const unsubscribe = onSnapshot(doc(firestoreClient, 'users', fbuser.uid), (doc) => {
      const user = AuthUserModel.fromJson({ ...doc.data(), id: doc.id });

      if (get().hasAdminRole !== user.hasAdminRole) {
        console.log(get().hasAdminRole, user.hasAdminRole);

        get().closeSubscriptions();

        if (user.hasAdminRole) {
          get().streamAppControlsPublic();
          get().streamSignalsCryptoOpen();
          get().streamSignalsForexOpen();
          get().streamSignalsStocksOpen();

          get().streamSignalsCryptoClosed();
          get().streamSignalsForexClosed();
          get().streamSignalsStocksClosed();

          get().streamAnnouncements();
          get().streamPins();
          get().streamNotifications();
          get().streamAuthUsers();
          get().streamPostsSubscription();
          get().streamAnalsSubscription();
          get().streamSratsSubscription();
          get().streamLessnsSubscription();
          get().streamVideoLessonsSubscription();
          get().streamSymbolAggr();
        }
      }

      set((state) => {
        return { ...state, authUser: user, hasAdminRole: user.hasAdminRole, authUserHasSubscriptions: user.getHasSubscription };
      });
    });
  },

  closeSubscriptions: () => {
    Object.values(get().subscriptions).forEach((unsubscribe: any) => unsubscribe());
    set((state) => {
      return { ...state, authUserHasSubscriptions: null, subscriptions: {} };
    });
  }
}));
