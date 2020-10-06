export class ServiceRegistry<T> {
    private constructor(private registry: T) {
    }

    public register<K extends string, S>(key: K, service: S): ServiceRegistry<Record<K, S> & T> {
        // add service to registry and return the same object with a narrowed type
        (this.registry as any)[key] = service;
        return this as any as ServiceRegistry<Record<K, S> & T>;
    }

    public get<K extends keyof T>(key: K): T[K] {
        if (!(key in this.registry)) {
            throw new Error('Invalid type' + key);
        }
        return this.registry[key];
    }

    public static init(): ServiceRegistry<{}> {
        return new ServiceRegistry({});
    }
}
