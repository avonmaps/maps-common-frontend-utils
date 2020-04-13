const DEFAULT_MESSAGE = 'This value was promised to be there.';

export function ensure<T>(argument: T | undefined | null, message = DEFAULT_MESSAGE): T {
    if (argument === undefined || argument === null) {
        throw new TypeError(message);
    }

    return argument;
}
