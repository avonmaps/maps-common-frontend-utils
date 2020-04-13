import { FunctionWithReturn, Prop } from '../basic-types';

export function wrapPrototypeFunction<P extends Prop, Instance, R>(
    prototype: { [k in P]?: FunctionWithReturn<R> },
    prop: P,
    execBefore: boolean,
    wrapperFunction: (instance: Instance) => void,
) {
    const defaultFunction = () => (undefined as unknown) as R;
    const originalFunctionOrUndefined = prototype[prop];
    const originalFunction = isFunction(originalFunctionOrUndefined) ? originalFunctionOrUndefined : defaultFunction;
    prototype[prop] = function wrappedFunction(this: Instance, ...args: unknown[]): R {
        if (execBefore) {
            wrapperFunction(this);
        }
        const result = originalFunction.call(this, ...args);
        if (!execBefore) {
            wrapperFunction(this);
        }
        return result;
    };
}

function isFunction<R>(fn: undefined | FunctionWithReturn<R>): fn is FunctionWithReturn<R> {
    return typeof fn === 'function';
}
