import * as React from "react";

import { 
  WithIcon,
  IStatusIndicatorData,
  getReleaseTagFromBuild,
  getPipelineIndicator,
} from "./common";

import { Ago } from "azure-devops-ui/Ago";
import { Duration } from "azure-devops-ui/Duration";
import { Status, StatusSize } from "azure-devops-ui/Status";
import { DataContext } from "../dataContext";

import {
  ITableColumn,
  TwoLineTableCell,
  SimpleTableCell,
} from "azure-devops-ui/Table";

import { Build } from "azure-devops-extension-api/Build";

export function getBuildStatus(build: Build) : IStatusIndicatorData {
  return getPipelineIndicator(build.result, build.status);
}

export function renderBuildStatus (
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<Build>,
  tableItem: Build
): JSX.Element {
  return (
      <SimpleTableCell
          columnIndex={columnIndex}
          tableColumn={tableColumn}
          key={"col-" + columnIndex}
          contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m scroll-hidden">
            <Status {...getBuildStatus(tableItem).statusProps}
                    className="icon-large-margin"
                    size={StatusSize.l}/>
      </SimpleTableCell>
  );
}

export function renderBuildInfo01Cell(
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<Build>,
  tableItem: Build
) : JSX.Element {
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
                <div>{tableItem.requestedFor!.displayName}</div>
              )
          })}
      />
  )
}

export function renderDeploymentInfo01(
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<Build>,
  tableItem: Build
) : JSX.Element {
  return (
    <DataContext.Consumer>
      {(context) => (
      <SimpleTableCell
            key={"col-" + columnIndex}
            columnIndex={columnIndex}
            tableColumn={tableColumn}>
          <div>
            {getReleaseTagFromBuild(tableItem, context.state.releases) }
          </div>
        </SimpleTableCell>
      )}
    </DataContext.Consumer>
  )
}

export function renderBuildInfo02Cell(
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<Build>,
  tableItem: Build
) : JSX.Element {
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
                  <Duration startDate={tableItem.startTime!} endDate={tableItem.finishTime!} />
              )
          })}
      />
  );
}