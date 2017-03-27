export const setColumnFilter = (filters, { columnName, value }) => {
  const filterIndex = filters.findIndex(f => { return f.column == columnName; });
  const nextState = filters.slice();

  if(filterIndex > -1) {
    if(value !== '') {
      nextState.splice(filterIndex, 1, { column: columnName, value: value });
    }
    else {
      nextState.splice(filterIndex, 1);
    }
  } else {
      nextState.push({ column: columnName, value: value })
  }
  
  return nextState;
};