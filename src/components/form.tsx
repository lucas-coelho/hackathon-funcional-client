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

import sampleCombine from 'xstream/extra/sampleCombine';

export interface State {
    startDate: string;
    endDate: string;
    employee: string;
}
export const defaultState: State = {
    startDate: '',
    endDate: '',
    employee: ''
};

interface DOMIntent {
    employee$: Stream<string>;
    startDate$: Stream<string>;
    endDate$: Stream<string>;
    submit$: Stream<any>;
    link$: Stream<null>;
}

export function Form({ DOM, state }: Sources<State>): Sinks<State> {
    const {
        employee$,
        startDate$,
        endDate$,
        submit$,
        link$
    }: DOMIntent = intent(DOM);

    return {
        DOM: view(state.stream),
        state: model(employee$, startDate$, endDate$),
        submit: submit(submit$, state.stream),
        router: redirect(link$)
    };
}

function model(
    employee$: Stream<string>,
    startDate$: Stream<any>,
    endDate$: Stream<any>
): any {
    const init$ = xs.of<Reducer<State>>(prevState =>
        prevState === undefined ? defaultState : prevState
    );

    const updateEmployee: (value: string) => Reducer<State> = n => state => ({
        ...state,
        employee: n,
        startDate: state!.startDate,
        endDate: state!.endDate
    });

    const updateStartDate: (value: string) => Reducer<State> = n => state => ({
        ...state,
        employee: state!.employee,
        startDate: n,
        endDate: state!.endDate
    });

    const updateEndDate: (value: string) => Reducer<State> = n => state => ({
        ...state,
        employee: state!.employee,
        startDate: state!.startDate,
        endDate: n
    });

    const updateEmployee$ = employee$.map(employee => updateEmployee(employee));
    const updateStartDate$ = startDate$.map(startDate =>
        updateStartDate(startDate)
    );
    const updateEndDate$ = endDate$.map(endDate => updateEndDate(endDate));

    return xs.merge(init$, updateEmployee$, updateStartDate$, updateEndDate$);
}

function view(state$: Stream<State>): Stream<VNode> {
    return state$.map(({ employee, startDate, endDate }) =>
        div([
            h2('Create Schedule'),
            br(),

            input('.employee', {
                attrs: { value: employee, placeholder: 'Employee' },
                style: { width: '500px' }
            }),
            br(),

            input('.startDate', {
                attrs: { value: startDate, placeholder: 'Start date' },
                style: { width: '500px' }
            }),
            br(),

            input('.endDate', {
                attrs: { value: endDate, placeholder: 'End date' },
                style: { width: '500px' }
            }),
            br(),

            br(),
            button(
                '.submit',
                {
                    style: {
                        color: 'white',
                        background: 'green',
                        width: '150px',
                        borderRadius: '10px'
                    }
                },
                'Submit'
            )
        ])
    );
}

function intent(DOM: DOMSource): DOMIntent {
    const employee$ = DOM.select('.employee')
        .events('input')
        .map((event: any) => event.target.value);

    const startDate$ = DOM.select('.startDate')
        .events('input')
        .map((event: any) => event.target.value);

    const endDate$ = DOM.select('.endDate')
        .events('input')
        .map((event: any) => event.target.value);

    const submit$ = DOM.select('.submit')
        .events('click')
        .mapTo((event: any) => event.target.value);

    const link$ = DOM.select('[data-action="navigate"]')
        .events('click')
        .mapTo(null);

    return { employee$, startDate$, endDate$, submit$, link$ };
}

function redirect(link$: Stream<any>): Stream<string> {
    return link$.mapTo('/speaker');
}

function submit(submit$: Stream<any>, state$: Stream<State>): Stream<any> {
    return submit$
        .compose(sampleCombine(state$))
        .map(([_, s]: [any, State]) => {
            const map: any = new Object();
            map['employee'] = s.employee;
            map['startDate'] = s.startDate;
            map['endDate'] = s.endDate;
            return map;
        });
}
