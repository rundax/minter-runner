import {BaseModule} from '@Core/BaseModule';

export class ModuleRegistry<T> {

    private registry: T;

    private constructor(registry: T) {
        this.registry = registry;
    }

    public register<K extends string, S>(key: K, service: S): ModuleRegistry<Record<K, S> & T> {
        // add service to registry and return the same object with a narrowed type
        (this.registry as any)[key] = service;
        return this as any as ModuleRegistry<Record<K, S> & T>;
    }

    public get<K extends keyof T>(key: K): T[K] {
        if (!(key in this.registry)) {
            throw new Error('Invalid type' + key);
        }
        return this.registry[key];
    }

    public static init(): ModuleRegistry<{}> {
        return new ModuleRegistry({});
    }

}
