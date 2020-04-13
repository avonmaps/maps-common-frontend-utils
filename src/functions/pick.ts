export function pick<O, P extends keyof O>(obj: O, ...props: P[]): Pick<O, P> {
    return props.reduce((result, prop) => {
        result[prop] = obj[prop];
        return result;
    }, {} as Pick<O, P>);
}

export function picker<O, P extends keyof O>(...props: P[]): (o: O) => Pick<O, P> {
    return (obj: O) => pick(obj, ...props);
}
