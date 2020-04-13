import NgRedux from 'ng-redux';
import { ActionCreatorsMapObject, Unsubscribe } from '@reduxjs/toolkit';
import { Prop } from '../../basic-types';
import { wrapPrototypeFunction } from '../../class-utils/wrap-prototype-function';

const onInitName = '$onInit';
const onDestroyName = '$onDestroy';
const ngReduxInjectableName = '$ngRedux';
const ngReduxSymbol = Symbol(ngReduxInjectableName);
const ngReduxSubscriptionSymbol = Symbol(`${ngReduxInjectableName}-connections`);

export class ReduxPropertyDecorationHandler<
    S,
    MS extends MappedState,
    AC extends ActionCreatorsMapObject,
    P extends Prop,
    SS extends symbol
> {
    private readonly timeoutId: number;
    private subscriptionSymbol?: SS;
    private prop?: P;

    constructor(private stateMapper: StateMapper<S, MS>, private actionCreators: AC) {
        this.timeoutId = window.setTimeout(this.missingClassDecoratorWarning.bind(this), 1000);
    }

    afterConstruct(instance: Instance<P, MS, AC, symbol>, prop: Prop) {
        window.clearTimeout(this.timeoutId);

        this.prop = prop as P;
        this.subscriptionSymbol = Symbol(`connection-${prop.toString()}`) as SS;
        wrapPrototypeFunction(instance, onInitName, true, this.beforeOnInit.bind(this));
        wrapPrototypeFunction(instance, onDestroyName, false, this.afterOnDestroy.bind(this));
    }

    private missingClassDecoratorWarning() {
        throw new Error('@injectNgRedux decorator is missing from class using initStore');
    }

    private beforeOnInit(instance: Instance<P, MS, AC, SS>) {
        const ngRedux = instance[ngReduxSymbol];
        if (ngRedux === undefined) {
            throw new Error('$ngRedux is not available. Use @injectNgRedux decorator on class');
        } else if (this.prop === undefined || this.subscriptionSymbol === undefined) {
            throw new Error(`[${this.constructor.name}]: prop and subscriptionSymbol fields cannot be undefined`);
        }
        // todo: isn't this always false as the decoration handler is assigned to prop?
        if (instance[this.prop] === undefined) {
            instance[this.prop] = {} as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        }
        const disconnect = ngRedux.connect(cloneResult(this.stateMapper), this.actionCreators)(instance[this.prop]);
        instance[ngReduxSubscriptionSymbol] = {
            ...instance[ngReduxSubscriptionSymbol],
            [this.subscriptionSymbol]: disconnect,
        } as { [key in SS]: Unsubscribe };
    }

    private afterOnDestroy(instance: Instance<P, MS, AC, SS>) {
        if (this.subscriptionSymbol === undefined) {
            throw new Error(`[${this.constructor.name}]: subscriptionSymbol field cannot be undefined`);
        }
        instance[ngReduxSubscriptionSymbol]?.[this.subscriptionSymbol]();
    }
}

// note: this causes issues if the mapped state has a recursive structure
function cloneResult<S, MS>(fn: (state: S) => MS) {
    return (state: S) => {
        return JSON.parse(JSON.stringify(fn(state))) as MS;
    };
}

export type MappedState = Record<string, unknown>;
export type StateMapper<S, R extends MappedState> = (state: S) => R;

type Instance<P extends Prop, MS extends MappedState, AC extends ActionCreatorsMapObject, SS extends symbol> = {
    [onInitName]?: Function;
    [onDestroyName]?: Function;
    [ngReduxSymbol]?: NgRedux.INgRedux;
} & {
    [ngReduxSubscriptionSymbol]?: { [key in SS]: Unsubscribe };
} & {
        [key in P]: MS & AC;
    };
