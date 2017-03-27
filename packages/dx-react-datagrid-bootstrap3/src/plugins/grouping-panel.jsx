import React from 'react';
import { GroupingPanel as GroupingPanelBase } from '@devexpress/dx-react-datagrid';
import { GroupPanel } from '../templates/group-panel.jsx';

export const GroupingPanel = () => <GroupingPanelBase groupPanelTemplate={GroupPanel} />
