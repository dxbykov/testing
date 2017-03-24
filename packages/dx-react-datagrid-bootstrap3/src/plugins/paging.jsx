import React from 'react';
import { Paging as PagingBase } from '@devexpress/dx-react-datagrid';
import { Pager } from '../templates/pager.jsx';

export const Paging = () => <PagingBase pagerTemplate={Pager} />

