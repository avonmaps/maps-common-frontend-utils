import { configureStore, createAction, getDefaultMiddleware, EnhancedStore, Reducer } from '@reduxjs/toolkit';
import createSagaMiddleware, { Saga, SagaMiddleware } from 'redux-saga';
import { cancel, fork, take } from 'redux-saga/effects';
import { ensure } from '../functions';

const reduxStoreSymbol = Symbol('__MapsReduxStore__');
const hmrAction = createAction('__HMR__');

export function createOrReuseHmrReadyReduxStore(rootReducer: Reducer, rootSaga: Saga, otherModule: NodeModule) {
    if (otherModule.hot === undefined) {
        return createStore(rootReducer, rootSaga).store;
    }

    otherModule.hot.accept(error => {
        console.error('[HMR] Error encountered during redux module evaluation', error);
    });

    const rootSagaWrapper = function* rootSagaWrapper() {
        yield fork(rootSaga);
        yield take(hmrAction.type);
        yield cancel();
    };

    const windowStore = window[reduxStoreSymbol];
    if (windowStore === undefined) {
        window[reduxStoreSymbol] = createStore(rootReducer, rootSagaWrapper);
        return ensure(window[reduxStoreSymbol]).store;
    }

    windowStore.store.dispatch(hmrAction());
    windowStore.store.replaceReducer(rootReducer);
    windowStore.sagaMiddleware.run(rootSagaWrapper);

    return windowStore.store;
}

function createStore(rootReducer: Reducer, rootSaga: Saga): StoreAndSagaMiddleware {
    const sagaMiddleware = createSagaMiddleware();

    const store = configureStore({
        reducer: rootReducer,
        middleware: [sagaMiddleware, ...getDefaultMiddleware()],
    });

    sagaMiddleware.run(rootSaga);
    return { store, sagaMiddleware };
}

type StoreAndSagaMiddleware = {
    store: EnhancedStore;
    sagaMiddleware: SagaMiddleware;
};

declare global {
    interface Window {
        [reduxStoreSymbol]?: StoreAndSagaMiddleware;
    }
}
