import * as React from "react";

import { 
  WithIcon,
  IStatusIndicatorData,
  getPipelineIndicator,
  getReleaseStatus
} from "./common";

import {
  ColumnMore,
  ITableColumn,
  TwoLineTableCell,
  SimpleTableCell,
} from "azure-devops-ui/Table";

import { Ago } from "azure-devops-ui/Ago";
import { Duration } from "azure-devops-ui/Duration";
import { Pill, PillSize, PillVariant } from "azure-devops-ui/Pill";
import { PillGroup } from "azure-devops-ui/PillGroup";

import { Build, BuildResult, BuildStatus, BuildDefinitionReference } from "azure-devops-extension-api/Build";
import { Deployment } from "azure-devops-extension-api/Release";
import { Release } from "azure-devops-extension-api/Release";
import { IStatusProps, Status, Statuses, StatusSize } from "azure-devops-ui/Status";
import { DataContext } from "../dataContext";
import { getBuildStatus } from "./build";

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
  let lastBuild = tableItem.latestCompletedBuild;
  if(lastBuild === undefined) {
    return (<div>not found</div>)
  }
  
  return (
    <DataContext.Consumer>
      {(context) => (
      <TwoLineTableCell
            key={"col-" + columnIndex}
            columnIndex={columnIndex}
            tableColumn={tableColumn}
            line1={WithIcon({
                className: "fontSize font-size",
                iconProps: { iconName: "Deployment" },
                children: (
                  <div>
                    {getReleaseTagFromBuild(lastBuild, context.state.releases) }
                  </div>
                )
            })}
            line2={WithIcon({
                className: "fontSize font-size bolt-table-two-line-cell-item",
                iconProps: { iconName: "Tag" },
                children: (
                  <div>{context.state.patate}</div>
                )
            })}
        />
      )}
    </DataContext.Consumer>
  )
}

function getReleaseTagFromBuild(build: Build, releases: Array<Deployment>) {
  console.log("BuildId: " + build.id);
  let deploys = releases.filter(
    x=> x.release.artifacts.find(
      a=> {
        let version = a.definitionReference["version"];
        if(version.id == build.id.toString()) {
          console.log("VersionInfo: " + JSON.stringify(version));
        }
        return version.id === build.id.toString();
      }
    ) != null
  );

  let children = [];
  for(let i=0;i<deploys.sort(x=> x.id).length;i++){
    let dep = deploys[i];
    children.push(<Pill>
      <Status {...getReleaseStatus(dep).statusProps} 
              className="icon-small-margin"
              size={StatusSize.s}/>
      {dep.releaseEnvironment.name}
    </Pill>)
  }

  if(deploys.length > 0) {
    return (<PillGroup>{children}</PillGroup>);
  }
  return <div>Not found</div>
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