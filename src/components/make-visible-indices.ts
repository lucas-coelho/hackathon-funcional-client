import xs, { Stream } from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats';

function makeVisibleIndices$(
    tableHeight$: Stream<number>,
    rowHeight$: Stream<number>,
    rowCount$: Stream<number>,
    scrollTop$: Stream<number>
) {
    const firstVisibleRow$ = xs
        .combine(scrollTop$, rowHeight$)
        .map(([scrollTop, rowHeight]) =>
            Math.max(0, Math.floor(scrollTop / rowHeight) - 10)
        )
        .compose(dropRepeats<number>());

    const visibleRows$ = xs
        .combine(tableHeight$, rowHeight$)
        .map(([tableHeight, rowHeight]) => Math.ceil(tableHeight / rowHeight));

    const visibleIndices$ = xs
        .combine(rowCount$, visibleRows$, firstVisibleRow$)
        .map(([rowCount, visibleRows, firstVisibleRow]) => {
            const visibleIndices: number[] = [];
            const lastRow = Math.min(
                rowCount,
                firstVisibleRow + visibleRows + 20
            );

            if (lastRow > rowCount) {
                firstVisibleRow -= lastRow - rowCount;
            }

            for (let i = firstVisibleRow; i <= lastRow; i++) {
                visibleIndices.push(i);
            }

            return visibleIndices;
        });

    return visibleIndices$;
}

export default makeVisibleIndices$;
