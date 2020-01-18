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
    if(lastBuild.repository.type === "TfsGit"){
      branchUrl = lastBuild.repository.url + "?version=GB" + branchName + "&_a=contents";
      commitUrl = lastBuild.repository.url + "/commit/" + lastBuild.sourceVersion;
    }
    else if(lastBuild.repository.type === "GitHub"){
      branchUrl = "https://github.com/" + lastBuild.repository.id + "/tree/" + branchName;
      commitUrl = lastBuild._links.sourceVersionDisplayUri.href;
    }
    contentRow1 = WithIcon({
                            className: "fontSize font-size",
                            iconProps: { iconName: "Builds" },
                            children: (
                              <div><Link href={lastBuild._links.web.href} target="_blank">{lastBuild.buildNumber}</Link></div>
                            )
                  });
    contentRow2 = WithIcon({
                            className: "fontSize font-size",
                            iconProps: { iconName: "BranchMerge" },
                            children: (
                                <div><Link href={branchUrl} target="_blank">{branchName}</Link> - <Icon iconName="branchCommit" /><Link href={commitUrl} target="blank">{lastBuild.sourceVersion.substr(0, 7)}</Link></div>
                            )
                          });
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
    requestByCtrl = WithIcon({
                        className: "fontSize font-size bolt-table-two-line-cell-item",
                        iconProps: { iconName: "People" },
                        children: (
                          <div>{lastBuildRun.requestedFor!.displayName}</div>
                        )
                    });
    buildTimeCtrl = (<div>{WithIcon({
                              className: "fontSize font-size",
                              iconProps: { iconName: "Calendar" },
                              children: (
                                  <Ago date={lastBuildRun.startTime!} />
                              )
                          })}{
                            WithIcon({
                                className: "fontSize font-size bolt-table-two-line-cell-item",
                                iconProps: { iconName: "Clock" },
                                children: (
                                    <Duration startDate={lastBuildRun.startTime} endDate={lastBuildRun.finishTime} />
                                )
                            })
                          }
                    </div>)
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
    return (<div>not found</div>)
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