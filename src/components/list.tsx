import xs, { Stream } from 'xstream';
import {
    VNode,
    DOMSource,
    input,
    source,
    div,
    h2,
    br,
    button
} from '@cycle/dom';

import { Sources, Sinks, Reducer } from '../interfaces';

import makeVisibleIndices$ from './make-visible-indices';
import renderTHead from './thead';
import renderTBody from './tbody';

export interface State {
    tableHeight: number;
    rowHeight: number;
    columns: string[];
    rowCount: number;
    visibleIndices: number[];
}
export const defaultState: State = {
    tableHeight: 500,
    rowHeight: 30,
    columns: [],
    rowCount: 10000,
    visibleIndices: []
};

interface DOMIntent {
    action$: Stream<number>;
    link$: Stream<null>;
}

export function List({ DOM, state }: Sources<State>): Sinks<State> {
    const { action$, link$ }: DOMIntent = intent(DOM);

    return {
        DOM: view(state.stream),
        state: model(action$),
        router: redirect(link$)
    };
}

function model(action$: Stream<any>): Stream<any> {
    const init$ = xs.of<Reducer<State>>(prevState =>
        prevState === undefined ? defaultState : prevState
    );

    const tableHeight$ = xs.of(500);
    const rowHeight$ = xs.of(30);
    const columns$ = xs.of(['ID', 'ID * 10', 'Random Number']);
    const rowCount$ = xs.of(10000);
    const scrollTop$ = action$.startWith(0);
    const visibleIndices$ = makeVisibleIndices$(
        tableHeight$,
        rowHeight$,
        rowCount$,
        scrollTop$
    );

    const state$ = xs
        .combine(tableHeight$, rowHeight$, columns$, rowCount$, visibleIndices$)
        .map(([tableHeight, rowHeight, columns, rowCount, visibleIndices]) => ({
            tableHeight: tableHeight,
            rowHeight: rowHeight,
            columns: columns,
            rowCount: rowCount,
            visibleIndices: visibleIndices
        }));

    const foo: (value: string) => Reducer<State> = n => state => ({
        tableHeight: state!.tableHeight,
        rowHeight: state!.rowHeight,
        columns: state!.columns,
        rowCount: state!.rowCount,
        visibleIndices: state!.visibleIndices
    });

    return xs.merge(init$, state$);
}

function view(state$: Stream<State>): Stream<VNode> {
    return state$.map(
        ({ tableHeight, rowHeight, columns, rowCount, visibleIndices }) =>
            div('#app-container', [
                div(
                    '#static-header-table',
                    {
                        style: {
                            border: '1px solid black',
                            borderBottom: 'none',
                            width: 900 + 'px'
                        }
                    },
                    [renderTHead(columns)]
                ),
                div(
                    '#scroll-table-container',
                    {
                        style: {
                            position: 'relative',
                            overflowX: 'hidden',
                            border: '1px solid black',
                            width: 900 + 'px',
                            height: tableHeight + 'px'
                        }
                    },
                    [
                        div(
                            '#scroll-table',
                            {
                                style: {
                                    height: rowCount * rowHeight + 'px',
                                    width: 900 + 'px'
                                }
                            },
                            [renderTBody(rowHeight, visibleIndices)]
                        )
                    ]
                ),
                button('.navigate', 'Create schedule')
            ])
    );
}

function intent(DOM: DOMSource): DOMIntent {
    const action$ = DOM.select('#scroll-table-container')
        .events('scroll', { useCapture: true })
        .map(e => (e.target as Element).scrollTop);

    const link$ = DOM.select('.navigate')
        .events('click')
        .mapTo(null);

    return { action$, link$ };
}

function redirect(link$: Stream<any>): Stream<string> {
    return link$.mapTo('/form');
}
