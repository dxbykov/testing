const grig = (
    <DataGrid
        columns={[]}
        rows={[]}>

        <GridView/>
    </DataGrid>
);

const grigWithPaging = (
    <DataGrid
        columns={[]}
        rows={[]}>

        <PagingController
            currentPage={ /* code */ }
            onPageChange={({ page }) => { /* code */ }}/>

        <GridView/>
        <Pager/>
    </DataGrid>
);

const grigWithSelection = (
    <DataGrid
        columns={[]}
        rows={[]}>

        <SelectionController
            rowSelected={({ row }) => { /* code */ }}
            onRowSelected={({ row }) => { /* code */ }}/>

        <GridView>
            <SelectonColumn/>
        </GridView>
    </DataGrid>
);

const grigWithDetails = (
    <DataGrid
        columns={[]}
        rows={[]}>

        <DetailController
            rowExpanded={}
            onRowExpanded={}/>

        <GridView>
            <DetailColumn/>
            <DetailRow
                template={({ row }) => (<div>Detail for {row.name}</div>)}/>
        </GridView>
    </DataGrid>
);

const grigWithHeading = (
    <DataGrid
        columns={[]}
        rows={[]}>

        <GridView>
            <HeadingRow
                template={({ column }) => (<span>{column.title}</span>)}/>
        </GridView>
    </DataGrid>
);

const grigWithHeadingAndFilter = (
    <DataGrid
        columns={[]}
        rows={[]}>

        <FilteringController
            filterApplied={({ column }) => { /* code */ }}
            onFilterApplied={({ column }) => { /* code */ }}/>

        <GridView>
            <HeadingRow
                replaceDefaultTemplate={({ column }) => column.key === 'name'}
                template={({ column }) => (<span>Full Name (or Pseudonym)</span>)}/>
            <FilterRow/>
        </GridView>
    </DataGrid>
);