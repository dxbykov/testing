import React from 'react';
import { Grouping as GroupingBase } from '@devexpress/dx-react-datagrid';
import { GroupPanel } from '../templates/group-panel.jsx';

export const Grouping = () => <GroupingBase groupPanelTemplate={GroupPanel} />

