import * as React from "react";

import { 
  WithIcon,
  IStatusIndicatorData,
  getPipelineIndicator
} from "./common";

import {
  ColumnMore,
  ITableColumn,
  TwoLineTableCell,
  SimpleTableCell,
} from "azure-devops-ui/Table";

import { Ago } from "azure-devops-ui/Ago";
import { Duration } from "azure-devops-ui/Duration";

import { Build, BuildResult, BuildStatus, BuildDefinitionReference } from "azure-devops-extension-api/Build";
import { IStatusProps, Status, Statuses, StatusSize } from "azure-devops-ui/Status";

export function renderBuildRef01 (
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<BuildDefinitionReference>,
  tableItem: BuildDefinitionReference
): JSX.Element {
  return (
      <SimpleTableCell
          columnIndex={columnIndex}
          tableColumn={tableColumn}
          key={"col-" + columnIndex}
          contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m scroll-hidden">
            <Status {...getBuildDefinitionStatus(tableItem).statusProps}
                    className="icon-large-margin"
                    size={StatusSize.l}/>
          <div>{tableItem.name}</div>
      </SimpleTableCell>
  );
}

export function renderLastBuild01(
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<BuildDefinitionReference>,
  tableItem: BuildDefinitionReference
): JSX.Element {
  let lastBuild = tableItem.latestBuild;
  if(lastBuild === undefined){
    return (<div>not found</div>);
  }
  return (
      <TwoLineTableCell
          key={"col-" + columnIndex}
          columnIndex={columnIndex}
          tableColumn={tableColumn}
          line1={WithIcon({
              className: "fontSize font-size",
              iconProps: { iconName: "Build" },
              children: (
                  <div>{lastBuild.buildNumber}</div>
              )
          })}
          line2={WithIcon({
              className: "fontSize font-size bolt-table-two-line-cell-item",
              iconProps: { iconName: "People" },
              children: (
                <div>{lastBuild.requestedFor!.displayName}</div>
              )
          })}
      />
  );
}

export function renderLastBuild02(
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<BuildDefinitionReference>,
  tableItem: BuildDefinitionReference
): JSX.Element {
  let lastBuildRun = tableItem.latestBuild;
  if(lastBuildRun === undefined) {
    return <TwoLineTableCell
          key={"col-" + columnIndex}
          columnIndex={columnIndex}
          tableColumn={tableColumn}
          line1={WithIcon({
              className: "fontSize font-size",
              iconProps: { iconName: "Calendar" },
              children: (
                  <div>NA</div>
              )
          })}
          line2={WithIcon({
              className: "fontSize font-size bolt-table-two-line-cell-item",
              iconProps: { iconName: "Clock" },
              children: (
                  <div>NA</div>
              )
          })}
      />
  } else if(lastBuildRun.startTime === undefined) {
    return <TwoLineTableCell
          key={"col-" + columnIndex}
          columnIndex={columnIndex}
          tableColumn={tableColumn}
          line1={WithIcon({
              className: "fontSize font-size",
              iconProps: { iconName: "Calendar" },
              children: (
                  <div>Not Started</div>
              )
          })}
          line2={WithIcon({
              className: "fontSize font-size bolt-table-two-line-cell-item",
              iconProps: { iconName: "Clock" },
              children: (
                  <div>Waiting...</div>
              )
          })}
      />
  }
  return (
      <TwoLineTableCell
          key={"col-" + columnIndex}
          columnIndex={columnIndex}
          tableColumn={tableColumn}
          line1={WithIcon({
              className: "fontSize font-size",
              iconProps: { iconName: "Calendar" },
              children: (
                  <Ago date={lastBuildRun.startTime!} />
              )
          })}
          line2={WithIcon({
              className: "fontSize font-size bolt-table-two-line-cell-item",
              iconProps: { iconName: "Clock" },
              children: (
                  <Duration startDate={lastBuildRun.startTime} endDate={lastBuildRun.finishTime} />
              )
          })}
      />
  );
}

export function renderReleaseInfo01 (
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<BuildDefinitionReference>,
  tableItem: BuildDefinitionReference
) : JSX.Element {
  let lastBuild = tableItem.latestBuild;
  if(lastBuild === undefined) {
    return (<div>not found</div>)
  }
  
  return (
    <TwoLineTableCell
          key={"col-" + columnIndex}
          columnIndex={columnIndex}
          tableColumn={tableColumn}
          line1={WithIcon({
              className: "fontSize font-size",
              iconProps: { iconName: "Build" },
              children: (
                  <div>{lastBuild.buildNumber}</div>
              )
          })}
          line2={WithIcon({
              className: "fontSize font-size bolt-table-two-line-cell-item",
              iconProps: { iconName: "People" },
              children: (
                <div>{lastBuild.requestedFor!.displayName}</div>
              )
          })}
      />
  )
}

function getBuildDefinitionStatus(buildDefItem: BuildDefinitionReference) : IStatusIndicatorData {
  const indicatorData: IStatusIndicatorData = {
    label: "NA",
    statusProps: { ...Statuses.Queued, ariaLabel: "None" }
  };
  
  let lastBuild = buildDefItem.latestBuild;
  if(lastBuild != undefined) {
    return getPipelineIndicator(lastBuild.result, lastBuild.status);
  } 
  return indicatorData;
}