// tslint:disable:max-line-length

import type { Observable } from "rxjs"


export type Omit1Parameter<T extends (p1: any, ...args: any) => any> = T extends (p1: any, ...args: infer P) => any ? P : never
export type Omit2Parameter<T extends (p1: any, p2: any, ...args: any) => any> = T extends (p1: any, p2: any, ...args: infer P) => any ? P : never
export type Omit3Parameter<T extends (p1: any, p2: any, p3: any, ...args: any) => any> = T extends (p1: any, p2: any, p3: any, ...args: infer P) => any ? P : never
export type Omit4Parameter<T extends (p1: any, p2: any, p3: any, p4: any, ...args: any) => any> = T extends (p1: any, p2: any, p3: any, p4: any, ...args: infer P) => any ? P : never
export type Omit5Parameter<T extends (p1: any, p2: any, p3: any, p4: any, p5: any, ...args: any) => any> = T extends (p1: any, p2: any, p3: any, p4: any, p5: any, ...args: infer P) => any ? P : never


export type UnpackObservable<O> = O extends Observable<infer T> ? T : never
