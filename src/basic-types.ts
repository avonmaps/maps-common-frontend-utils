export type Prop = string | symbol;

export type Function<Args extends unknown[], Return> = (...args: Args) => Return;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FunctionWithReturn<Return> = Function<any[], Return>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T = {}> = new (...args: any[]) => T;

type FnWithPromiseReturn = FunctionWithReturn<Promise<unknown>>;
export type UnwrapPromiseReturnType<F extends FnWithPromiseReturn> = ReturnType<F> extends Promise<infer R> ? R : never;
