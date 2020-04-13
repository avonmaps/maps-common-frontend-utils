import { Action, ActionCreatorsMapObject, CaseReducer, createReducer } from '@reduxjs/toolkit';

// todo: add a version where the second parameter can be a function
// todo: is this a good name?
export function createReducerTyped<State, A extends Action | ActionCreatorsMapObject>(
    initialState: State,
    caseReducers: CaseReducers<State, ResolveToActions<A>>,
) {
    return createReducer(initialState, caseReducers);
}

type ResolveToActions<A extends Action | ActionCreatorsMapObject> = A extends ActionCreatorsMapObject
    ? ReturnType<A[keyof A]>
    : A;

type CaseReducers<State, A extends Action> = {
    [T in A['type']]?: CaseReducer<State, Extract<A, { type: T }>>;
};
