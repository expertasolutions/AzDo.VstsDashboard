import * as React from "react";

import { 
  WithIcon,
  IStatusIndicatorData,
  getPipelineIndicator,
  getReleaseTagFromBuild,
  lightGray,
  getReleaseTagFromBuildV2,
  getEnvironmentStageSummary
} from "./common";

import {
  ITableColumn,
  TwoLineTableCell,
  SimpleTableCell,
  ITable,
} from "azure-devops-ui/Table";

import { Ago } from "azure-devops-ui/Ago";
import { Duration } from "azure-devops-ui/Duration";

import { BuildStatus } from "azure-devops-extension-api/Build";
import { Status, Statuses, StatusSize } from "azure-devops-ui/Status";
import { Link } from "azure-devops-ui/Link";
import { Icon } from "azure-devops-ui/Icon";
import { DataContext, PipelineInfo } from "../dataContext";
import { Build } from "azure-devops-extension-api/Build";
import { Deployment } from "azure-devops-extension-api/Release";

export function renderBuildRef01 (
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<PipelineInfo>,
  tableItem: PipelineInfo
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

export function getPendingBuild(buildRef: PipelineInfo, buildList: Build[]) {
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
  tableColumn: ITableColumn<PipelineInfo>,
  tableItem: PipelineInfo
) {
  let lastBuild = tableItem.latestCompletedBuild;
  let contentRow1 = (<div>Not found</div>);
  let contentRow2 = (<div></div>);

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

function renderPendingBuild(buildRef:PipelineInfo, buildList: Build[]) {
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
        let sourceVersion = "";
        let sourceVersionCtrl = (<span></span>);
        
        if(lastBuild.sourceVersion !== undefined) {
          sourceVersion = lastBuild.sourceVersion.substr(0, 7);
          sourceVersionCtrl = (<Link href={commitUrl} target="blank">{sourceVersion}</Link>);
        } 

        currentRunningBuildCtrl.push(
            <div style={{ marginBottom: "5px"}}>
              <div style={{marginLeft: "10px"}}>
                <Status {...getBuildDefinitionStatusNew(lastBuild).statusProps} className="icon-small-margin" size={StatusSize.s}/>&nbsp;
                <Link href={buildUrl} target="_blank">{lastBuild.buildNumber}</Link>&nbsp;
              </div>
              <div style={{marginLeft: "10px"}}>
                <div>
                  <Icon iconName="BranchMerge"/>&nbsp;<Link href={branchUrl} target="_blank">{branchName}</Link>&nbsp;
                  <Icon iconName="BranchCommit" />{sourceVersionCtrl}&nbsp;
                </div>
                <div>
                  {requestByCtrl}&nbsp;{clockCtrl}
                </div>
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
  tableColumn: ITableColumn<PipelineInfo>,
  tableItem: PipelineInfo
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

export function renderAllInProgress(buildDefId: number, builds: Array<Build>, context: any, columnIndex: number, tableColumn: ITableColumn<PipelineInfo>) : Array<JSX.Element> {
  let childrens = Array<JSX.Element>();
  let pending = builds.filter(x=> x.definition.id ===buildDefId && x.status === BuildStatus.InProgress || x.status === BuildStatus.NotStarted).sort((a,b) => a.id-b.id);
  // TODO: Filter out build without environments stage in progress
  for(let i=0;i<pending.length;i++) {
    childrens.push(
      <div>
        {getReleaseTagFromBuildV2(pending[i], context.state.environments, context.state.approvals, context.state.showAllBuildDeployment, false)}
      </div>
    );
  }
  return childrens;
}

export function renderPipelineStageSummary(build: PipelineInfo, context: any, columnIndex: number, tableColumn: ITableColumn<PipelineInfo>) : JSX.Element {
  let buildClassicReleases = [];
  let releases = context.state.releases as Array<Deployment>;
  buildClassicReleases = releases.filter(
    x => x.release.artifacts.find(
      a => {
        let version = a.definitionReference["version"];
        if(build.latestCompletedBuild !== undefined) {
          return version.id === build.latestCompletedBuild.id.toString();
        }
        return false;
      }
    ) != null
  );

  let isClassicRelease = buildClassicReleases.length > 0;
  if(!isClassicRelease) {
    return (
      <div>
        {getEnvironmentStageSummary(build, context.state.environments, context.state.approvals)}
      </div>
    );
  }
  return (
    <div>
      {getReleaseTagFromBuild(build.latestCompletedBuild, context.state.releases, context.state.environments, context.state.approvals, context.state.showAllBuildDeployment) }
    </div>
  );
}

export function renderReleaseInfo01 (
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<PipelineInfo>,
  tableItem: PipelineInfo
) : JSX.Element {
  let lastCompletedBuild = tableItem.latestCompletedBuild;
  let lastBuild = tableItem.latestBuild;

  // TODO: Get Last Currently Running Pipelines
  if(lastBuild !== null && lastBuild !== undefined && lastCompletedBuild !== undefined && lastBuild.id !== lastCompletedBuild.id) {
    return (
      <DataContext.Consumer>
          {(context) => (
            <SimpleTableCell
                key={"col-" + columnIndex}
                columnIndex={columnIndex}
                tableColumn={tableColumn}>
              <div style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                <div style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                  {renderPipelineStageSummary(tableItem, context, columnIndex, tableColumn)}
                </div>
                <div style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                  {renderAllInProgress(tableItem.id, context.state.builds, context, columnIndex, tableColumn) }
                </div>
              </div>
            </SimpleTableCell>
          )}
        </DataContext.Consumer>
      );
  };
  
  return (
    <DataContext.Consumer>
        {(context) => (
          <SimpleTableCell
              key={"col-" + columnIndex}
              columnIndex={columnIndex}
              tableColumn={tableColumn}>
            <div>
              {renderPipelineStageSummary(tableItem, context, columnIndex, tableColumn)}
            </div>
          </SimpleTableCell>
        )}
      </DataContext.Consumer>
    );
}

function getBuildDefinitionStatus(buildDefItem: PipelineInfo) : IStatusIndicatorData {
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