import { Constructor, Prop } from '../basic-types';

// todo: is angularjsInject the best name for this?
export function angularjsInject<P extends Prop>(injectableName: string, prop: P) {
    return <C extends Constructor>(target: C): C => {
        const originalInject = target.$inject || [];
        return class extends target {
            static $inject = [injectableName, ...originalInject];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            constructor(...[injectedArg, ...originalArgs]: any[]) {
                super(...originalArgs);

                ((this as unknown) as { [key in P]: unknown })[prop] = injectedArg;
            }
        };
    };
}
