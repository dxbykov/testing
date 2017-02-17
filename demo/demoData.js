const columnValues = {
    name: ['Bob', 'Alberta', 'Robert', 'Jane', 'Azbest', 'Vova', 'Sonya', 'Marry', 'Sherlock'],
    sex: ['Male', 'Female'],
    city: ['Moscow', 'New York', 'Los Angeles', 'Tula'],
    car: ['Mercedes', 'Audi', 'BMW', 'Porshe', 'Range Rover']
};

export function generateColumns() {
    let columns = [ { name: 'id', width: 120 } ];

    Object.keys(columnValues).forEach(column => {
        columns.push({ name: column });
    });

    return columns;
}

export function generateHeaderRow() {
    let header = { id: 'ID', type: 'heading' };

    Object.keys(columnValues).forEach(column => {
        header[column] = column[0].toUpperCase() + column.slice(1);
    });

    return header;
}

export function generateRows(length) {
    let data = [],
        columns = Object.keys(columnValues);

    for(let i = 0; i < length; i++) {
        let record = { id: i };

        columns.forEach(column => {
            let items = columnValues[column];
            record[column] = items[Math.floor(Math.random() * items.length)];
        });
        
        data.push(record);
    }
    
    return data;
}
