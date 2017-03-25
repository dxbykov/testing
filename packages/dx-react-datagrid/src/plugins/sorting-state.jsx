import React from 'react';
import { Getter, Action } from '@devexpress/dx-react-core';

// Core
var mergeSort = function(array, comparefn) {
  function merge(arr, aux, lo, mid, hi, comparefn) {
    var i = lo;
    var j = mid + 1;
    var k = lo;
    while(true){
      var cmp = comparefn(arr[i], arr[j]);
      if(cmp <= 0){
        aux[k++] = arr[i++];
        if(i > mid){
          do
            aux[k++] = arr[j++];
          while(j <= hi);
          break;
        }
      } else {
        aux[k++] = arr[j++];
        if(j > hi){
          do
            aux[k++] = arr[i++];
          while(i <= mid);
          break;
        }
      }
    }
  }

  function sortarrtoaux(arr, aux, lo, hi, comparefn) {
    if (hi < lo) return;
    if (hi == lo){
        aux[lo] = arr[lo];
        return;
    }
    var mid = Math.floor(lo + (hi - lo) / 2);
    sortarrtoarr(arr, aux, lo, mid, comparefn);
    sortarrtoarr(arr, aux, mid + 1, hi, comparefn);
    merge(arr, aux, lo, mid, hi, comparefn);
  }

  function sortarrtoarr(arr, aux, lo, hi, comparefn) {
    if (hi <= lo) return;
    var mid = Math.floor(lo + (hi - lo) / 2);
    sortarrtoaux(arr, aux, lo, mid, comparefn);
    sortarrtoaux(arr, aux, mid + 1, hi, comparefn);
    merge(aux, arr, lo, mid, hi, comparefn);
  }

  function merge_sort(arr, comparefn) {
    var aux = arr.slice(0);
    sortarrtoarr(arr, aux, 0, arr.length - 1, comparefn);
    return arr;
  }

  return merge_sort(array, comparefn);
}

const createSortingCompare = (sorting, compareEqual) => (a, b) => {
    let sortColumn = sorting.column,
        inverse = sorting.direction === "desc";
    
    if(a[sortColumn] === b[sortColumn]) {
        return compareEqual && compareEqual(a, b) || 0;
    }
    else {
        return (a[sortColumn] < b[sortColumn]) ^ inverse ? -1 : 1
    }
};


const sortingsHelper = {
    calcSortings: (columnName, direction , keepOther, prevSortings) => {
        let sortingIndex = prevSortings.findIndex(s => { return s.column == columnName; }),
            sorting = prevSortings[sortingIndex],
            result = keepOther ? prevSortings.slice() : [];

        if(sorting) {
            sorting = Object.assign({}, sorting, { direction: sorting.direction == 'asc' ? 'desc' : 'asc' });
            if(keepOther) {
                result.splice(sortingIndex, 1, sorting);
            }
            else {
                result.push(sorting);
            }
            
        }
        else {
            result.push({
                column: columnName,
                direction: 'asc'
            });
        }

        return result;
    },
    directionFor: (columnName, sortings) => {
        let sorting = sortings.filter(s => s.column === columnName)[0];
        return sorting ? sorting.direction : false;
    },
    sort: (rows, sortings) => {
        if(!sortings.length)
            return rows;

        let compare = sortings.slice()
            .reverse()
            .reduce((prevCompare, sorting) => createSortingCompare(sorting, prevCompare), () => 0);

        return mergeSort(rows.slice(), compare);;
    },
};

export const sortingDirectionForColumn = sortingsHelper.directionFor;

// UI
export class SortingState extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            sortings: props.defaultSortings || []
        };

        this.changeSortings = (sortings) => {
            let { sortingsChange } = this.props;
            this.setState({ sortings });
            sortingsChange && sortingsChange(sortings);
        };

        this._rows = ({ rows, sortings }) => sortingsHelper.sort(rows, sortings);
    }
    render() {
        let sortings = this.props.sortings || this.state.sortings;
        
        return (
            <div>
                <Action
                    name="applySorting"
                    action={(
                        { columnName, direction, keepOther }) => this.changeSortings(sortingsHelper.calcSortings(columnName, direction , keepOther, sortings)
                    )} />

                <Getter name="rows"
                    pureComputed={this._rows}
                    connectArgs={(getter) => ({
                        rows: getter('rows')(),
                        sortings
                    })}/>

                <Getter name="sortings" value={sortings} />
            </div>
        )
    }
};