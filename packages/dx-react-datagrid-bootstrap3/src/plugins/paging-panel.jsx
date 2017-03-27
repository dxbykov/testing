import React from 'react';
import { PagingPanel as PagingPanelBase } from '@devexpress/dx-react-datagrid';
import { Pager } from '../templates/pager.jsx';

export const PagingPanel = () => <PagingPanelBase pagerTemplate={Pager} />

