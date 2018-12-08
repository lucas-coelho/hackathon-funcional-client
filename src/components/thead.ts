import { div, VNode } from '@cycle/dom';

function renderTHead(columns: string[]) {
    const cellStyle = { display: 'inline-block', width: 900 / 3 + 'px' };
    const nodes = columns.map(value => div({ style: cellStyle }, value));
    return div(nodes);
}

export default renderTHead;
