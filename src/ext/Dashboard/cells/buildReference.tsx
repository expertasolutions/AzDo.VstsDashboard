import * as React from "react";

import { 
  WithIcon,
  WithIconSpan,
  IStatusIndicatorData,
  getPipelineIndicator,
  getReleaseTagFromBuild,
  lightGray,
  waitingForApproval
} from "./common";

import {
  ITableColumn,
  TwoLineTableCell,
  SimpleTableCell,
} from "azure-devops-ui/Table";

import { Ago } from "azure-devops-ui/Ago";
import { Duration } from "azure-devops-ui/Duration";

import { BuildDefinitionReference, BuildStatus } from "azure-devops-extension-api/Build";
import { Status, Statuses, StatusSize } from "azure-devops-ui/Status";
import { Link } from "azure-devops-ui/Link";
import { Icon } from "azure-devops-ui/Icon";
import { DataContext } from "../dataContext";
import { Build } from "azure-devops-extension-api/Build";

export function renderBuildRef01 (
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<BuildDefinitionReference>,
  tableItem: BuildDefinitionReference
): JSX.Element {
  let definitionUrl = tableItem._links.web.href;
  let projectName = tableItem.project.name;
  let lastBuild = tableItem.latestBuild;

  return (
      <DataContext.Consumer>
        {(context) => (
          <SimpleTableCell
              columnIndex={columnIndex}
              tableColumn={tableColumn}
              key={"col-" + columnIndex}
              contentClassName="fontSizeM font-size-m scroll-hidden">
              <Status {...getBuildDefinitionStatusNew(lastBuild).statusProps}
                      className="icon-large-margin"
                      size={StatusSize.l}/>
              <div style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                <div style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}} className="fontWeightSemiBold font-weight-semibold">
                  <Link href={definitionUrl} target="_blank" className="bolt-table-cell-primary">
                    {tableItem.name}
                  </Link>
                </div>
                <div className="font-size-s" style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                  <span className="fontWeightSemiBold font-weight-semibold">{projectName}</span>{getPendingBuild(tableItem, context.state.builds)}
                </div>
              </div>
          </SimpleTableCell>
        )}
      </DataContext.Consumer>
  );
}

export function getPendingBuild(buildRef: BuildDefinitionReference, buildList: Build[]) {
  let currentQueued = buildList.filter(x=> x.definition.id === buildRef.id && (x.status !== BuildStatus.Completed ));
  if(currentQueued.length == 2) {
    return (<span>&nbsp;-&nbsp;{currentQueued.length-1} other run</span>)
  }
  else if(currentQueued.length > 2){
    return (<span>&nbsp;-&nbsp;{currentQueued.length-1} others runs</span>)
  } else {
    return (<span></span>)
  }
}

export function renderLastBuild01 (
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<BuildDefinitionReference>,
  tableItem: BuildDefinitionReference
) {
  let lastBuild = tableItem.latestCompletedBuild;
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
    else if(lastBuild.repository.type === "GitHub") {
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

    contentRow1 = (<div className="font-size-m" style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                    <Status {...getBuildDefinitionStatusNew(lastBuild).statusProps}
                      className="icon-small-margin"
                      size={StatusSize.s}/>&nbsp;<Link href={buildUrl} target="_blank">{lastBuild.buildNumber}</Link>
                  </div>);

    if(lastBuild.sourceVersion !== undefined) {
      contentRow2 = (<div className="font-size-m" style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                      <Icon iconName="BranchMerge"/>&nbsp;<Link href={branchUrl} target="_blank">{branchName}</Link>
                      <Icon iconName="BranchCommit" /><Link href={commitUrl} target="blank">{lastBuild.sourceVersion.substr(0, 7)}</Link>
                    </div>);
    } else {
      contentRow2 = (<div className="font-size-m" style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                        <Icon iconName="BranchMerge"/>&nbsp;<Link href={branchUrl} target="_blank">{branchName}</Link>
                        <Icon iconName="BranchCommit" />Not found
                      </div>);
    }
  }

  let firstRow = (<div>{contentRow1}{contentRow2}</div>);

  return (
    <DataContext.Consumer>
      {(context) => (
          <TwoLineTableCell
            key={"col-" + columnIndex}
            columnIndex={columnIndex}
            tableColumn={tableColumn}
            line1={firstRow}
            line2={renderPendingBuild(tableItem, context.state.builds)}
          />
      )}
    </DataContext.Consumer>
  )
}

function renderPendingBuild(buildRef:BuildDefinitionReference, buildList: Build[]) {
  let currentQueued = buildList.filter(x=> x.definition.id === buildRef.id && (x.status !== BuildStatus.Completed )).sort((a,b) => a.id-b.id);
  let currentRunningBuildCtrl = [];
  for(let i=0;i<currentQueued.length;i++) {
    let lastBuild = currentQueued[i];

    if(lastBuild !== undefined) {
      let branchName = lastBuild.sourceBranch.replace('refs/heads/','');
      let branchUrl = lastBuild.repository.url;
      let commitUrl = lastBuild.repository.url;
      let buildUrl = lastBuild._links.web.href + "&view=logs";

      if(lastBuild.repository.type === "TfsGit"){
        branchUrl = lastBuild.repository.url + "?version=GB" + branchName + "&_a=contents";
        commitUrl = lastBuild.repository.url + "/commit/" + lastBuild.sourceVersion;
      }
      else if(lastBuild.repository.type === "GitHub") {
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

      let clockCtrl = (<span><Icon iconName="Clock"/>&nbsp;Waiting...</span>);
      if(lastBuild.startTime !== undefined) {
        clockCtrl = (<span><Icon iconName="Clock"/>&nbsp;<Duration startDate={lastBuild.startTime} endDate={lastBuild.finishTime} /></span>);
      }
      if(lastBuild !== undefined && lastBuild.status !== BuildStatus.Completed) {
        let requestByCtrl = (<span className="font-size-s"><Icon iconName="People"/>&nbsp;{lastBuild.requestedFor!.displayName}</span>);
        currentRunningBuildCtrl.push(
            <div style={{ marginBottom: "5px"}}>
              <div style={{marginLeft: "10px"}}>
                <Status {...getBuildDefinitionStatusNew(lastBuild).statusProps} className="icon-small-margin" size={StatusSize.s}/>&nbsp;
                <Link href={buildUrl} target="_blank">{lastBuild.buildNumber}</Link>&nbsp;
              </div>
              <div style={{marginLeft: "10px"}}>
                <Icon iconName="BranchMerge"/>&nbsp;<Link href={branchUrl} target="_blank">{branchName}</Link>&nbsp;
                <Icon iconName="BranchCommit" /><Link href={commitUrl} target="blank">{lastBuild.sourceVersion.substr(0, 7)}</Link>&nbsp;
                {requestByCtrl}&nbsp;{clockCtrl}
              </div>
            </div>
        );
      }
    }
  }

  if(currentRunningBuildCtrl.length > 0) {
    return (
      <div className="font-size-s" style={{whiteSpace: "nowrap",marginTop: "10px", marginBottom: "10px", overflow: "hidden", textOverflow: "ellipsis"}}>
        <div className="fontWeightSemiBold font-weight-semibold" style={{ marginBottom: "5px"}}>Current runs</div>
        {currentRunningBuildCtrl}
      </div>
    );
  }
  return (<div></div>);
}

export function renderLastBuild02(
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<BuildDefinitionReference>,
  tableItem: BuildDefinitionReference
): JSX.Element {
  let lastBuildRun = tableItem.latestCompletedBuild;

  let requestByCtrl = (<div></div>);
  let buildTimeCtrl = (<div></div>);
  let queueName = "NA";

  if(lastBuildRun !== undefined && lastBuildRun.queue !== undefined){
    queueName = lastBuildRun.queue.name;
  } 

  if(lastBuildRun != undefined) {
    // Replace by Agent Name
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
          line2={buildTimeCtrl} />
  );
}

export function renderReleaseInfo01 (
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<BuildDefinitionReference>,
  tableItem: BuildDefinitionReference
) : JSX.Element {
  let lastBuild = tableItem.latestCompletedBuild;
  return (
    <DataContext.Consumer>
      {(context) => (
      <SimpleTableCell
            key={"col-" + columnIndex}
            columnIndex={columnIndex}
            tableColumn={tableColumn}>
              <div>
                {getReleaseTagFromBuild(lastBuild, context.state.releases, context.state.showAllBuildDeployment) }
              </div>
        </SimpleTableCell>
      )}
    </DataContext.Consumer>
  )
}

function getBuildDefinitionStatus(buildDefItem: BuildDefinitionReference) : IStatusIndicatorData {
  const indicatorData: IStatusIndicatorData = {
    label: "NA",
    statusProps: { ...Statuses.Queued, ariaLabel: "None" },
    color: lightGray
  };
  
  let lastBuild = buildDefItem.latestBuild;
  if(lastBuild != undefined) {
    return getPipelineIndicator(lastBuild.result, lastBuild.status);
  } 
  return indicatorData;
}

function getBuildDefinitionStatusNew(buildElement: Build) : IStatusIndicatorData {
  const indicatorData: IStatusIndicatorData = {
    label: "NA",
    statusProps: { ...Statuses.Queued, ariaLabel: "None" },
    color: lightGray
  };
  
  if(buildElement != undefined) {
    return getPipelineIndicator(buildElement.result, buildElement.status);
  } 
  return indicatorData;
}