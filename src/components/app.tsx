import xs, { Stream } from 'xstream';
import { VNode, DOMSource } from '@cycle/dom';
import { extractSinks } from 'cyclejs-utils';
import isolate from '@cycle/isolate';

import { driverNames } from '../drivers';
import { Sources, Sinks, Reducer, Component } from '../interfaces';

import { Counter, State as CounterState } from './counter';
import { Speaker, State as SpeakerState } from './speaker';
import { Form, State as FormState } from './form';
import { List, State as ListState } from './list';

export interface State {
    counter?: CounterState;
    speaker?: SpeakerState;
    form?: FormState;
    list?: ListState;
}

export function App(sources: Sources<State>): Sinks<State> {
    let request$ = xs.of({
        url:
            'https://hackathon-funcional-c5efe81488.herokuapp.com/hackathon-funcional-server/dev',
        method: 'POST',
        category: 'hello'
    });

    const match$ = sources.router.define({
        '/counter': isolate(Counter, 'counter'),
        '/speaker': isolate(Speaker, 'speaker'),
        '/form': isolate(Form, 'form'),
        '/list': isolate(List, 'list')
    });

    const componentSinks$: Stream<Sinks<State>> = match$
        .filter(({ path, value }: any) => path && typeof value === 'function')
        .map(({ path, value }: { path: string; value: Component<any> }) => {
            return value({
                ...sources,
                router: sources.router.path(path)
            });
        });

    const redirect$: Stream<string> = sources.router.history$
        .filter((l: Location) => l.pathname === '/')
        .mapTo('/counter');

    const sinks = extractSinks(componentSinks$, driverNames);
    return {
        ...sinks,
        router: xs.merge(redirect$, sinks.router)
    };
}
