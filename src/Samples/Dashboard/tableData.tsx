import * as React from "react";

import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { ISimpleListCell } from "azure-devops-ui/List";
import { MenuItemType } from "azure-devops-ui/Menu";
import { IStatusProps, Status, Statuses, StatusSize } from "azure-devops-ui/Status";
import {
    ColumnFill,
    ColumnMore,
    ColumnSelect,
    ISimpleTableCell,
    renderSimpleCell,
    TableColumnLayout
} from "azure-devops-ui/Table";
import { css } from "azure-devops-ui/Util";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { BuildResult } from "azure-devops-extension-api/Build";

export interface BuildRowItem extends ISimpleTableCell {
  id: number;
  teamProject: string;
  definitionName: string;
  buildNumber: string;
  requestedFor: string;
  result: string;
  status: string;
}

export const dashboardColumns = [
  {
    columnLayout: TableColumnLayout.singleLinePrefix,
    id: "id",
    name: "id",
    readonly: true,
    renderCell: renderSimpleCell,
    width: new ObservableValue(75)
  },
  {
      id: "definitionName",
      name: "definitionName",
      readonly: true,
      renderCell: renderSimpleCell,
      width: new ObservableValue(200)
  },
  {
      columnLayout: TableColumnLayout.none,
      id: "buildNumber",
      name: "buildNumber",
      readonly: true,
      renderCell: renderSimpleCell,
      width: new ObservableValue(250)
  },
    {
      columnLayout: TableColumnLayout.none,
      id: "requestedFor",
      name: "requestedFor",
      readonly: true,
      renderCell: renderSimpleCell,
      width: new ObservableValue(250)
  },
    {
      columnLayout: TableColumnLayout.none,
      id: "result",
      name: "result",
      readonly: true,
      renderCell: renderSimpleCell,
      width: new ObservableValue(100)
  },
  {
      columnLayout: TableColumnLayout.none,
      id: "status",
      name: "status",
      readonly: true,
      renderCell: renderSimpleCell,
      width: new ObservableValue(250)
  },
  ColumnFill
];


export const renderStatus = (className?: string) => {
  return (
      <Status
          {...Statuses.Success}
          ariaLabel="Success"
          className={css(className, "bolt-table-status-icon")}
          size={StatusSize.s}
      />
  );
};

/*
export const rawTableItems: ITableItem[] = [
  {
      age: 50,
      gender: "M",
      name: { iconProps: { render: renderStatus }, text: "Rory Boisvert" }
  },
  {
      age: 49,
      gender: "F",
      name: { iconProps: { iconName: "Home", ariaLabel: "Home" }, text: "Sharon Monroe" }
  },
  {
      age: 18,
      gender: "F",
      name: { iconProps: { iconName: "Home", ariaLabel: "Home" }, text: "Lucy Booth" }
  }
];
*/
/*
export const tableItemsNoIcons = new ArrayItemProvider<ITableItem>(
  rawTableItems.map((item: ITableItem) => {
      const newItem = Object.assign({}, item);
      newItem.name = { text: newItem.name.text };
      return newItem;
  })
);
*/