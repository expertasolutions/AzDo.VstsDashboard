import * as React from "react";

import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { ISimpleListCell } from "azure-devops-ui/List";
import { MenuItemType } from "azure-devops-ui/Menu";
import { IStatusProps, Status, Statuses, StatusSize } from "azure-devops-ui/Status";
import {
    ColumnFill,
    ColumnMore,
    ColumnSelect,
    ITableColumn,
    SimpleTableCell,
    ISimpleTableCell,
    renderSimpleCell,
    TableColumnLayout
} from "azure-devops-ui/Table";
import { css } from "azure-devops-ui/Util";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { BuildResult, BuildStatus } from "azure-devops-extension-api/Build";

export interface IBuildRowItem {
  id: number;
  teamProject: string;
  definitionName: string;
  buildNumber: string;
  requestedFor: string;
  result: BuildResult;
  status: BuildStatus;
}

function renderNormalCell (
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<IBuildRowItem>,
  tableItem: IBuildRowItem
): JSX.Element {
  return (
      <SimpleTableCell
          columnIndex={columnIndex}
          tableColumn={tableColumn}
          key={"col-" + columnIndex}
          contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m scroll-hidden">
          <div>{columnIndex}</div>
      </SimpleTableCell>
  );
}

function renderResultColumn(
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<IBuildRowItem>,
  tableItem: IBuildRowItem
): JSX.Element {
  return (
      <SimpleTableCell
          columnIndex={columnIndex}
          tableColumn={tableColumn}
          key={"col-" + columnIndex}
          contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m scroll-hidden">
          <Status
              {...getBuildResultIndicator(tableItem.result).statusProps}
              className="icon-large-margin"
              size={StatusSize.l}
          />
      </SimpleTableCell>
  );
}


function renderStatusColumn(
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<IBuildRowItem>,
  tableItem: IBuildRowItem
): JSX.Element {
  return (
      <SimpleTableCell
          columnIndex={columnIndex}
          tableColumn={tableColumn}
          key={"col-" + columnIndex}
          contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m scroll-hidden">
          <Status
              {...getBuildStatusIndicator(tableItem.status).statusProps}
              className="icon-large-margin"
              size={StatusSize.l}
          />
      </SimpleTableCell>
  );
}

export const dashboardColumns : ITableColumn<IBuildRowItem>[] = [
  {
    id: "id",
    name: "id",
    renderCell: renderNormalCell,
    width: 50
  },
  {
      id: "definitionName",
      name: "definitionName",
      renderCell: renderNormalCell,
      width: 250
  },
  {
      id: "buildNumber",
      name: "buildNumber",
      renderCell: renderNormalCell,
      width: 350
  },
  {
      id: "requestedFor",
      name: "requestedFor",
      renderCell: renderNormalCell,
      width: 150
  },
  {
      id: "result",
      name: "result",
      renderCell: renderResultColumn,
      width: 50
  },
  {
      id: "status",
      name: "status",
      renderCell: renderStatusColumn,
      width: 50
  },
];

interface IStatusIndicatorData {
  statusProps: IStatusProps;
  label:string;
}


export function getBuildResultIndicator(status: BuildResult) : IStatusIndicatorData {
  const indicatorData: IStatusIndicatorData = {
    label: "NA",
    statusProps: { ...Statuses.Skipped, ariaLabel: "None" }
  };

  switch(status){
    case BuildResult.Canceled:
      indicatorData.statusProps = { ...Statuses.Canceled, ariaLabel: "Canceled"};
      indicatorData.label = "Canceled";
      break;
    case BuildResult.Succeeded:
      indicatorData.statusProps = { ...Statuses.Success, ariaLabel: "Success"};
      indicatorData.label = "Success";
      break;
    case BuildResult.Failed:
      indicatorData.statusProps = { ...Statuses.Failed, ariaLabel: "Fail"};
      indicatorData.label = "Fail";
      break;
    case BuildResult.PartiallySucceeded:
      indicatorData.statusProps = { ...Statuses.Warning, ariaLabel: "PartiallySucceeded"};
      indicatorData.label = "PartiallySucceeded";
      break;
  }
  return indicatorData;
}


export function getBuildStatusIndicator(status: BuildStatus) : IStatusIndicatorData {
  const indicatorData: IStatusIndicatorData = {
    label: "NA",
    statusProps: { ...Statuses.Skipped, ariaLabel: "None" }
  };

  switch(status){
    case BuildStatus.Cancelling:
      indicatorData.statusProps = { ...Statuses.Canceled, ariaLabel: "Cancelling"};
      indicatorData.label = "Cancelling";
      break;
    case BuildStatus.Completed:
      indicatorData.statusProps = { ...Statuses.Success, ariaLabel: "Completed"};
      indicatorData.label = "Completed";
      break;
    case BuildStatus.NotStarted:
      indicatorData.statusProps = { ...Statuses.Queued, ariaLabel: "Not Started"};
      indicatorData.label = "NotStarted";
      break;
    case BuildStatus.InProgress:
      indicatorData.statusProps = { ...Statuses.Running, ariaLabel: "InProgress"};
      indicatorData.label = "InProgress";
      break;
    case BuildStatus.Postponed:
      indicatorData.statusProps = { ...Statuses.Queued, ariaLabel: "Postponed"};
      indicatorData.label = "Postponed";
      break;
  }
  return indicatorData;
}