import { PayloadActionCreator } from '@reduxjs/toolkit';
import { takeEvery } from 'redux-saga/effects';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function takeEverySafe<PAC extends PayloadActionCreator<any>>(
    actionCreator: PAC,
    worker: (action: ReturnType<PAC>) => unknown,
) {
    return takeEvery(actionCreator.type, worker);
}
