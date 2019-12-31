import * as React from "react";

import { IStatusProps, Status, Statuses, StatusSize } from "azure-devops-ui/Status";
import {
    ColumnMore,
    ITableColumn,
    TwoLineTableCell,
    SimpleTableCell,
} from "azure-devops-ui/Table";
import { Icon, IIconProps } from "azure-devops-ui/Icon";
import { Ago } from "azure-devops-ui/Ago";
import { Duration } from "azure-devops-ui/Duration";
import { css } from "azure-devops-ui/Util";
import { BuildResult, BuildStatus } from "azure-devops-extension-api/Build";

import {IBuildDef, IPipelineItem } from "./PipelineServices";

function renderBuildDefCell (
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<IBuildDef>,
  tableItem: IBuildDef
): JSX.Element {
  return (
      <SimpleTableCell
          columnIndex={columnIndex}
          tableColumn={tableColumn}
          key={"col-" + columnIndex}
          contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m scroll-hidden">
          <div>{tableItem.name}</div>
      </SimpleTableCell>
  );
}

function renderPipelineCell (
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<IPipelineItem>,
  tableItem: IPipelineItem
): JSX.Element {
  return (
      <SimpleTableCell
          columnIndex={columnIndex}
          tableColumn={tableColumn}
          key={"col-" + columnIndex}
          contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m scroll-hidden">
          <Status
              {...getPipelineIndicator(tableItem.result, tableItem.status).statusProps}
              className="icon-large-margin"
              size={StatusSize.l}
          />
          <div>{tableItem.id}</div>
      </SimpleTableCell>
  );
}

function WithIcon(props: {
  className?: string;
  iconProps: IIconProps;
  children?: React.ReactNode;
}) {
  return (
      <div className={css(props.className, "flex-row flex-center")}>
          {Icon({ ...props.iconProps, className: "icon-margin" })}
          {props.children}
      </div>
  );
}

function renderLastColumn(
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<IPipelineItem>,
  tableItem: IPipelineItem
): JSX.Element {
  return (
      <TwoLineTableCell
          key={"col-" + columnIndex}
          columnIndex={columnIndex}
          tableColumn={tableColumn}
          line1={WithIcon({
              className: "fontSize font-size",
              iconProps: { iconName: "Build" },
              children: (
                  <div>{tableItem.buildNumber}</div>
              )
          })}
          line2={WithIcon({
              className: "fontSize font-size bolt-table-two-line-cell-item",
              iconProps: { iconName: "People" },
              children: (
                <div>{tableItem.requestedFor.displayName}</div>
              )
          })}
      />
  );
}

function renderBuildDefLastCell(
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<IBuildDef>,
  tableItem: IBuildDef
): JSX.Element {
  return (
      <TwoLineTableCell
          key={"col-" + columnIndex}
          columnIndex={columnIndex}
          tableColumn={tableColumn}
          line1={WithIcon({
              className: "fontSize font-size",
              iconProps: { iconName: "Build" },
              children: (
                  <div>tdb</div>
              )
          })}
          line2={WithIcon({
              className: "fontSize font-size bolt-table-two-line-cell-item",
              iconProps: { iconName: "People" },
              children: (
                <div>tdb</div>
              )
          })}
      />
  );
}

function renderDateColumn(
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<IPipelineItem>,
  tableItem: IPipelineItem
): JSX.Element {
  return (
      <TwoLineTableCell
          key={"col-" + columnIndex}
          columnIndex={columnIndex}
          tableColumn={tableColumn}
          line1={WithIcon({
              className: "fontSize font-size",
              iconProps: { iconName: "Calendar" },
              children: (
                  <Ago date={tableItem.startTime!} />
              )
          })}
          line2={WithIcon({
              className: "fontSize font-size bolt-table-two-line-cell-item",
              iconProps: { iconName: "Clock" },
              children: (
                  <div>{tableItem.startTime} - {tableItem.endTime}</div>
              )
          })}
      />
  );
}

export const dashboardColumns : ITableColumn<IBuildDef>[] = [
  {
    id: "pipeline",
    name: "Pipeline",
    renderCell: renderBuildDefCell,
    width: 350
  },
  {
    id:"Info",
    renderCell: renderBuildDefLastCell,
    width: 350
  },
  new ColumnMore(() => {
    return {
      id: "sub-menu",
      items: [
        { id: "submenu-two", text: "Edit Pipeline" },
        { id: "submenu-one", text: "View Releases" }
      ]
    }
  })
];

interface IStatusIndicatorData {
  statusProps: IStatusProps;
  label:string;
}

export function getPipelineIndicator(result: BuildResult, status:BuildStatus) : IStatusIndicatorData {
  const indicatorData: IStatusIndicatorData = {
    label: "NA",
    statusProps: { ...Statuses.Queued, ariaLabel: "None" }
  };

  if(result === undefined){
    result = BuildResult.None;
  }

  switch(result){
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
    case BuildResult.None:
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
      break;
  }
  return indicatorData;
}