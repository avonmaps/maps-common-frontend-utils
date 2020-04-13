import { angularjsInject } from '../../angularjs/angularjs-inject';
import { Constructor } from '../../basic-types';
import { ReduxPropertyDecorationHandler } from './redux-property-decoration-handler';

const ngReduxInjectableName = '$ngRedux';
const ngReduxSymbol = Symbol(ngReduxInjectableName);

export function injectNgRedux<C extends Constructor>(target: C): C {
    return class extends angularjsInject(ngReduxInjectableName, ngReduxSymbol)(target) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(...args: any[]) {
            super(...args);

            const checkProperty = <P extends string | symbol>(prop: P) => {
                const value = ((this as unknown) as { [p in P]: unknown })[prop];
                if (value instanceof ReduxPropertyDecorationHandler) {
                    value.afterConstruct(this as any, prop); // eslint-disable-line @typescript-eslint/no-explicit-any
                }
            };
            Object.getOwnPropertyNames(checkProperty);
            // todo: check that this works
            Object.getOwnPropertySymbols(checkProperty);
        }
    };
}
