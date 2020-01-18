import * as React from "react";

import { 
  WithIcon,
  WithIconSpan,
  IStatusIndicatorData,
  getPipelineIndicator,
  getReleaseTagFromBuild,
  lightGray
} from "./common";

import {
  ITableColumn,
  TwoLineTableCell,
  SimpleTableCell,
} from "azure-devops-ui/Table";

import { Ago } from "azure-devops-ui/Ago";
import { Duration } from "azure-devops-ui/Duration";

import { BuildDefinitionReference } from "azure-devops-extension-api/Build";
import { Status, Statuses, StatusSize } from "azure-devops-ui/Status";
import { Link } from "azure-devops-ui/Link";
import { Icon } from "azure-devops-ui/Icon";
import { DataContext } from "../dataContext";

export function renderBuildRef01 (
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<BuildDefinitionReference>,
  tableItem: BuildDefinitionReference
): JSX.Element {
  let definitionUrl = tableItem._links.web.href;
  return (
      <SimpleTableCell
          columnIndex={columnIndex}
          tableColumn={tableColumn}
          key={"col-" + columnIndex}
          contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m scroll-hidden">
            <Status {...getBuildDefinitionStatus(tableItem).statusProps}
                    className="icon-large-margin"
                    size={StatusSize.l}/>
            <div>
              <Link href={definitionUrl} target="_blank">
                {tableItem.name}
              </Link>
            </div>
      </SimpleTableCell>
  );
}

export function renderLastBuild01 (
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<BuildDefinitionReference>,
  tableItem: BuildDefinitionReference
) {
  let lastBuild = tableItem.latestBuild;
  let contentRow1 = (<div>Not found</div>);
  let contentRow2 = (<div></div>);
  if(lastBuild != undefined) {
    let branchName = lastBuild.sourceBranch.replace('refs/heads/','');
    let branchUrl = "https://perdu.com"; 
    let commitUrl = "https://perdu.com";
    let buildUrl = lastBuild._links.web.href + "&view=logs";
    if(lastBuild.repository.type === "TfsGit"){
      branchUrl = lastBuild.repository.url + "?version=GB" + branchName + "&_a=contents";
      commitUrl = lastBuild.repository.url + "/commit/" + lastBuild.sourceVersion;
    }
    else if(lastBuild.repository.type === "GitHub"){
      branchUrl = "https://github.com/" + lastBuild.repository.id + "/tree/" + branchName;
      commitUrl = lastBuild._links.sourceVersionDisplayUri.href;
    }
    contentRow1 = (<div>
                    <Icon iconName="Build"/>&nbsp;<Link href={buildUrl} target="_blank">{lastBuild.buildNumber}</Link>
                  </div>);
    contentRow2 = (<div>
                    <Icon iconName="BranchMerge"/>&nbsp;<Link href={branchUrl} target="_blank">{branchName}</Link>
                    <Icon iconName="BranchCommit" />&nbsp;<Link href={commitUrl} target="blank">{lastBuild.sourceVersion.substr(0, 7)}</Link>
                  </div>);
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

export function renderLastBuild02(
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<BuildDefinitionReference>,
  tableItem: BuildDefinitionReference
): JSX.Element {
  let lastBuildRun = tableItem.latestBuild;

  let requestByCtrl = (<div></div>);
  let buildTimeCtrl = (<div></div>);
  if(lastBuildRun != undefined) {
    requestByCtrl = (<div><Icon iconName="People"/>&nbsp;{lastBuildRun.requestedFor!.displayName}</div>);

    if(lastBuildRun.startTime != undefined) {
      buildTimeCtrl = (<div>
                        <div><Icon iconName="Calendar"/>&nbsp;<Ago date={lastBuildRun.startTime!} /></div>
                        <div><Icon iconName="Clock"/>&nbsp;<Duration startDate={lastBuildRun.startTime} endDate={lastBuildRun.finishTime} /></div>
                      </div>);
    } else {
      buildTimeCtrl = (<div>
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

export function renderReleaseInfo01 (
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<BuildDefinitionReference>,
  tableItem: BuildDefinitionReference
) : JSX.Element {
  let lastBuild = tableItem.latestCompletedBuild;
  if(lastBuild === undefined) {
    return (<div><div>Not deploy yet</div></div>);
  }
  
  return (
    <DataContext.Consumer>
      {(context) => (
      <SimpleTableCell
            key={"col-" + columnIndex}
            columnIndex={columnIndex}
            tableColumn={tableColumn}>
              <div>
                {getReleaseTagFromBuild(lastBuild, context.state.releases) }
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