import * as React from "react";

import { 
  WithIcon,
  IStatusIndicatorData,
  getReleaseTagFromBuild,
  getPipelineIndicator,
} from "./common";

import { BuildDefinitionReference, BuildStatus } from "azure-devops-extension-api/Build";
import { Ago } from "azure-devops-ui/Ago";
import { Duration } from "azure-devops-ui/Duration";
import { Link } from "azure-devops-ui/Link";
import { Icon } from "azure-devops-ui/Icon";
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

function getBuildDefinitionUrl(buildDefs: BuildDefinitionReference[], buildDefId: number) {
  let buildDefRef = buildDefs.find(x=> x.id === buildDefId);
  return buildDefRef?._links.web.href;
}

export function renderBuildStatus (
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<Build>,
  tableItem: Build
): JSX.Element {
  let projectName = tableItem.project.name;
  return (
    <DataContext.Consumer>
      {(context) => (
        <SimpleTableCell
            columnIndex={columnIndex}
            tableColumn={tableColumn}
            key={"col-" + columnIndex}
            contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m scroll-hidden">
              <Status {...getBuildStatus(tableItem).statusProps}
                      className="icon-large-margin"
                      size={StatusSize.l}/>
              <div style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                  <div style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                    <Link href={getBuildDefinitionUrl(context.state.buildDefs, tableItem.definition.id)} target="_blank" className="bolt-table-cell-primary">
                      {tableItem.definition.name}
                    </Link>
                  </div>
                  <div className="font-size-s" style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{projectName}</div>
              </div>
        </SimpleTableCell>
      )
    </DataContext.Consumer>
  );
}

export function renderBuildInfo01Cell(
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<Build>,
  tableItem: Build
) : JSX.Element {
  let lastBuild = tableItem;
  let contentRow1 = (<div>Not found</div>);
  let contentRow2 = (<div></div>);

  if(lastBuild != undefined) {
    let branchName = lastBuild.sourceBranch.replace('refs/heads/','');
    let branchUrl = lastBuild.repository.url;
    let commitUrl = lastBuild.repository.url;
    let buildUrl = lastBuild._links.web.href + "&view=logs";

    if(lastBuild.repository.type === "TfsGit"){
      branchUrl = lastBuild.repository.url + "?version=GB" + branchName + "&_a=contents";
      commitUrl = lastBuild.repository.url + "/commit/" + lastBuild.sourceVersion;
    }
    else if(lastBuild.repository.type === "GitHub"){
      branchUrl = "https://github.com/" + lastBuild.repository.id + "/tree/" + branchName;
      commitUrl = lastBuild._links.sourceVersionDisplayUri.href;
    } else if(lastBuild.repository.type === "TfsVersionControl") {

      if(lastBuild.sourceBranch.indexOf("$/") == 0) {
        branchUrl = lastBuild.repository.url + lastBuild.repository.name + "/_versionControl?path=" + lastBuild.sourceBranch;
        commitUrl = lastBuild.repository.url + lastBuild.repository.name + "/_versionControl/changeset/" + lastBuild.sourceVersion;
      } else {
        branchUrl = lastBuild.repository.url + lastBuild.repository.name + "/_versionControl/shelveset?ss=" + lastBuild.sourceBranch;
        commitUrl = lastBuild.repository.url + lastBuild.repository.name + "/_versionControl/changeset/" + lastBuild.sourceVersion;
      }
    }
    contentRow1 = (<div style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                    <Icon iconName="Build"/>&nbsp;<Link href={buildUrl} target="_blank">{lastBuild.buildNumber}</Link>
                  </div>);
                  
    if(lastBuild.sourceVersion !== undefined) {
      contentRow2 = (<div style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                      <Icon iconName="BranchMerge"/>&nbsp;<Link href={branchUrl} target="_blank">{branchName}</Link>
                      <Icon iconName="BranchCommit" /><Link href={commitUrl} target="blank">{lastBuild.sourceVersion.substr(0, 7)}</Link>
                    </div>);
    } else {
      contentRow2 = (<div style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                      <Icon iconName="BranchMerge"/>&nbsp;<Link href={branchUrl} target="_blank">{branchName}</Link>
                      <Icon iconName="BranchCommit" />Not found
                    </div>);
    }
  }
  return (
    <TwoLineTableCell
      key={"col-" + columnIndex}
      columnIndex={columnIndex}
      tableColumn={tableColumn}
      line1={contentRow1}
      line2={contentRow2}
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
            { getReleaseTagFromBuild(tableItem, context.state.releases, context.state.showAllBuildDeployment) }
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
  let lastBuildRun = tableItem;
  let requestByCtrl = (<div></div>);
  let buildTimeCtrl = (<div></div>);
  let queueName = "NA";

  if(lastBuildRun !== undefined && lastBuildRun.queue !== undefined){
    queueName = lastBuildRun.queue.name;
  }
  
  if(lastBuildRun != undefined) {
    requestByCtrl = (<div className="font-size-s"><Icon iconName="People"/>&nbsp;{lastBuildRun.requestedFor!.displayName}</div>);

    if(lastBuildRun.startTime != undefined) {
      buildTimeCtrl = (<div className="font-size-s">
                        <div><Icon iconName="Settings"/>&nbsp;{queueName}</div>
                        <div><Icon iconName="Calendar"/>&nbsp;<Ago date={lastBuildRun.startTime!} />&nbsp;<Icon iconName="Clock"/>&nbsp;<Duration startDate={lastBuildRun.startTime} endDate={lastBuildRun.finishTime} /></div>
                      </div>);
    } else {
      buildTimeCtrl = (
      <div className="font-size-s">
        <div><Icon iconName="Calendar"/>&nbsp;Not Started</div>
        <div><Icon iconName="Clock"/>&nbsp;Waiting...</div>
      </div>);
    }
  }

  if(lastBuildRun === undefined) {
    return <TwoLineTableCell
          key={"col-" + columnIndex}
          columnIndex={columnIndex}
          tableColumn={tableColumn}
          line1={WithIcon({
              className: "fontSize font-size",
              iconProps: { iconName: "Calendar" },
              children: (
                  <div className="font-size-s">NA</div>
              )
          })}
          line2={WithIcon({
              className: "fontSize font-size bolt-table-two-line-cell-item",
              iconProps: { iconName: "Clock" },
              children: (
                  <div className="font-size-s">NA</div>
              )
          })}
      />
  }
  return (
      <TwoLineTableCell
          key={"col-" + columnIndex}
          columnIndex={columnIndex}
          tableColumn={tableColumn}
          line1={requestByCtrl}
          line2={buildTimeCtrl}
      />
  );
}