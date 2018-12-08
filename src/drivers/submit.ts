// Minimal speech driver - just speech, no options or events
//
// Limited availablity see caniuse
//
// TODO Add fallback or error

import { Stream } from 'xstream';
import { graphQLAction, graphQLActions } from 'cycle-graphql';

export default function submitDriver(submit$: Stream<any>): void {
    submit$.addListener({
        next: formData => {
            console.log('employee : ' + formData['employee']);
            console.log('start date : ' + formData['startDate']);
            console.log('end date : ' + formData['endDate']);

            const employee = formData['employee'];
            const startDate = formData['startDate'];
            const endDate = formData['endDate'];
            const query = `mutation createSchedule(employee: String, startDate: Date, endDate: Date) {
                employee,
                startDate,
                endDate
            }`;

            fetch('http://b156cb93.ngrok.io/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify({
                    query,
                    variables: {
                        input: {
                            employee,
                            startDate,
                            endDate
                        }
                    }
                })
            })
                .then(r => r.json())
                .then(data => console.log('data returned:', data));
        }
    });
}
