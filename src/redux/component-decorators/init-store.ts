import { ActionCreatorsMapObject } from '@reduxjs/toolkit';
import { MappedState, ReduxPropertyDecorationHandler, StateMapper } from './redux-property-decoration-handler';

export function initStore<S, MS extends MappedState, AC extends ActionCreatorsMapObject>(
    stateMapper: StateMapper<S, MS> = () => ({} as MS),
    actionCreators: AC = {} as AC,
) {
    return (new ReduxPropertyDecorationHandler(stateMapper, actionCreators) as unknown) as MS & AC;
}

export function initSelector<S, MS extends MappedState>(stateMapper: StateMapper<S, MS>) {
    return initStore(stateMapper, {});
}

export function initActionCreators<AC extends ActionCreatorsMapObject>(actionCreators: AC) {
    return initStore(undefined, actionCreators);
}
