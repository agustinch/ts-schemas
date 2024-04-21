import { Endpoint } from './endpoint';
import 'reflect-metadata';

// Decorator to mark methods with route information
export function Route(verb: string, path: string) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata('route', { verb, path }, target[key]);
    return descriptor;
  };
}

export function Controller(basePath: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    constructor.prototype.basePath = basePath;
    Reflect.defineMetadata('controller', { basePath }, constructor.prototype);
  };
}

// Decorator to mark methods with request information
export function ApiRequest(requestClass: any) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata('request', requestClass, target[key]);

    return descriptor;
  };
}
