import * as React from "react";
import { css } from "azure-devops-ui/Util";
import { Icon, IIconProps } from "azure-devops-ui/Icon";
import { Status, IStatusProps, Statuses, StatusSize } from "azure-devops-ui/Status";
import { IColor } from "azure-devops-ui/Utilities/Color";
import { BuildResult, BuildStatus } from "azure-devops-extension-api/Build";
import { Deployment, DeploymentStatus, ReleaseReference, ApprovalStatus, ReleaseDefinition, ReleaseStatus } from "azure-devops-extension-api/Release";
import { Pill, PillVariant } from "azure-devops-ui/Pill";
import { PillGroup, PillGroupOverflow } from "azure-devops-ui/PillGroup";
import { Build } from "azure-devops-extension-api/Build";
import { Link } from "azure-devops-ui/Link";
import { PipelineEnvironment } from "../dataContext";
import { Ago } from "azure-devops-ui/Ago";
import { Duration } from "azure-devops-ui/Duration";

import { PipelineInfo } from "../dataContext";

const lightGreen: IColor = {
  red: 204,
  green: 255,
  blue: 204,
};

const lightRed: IColor = {
  red: 255,
  green: 204,
  blue: 204,
};

const lightBlue: IColor = {
  red: 204,
  green: 229,
  blue: 255,
};

const lightOrange : IColor = {
  red: 255,
  green: 229, 
  blue: 204,
}

export const lightGray : IColor = {
  red: 224,
  green: 224,
  blue: 224,
}

export interface IStatusIndicatorData {
  statusProps: IStatusProps;
  label: string;
  color: IColor;
}

export function WithIcon(props: {
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

export function WithIconSpan(props: {
  className?: string;
  iconProps: IIconProps;
  children?: React.ReactNode;
}) {
  return (
      <span className={css(props.className, "flex-row flex-center")}>
          {Icon({ ...props.iconProps, className: "icon-margin" })}
          {props.children}
      </span>
  );
}

export function getReleaseStatus(depl: Deployment, pendingApproval: boolean) : IStatusIndicatorData {
  const indicatorData: IStatusIndicatorData = {
    label: "NA",
    statusProps: { ...Statuses.Queued, ariaLabel: "None" },
    color: lightGray,
  };
  return getReleaseIndicator(depl.deploymentStatus, pendingApproval);
}

export function getApprovalIndicator(status: number) : IStatusIndicatorData {
  const indicatorData: IStatusIndicatorData = {
    label: "NA",
    statusProps: { ...Statuses.Queued, ariaLabel: "None" },
    color: lightGreen
  };

  if(status === undefined){
    status = DeploymentStatus.Undefined;
  }

  switch(status) {
    case 2:
      indicatorData.statusProps = { ...Statuses.Queued, ariaLabel: "PendingApproval"};
      indicatorData.label = "Pending Approval";
      indicatorData.color = lightBlue;
      break;
    case 4:
      indicatorData.statusProps = { ...Statuses.Success, ariaLabel: "Approved"};
      indicatorData.label = "Approved";
      indicatorData.color = lightGreen;
      break;
    case 8:
      indicatorData.statusProps = { ...Statuses.Failed, ariaLabel: "Rejected"};
      indicatorData.label = "Rejected";
      indicatorData.color = lightRed;
      break;
    case 32:
      indicatorData.statusProps = { ...Statuses.Queued, ariaLabel: "Canceled"};
      indicatorData.label = "NA";
      indicatorData.color = lightGray;
      break;
    case 64:
      indicatorData.statusProps = { ...Statuses.Queued, ariaLabel: "Timed Out"};
      indicatorData.label = "Time Out";
      indicatorData.color = lightGray;
      break;
    default:
      indicatorData.statusProps = { ...Statuses.Queued, ariaLabel: "Canceled"};
      indicatorData.label = "NA";
      indicatorData.color = lightGray;
      break;
  }
  return indicatorData;
}

export function getStageIndicator(status: number, pendingApproval: boolean): IStatusIndicatorData {
  const indicatorData: IStatusIndicatorData = {
    label: "NA",
    statusProps: { ...Statuses.Queued, ariaLabel: "None" },
    color: lightGreen
  };

  if(status === undefined){
    status = DeploymentStatus.Undefined;
  }

  if(pendingApproval){
    indicatorData.statusProps = { ...Statuses.Waiting, ariaLabel: "Waiting Approval"};
    indicatorData.label = "Waiting Approval";
    indicatorData.color = lightBlue;
    return indicatorData;
  }

  switch(status){
    case -1:
      indicatorData.statusProps = { ...Statuses.Running, ariaLabel: "InProgress"};
      indicatorData.label = "In Progress";
      indicatorData.color = lightBlue;
      break;
    case 0: // Success
      indicatorData.statusProps = { ...Statuses.Success, ariaLabel: "Success"};
      indicatorData.label = "Success";
      indicatorData.color = lightGreen;
      break;
    case 1: // succeededWithIssues
      indicatorData.statusProps = { ...Statuses.Warning, ariaLabel: "PartiallySucceeded"};
      indicatorData.label = "PartiallySucceeded";
      indicatorData.color = lightOrange;
      break;
    case 2:
      indicatorData.statusProps = { ...Statuses.Failed, ariaLabel: "Fail"};
      indicatorData.label = "Fail";
      indicatorData.color = lightRed;
      break;
    case 3:
      indicatorData.statusProps = { ...Statuses.Queued, ariaLabel: "Canceled"};
      indicatorData.label = "Not Deployed";
      indicatorData.color = lightGray;
      break;
    default:
      indicatorData.statusProps = { ...Statuses.Queued, ariaLabel: "Stopped"};
      indicatorData.label = "Not Deployed";
      indicatorData.color = lightGray;
      break;
  }
  return indicatorData;
}

export function getReleaseIndicator(status: DeploymentStatus, pendingApproval: boolean) : IStatusIndicatorData {
  const indicatorData: IStatusIndicatorData = {
    label: "NA",
    statusProps: { ...Statuses.Queued, ariaLabel: "None" },
    color: lightGreen
  };

  if(status === undefined){
    status = DeploymentStatus.Undefined;
  }

  if(pendingApproval){
    indicatorData.statusProps = { ...Statuses.Waiting, ariaLabel: "Waiting Approval"};
    indicatorData.label = "Waiting Approval";
    indicatorData.color = lightBlue;
    return indicatorData;
  }

  switch(status){
    case DeploymentStatus.NotDeployed:
      indicatorData.statusProps = { ...Statuses.Queued, ariaLabel: "Canceled"};
      indicatorData.label = "Not Deployed";
      indicatorData.color = lightGray;
      break;
    case DeploymentStatus.Succeeded:
      indicatorData.statusProps = { ...Statuses.Success, ariaLabel: "Success"};
      indicatorData.label = "Success";
      indicatorData.color = lightGreen;
      break;
    case DeploymentStatus.Failed:
      indicatorData.statusProps = { ...Statuses.Failed, ariaLabel: "Fail"};
      indicatorData.label = "Fail";
      indicatorData.color = lightRed;
      break;
    case DeploymentStatus.PartiallySucceeded:
      indicatorData.statusProps = { ...Statuses.Warning, ariaLabel: "PartiallySucceeded"};
      indicatorData.label = "PartiallySucceeded";
      indicatorData.color = lightOrange;
      break;
    case DeploymentStatus.InProgress:
      indicatorData.statusProps = { ...Statuses.Running, ariaLabel: "InProgress"};
      indicatorData.label = "In Progress";
      indicatorData.color = lightBlue;
      break;
  }
  return indicatorData;
}

export function getPipelineIndicator(result: BuildResult, status:BuildStatus) : IStatusIndicatorData {
  const indicatorData: IStatusIndicatorData = {
    label: "NA",
    statusProps: { ...Statuses.Queued, ariaLabel: "None" },
    color: lightGray,
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
          indicatorData.statusProps = { ...Statuses.Waiting, ariaLabel: "Not Started"};
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

export function getReleaseTagFromBuild(build: Build, releases: Array<Deployment>, environments: Array<PipelineEnvironment>, approvals: Array<any>, allRelease: boolean) {
  if(build === undefined) {
    return (<div>Not deployed yet</div>);
  }

  let deploys = releases.filter(
    x=> x.release.artifacts.find(
      a=> {
        let version = a.definitionReference["version"];
        return version.id === build.id.toString();
      }
    ) != null
  );

  let uniqueRelDef = Array<string>();
  for(let feDep=0;feDep<deploys.length;feDep++){
    let dep = deploys[feDep];
    if(uniqueRelDef.find(x=> x === dep.releaseDefinition.name) === undefined){
      uniqueRelDef.push(dep.releaseDefinition.name);
    }
  }

  let content = [];

  for(let feDep=0;feDep<uniqueRelDef.length;feDep++){
    let depName = uniqueRelDef[feDep];

    deploys = releases.filter(
      x=> x.release.artifacts.find(
        a=> {
          let version = a.definitionReference["version"];
          return version.id === build.id.toString();
        }
      ) != null && x.releaseDefinition.name === depName
    );
    
    let releaseReferences = Array<ReleaseReference>();
    for(let i=0;i<deploys.length;i++) {
      let dep = deploys[i];
      
      if(releaseReferences.find(x=> x.id === dep.release.id && dep.releaseDefinition.name === depName) === undefined) {
        releaseReferences.push(dep.release);
      }
    }

    let children = [];
    let lastRelease = Array<string>();

    releaseReferences = releaseReferences.sort((a, b) => b.id - a.id);

    for(let relRef=0;relRef<releaseReferences.length;relRef++) {
      let relRefInfo = releaseReferences[relRef];
      lastRelease = Array<string>();
      let releaseDeploys = deploys.filter(x=> x.release.id == relRefInfo.id && x.releaseDefinition.name === depName)
                            .sort((a,b)=> a.releaseEnvironment.id - b.releaseEnvironment.id);


      for(let i=0;i<releaseDeploys.length;i++) {
        let dep = releaseDeploys[i];
        //let dep = releaseDeploys[0];

        let lastDeploys = releaseDeploys.filter(x=> x.releaseEnvironment.name === dep.releaseEnvironment.name);

        for(let x=0;x<lastDeploys.length;x++) {
          let lastDep = lastDeploys[x];
          //let lastDep = lastDeploys.sort(x=> -x.attempt)[0];
          let envName = lastDep.releaseEnvironment.name;
          let env = lastRelease.find(x => x === envName);

          if(env === undefined) {
            let pendingApproval = waitingForApproval(lastDep, lastDep.releaseEnvironment.id);
            let envDepNumber = lastDeploys.length;

            lastRelease.push(lastDep.releaseEnvironment.name);
            let relStatusInfo = getReleaseStatus(lastDep, pendingApproval);
            let pillContent = " " + lastDep.releaseEnvironment.name + " ";
            
            if(envDepNumber > 1) {
              pillContent += "(" + envDepNumber + ")";
            }

            children.push(
              <Pill color={relStatusInfo.color} variant={PillVariant.colored} 
                onClick={() => window.open(lastDep.releaseEnvironment._links.web.href, "_blank") }>
                <Status {...relStatusInfo.statusProps} className="icon-small-margin" size={StatusSize.s} />{pillContent}
              </Pill>)
          }
        }
      }

      let all = allRelease;
      if(all === false) {
        relRef = releaseReferences.length;
      }

      if(deploys.length > 0) {
        content.push(<div style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                        <Link href={relRefInfo._links.web.href} target="_blank"><b>{depName}</b> ({relRefInfo.name})</Link>
                        <p><PillGroup className="flex-row" overflow={PillGroupOverflow.wrap}>{children}</PillGroup></p>
                    </div>);
      }
      children = [];
    }
  }

  if(content.length > 0){
    return content;
  }
  return getReleaseTagFromBuildV2(build, environments, approvals, allRelease, true);
}

export function getReleaseTagFromBuildV2(build: Build, environments: Array<PipelineEnvironment>, approvals: Array<any>, allRelease: boolean, showDefaultOnEmpty: boolean) {
  if(build === undefined) {
    return (<div>Not deployed yet</div>)
  }
  let allDeplRecords: any[] = [];
  for(let i=0;i<environments.length;i++) {
    if(environments[i] !== undefined) {
      allDeplRecords.push(...environments[i].deploymentRecords);
    }
  }

  let content: any[] = [];

  // Last Build Execution
  let buildDeplRecords = allDeplRecords.filter(x=> x.owner.id === build.id).sort((a,b) => a.id - b.id);
  let buildIDApprovals = approvals.filter(x=> x.pipeline !== undefined && x.pipeline.owner.id === build.id);
  let children: any[] = [];
  let showedEnvStages = Array<any>();
  for(let i=0;i<buildDeplRecords.length;i++) {
    let elm = buildDeplRecords[i];
    if(buildDeplRecords[i].definition.id === build.definition.id) {
      let currentShowed = showedEnvStages.find(x=> x.stageName === elm.stageName);
      if(currentShowed === undefined) {
        showedEnvStages.push(elm);
      } else if(elm.stageAttempt > currentShowed.stageAttempt) {
        let indx = showedEnvStages.findIndex(x=> x.id === currentShowed.id);
        showedEnvStages[indx] = elm;
      }
    }
  }
    
  for(let i=0;i<showedEnvStages.length;i++) {
    let elm = showedEnvStages[i];
    let attempCounts = "";
    if(elm.jobAttemp > 1) {
      attempCounts = `(${elm.stageAttempt})`;
    }
    let deplStatus = getStageIndicator(elm.result === undefined ? -1 : elm.result, false);

    children.push(
      <Pill color={deplStatus.color} variant={PillVariant.colored} 
          onClick={() => window.open(elm.owner._links.web.href, "_blank") }>
        <Status {...deplStatus.statusProps} className="icon-small-margin" size={StatusSize.s} />&nbsp;{elm.stageName}&nbsp;{attempCounts}
      </Pill>
    );
  }

  //x.status !== 4
  if(build.definition.id === 240 && buildIDApprovals.filter(x=> x.status !== 4 || x.status !== 64).length > 0 ) {
    console.log('Show Approvals');
  }
  for(let i=0;i<buildIDApprovals.filter(x=> x.status !== 4 || x.status !== 64).length;i++) {
    let elm = buildIDApprovals[i];
    let status = `(${elm.status})`;
    if(build.definition.id === 240 ) {
      console.log(elm);
    }
    let approvalStatus = getApprovalIndicator(elm.status);
    children.push(
      <Pill color={approvalStatus.color} variant={PillVariant.colored}
          onClick={() => window.open(elm.pipeline.owner._links.web.href, "_blank") }>
        &nbsp;Pending Approval: &nbsp;{elm.id}&nbsp;{status}
      </Pill>
    );
  }

  if(children.length > 0) {
    content.push(
      <div style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
        <Link href={build._links.web.href} target="_blank"><b>{build.definition.name}</b> ({build.buildNumber})</Link>
        <p>
          <PillGroup className="flex-row" overflow={PillGroupOverflow.wrap}>{children}</PillGroup>
        </p>
      </div>
    )
  }

  if(content.length > 0) {
    return content;
  }
  if(showDefaultOnEmpty) {
    return (<div>Not deployed yet</div>)
  }
  // TODO: Put this hidden;
  return (<div></div>);
}

export function getEnvironmentStageSummary(build: PipelineInfo, environments: Array<PipelineEnvironment>, approvals: Array<any>) {
  if(build === undefined) {
    return (<div>Problem !</div>)
  }

  let buildEnvironments = Array<any>();
  for(let i=0;i<environments.length;i++) {
    let currentEnv = environments[i];
    let buildUseEnvironment = currentEnv.deploymentRecords.find(x=> x.definition.id === build.id);
    if(buildUseEnvironment !== undefined) {
      let currentElement = {
        environment: currentEnv,
        lastExecution: undefined
      };

      let lastExecution = currentEnv.deploymentRecords.filter(x=> x.definition.id === build.id).sort((a,b) => a.id - b.id);
      if(lastExecution.length > 0) {
        currentElement.lastExecution = lastExecution[lastExecution.length - 1];
        buildEnvironments.push(currentElement);
      }
    }
  }
  buildEnvironments = buildEnvironments.sort((a,b) => a.environment.id - b.environment.id);

  let childrens = Array<any>();
  for(let i=0;i<buildEnvironments.length;i++) { 
    let curEnv = buildEnvironments[i];
    //console.log(curEnv);
    let envStatus = getStageIndicator(curEnv.lastExecution.result === undefined ? -1 : curEnv.lastExecution.result, false);
    let attempCounts = "";
    if(curEnv.lastExecution.jobAttemp > 1) {
      attempCounts = `(${curEnv.lastExecution.stageAttempt})`;
    }
    let queueTimeCleanup = curEnv.lastExecution.queueTime.replace('/Date(', '').replace(')/','').replace(')','');
    let queueDateTime = new Date(Number(queueTimeCleanup));

    let startDateTime : Date = new Date();
    let endDateTime : Date = new Date();

    if(curEnv.lastExecution.startTime !== undefined) {
      let startDateTimeCleanup = curEnv.lastExecution.startTime.replace('/Date(', '').replace(')/','').replace(')','');
      startDateTime = new Date(Number(startDateTimeCleanup));
    } else {
      startDateTime = queueDateTime
    }

    if(curEnv.lastExecution.finishTime !== undefined) {
      let endDateTimeCleanup = curEnv.lastExecution.finishTime.replace('/Date(', '').replace(')/','').replace(')','');
      endDateTime = new Date(Number(endDateTimeCleanup));
    }

    childrens.push(
      <Pill color={envStatus.color} variant={PillVariant.colored} 
        onClick={() => window.open(curEnv.lastExecution.owner._links.web.href, "_blank")}>
        <div className="font-size-s">
          <Status {...envStatus.statusProps} className="icon-small-margin" size={StatusSize.s} />&nbsp;{curEnv.lastExecution.stageName}&nbsp;{attempCounts}&nbsp;<Icon iconName="Clock"/>&nbsp;<Duration startDate={startDateTime} endDate={endDateTime} />&nbsp;<Icon iconName="Calendar"/>&nbsp;<Ago date={queueDateTime} />
        </div>
        <div style={{ paddingLeft: 16 }} className="font-size-s">{curEnv.lastExecution.owner.name}</div>
      </Pill>
    );
  }

  return (
    <div style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
      <b>Current Deployment Status</b>
      <p>
        <PillGroup className="flex-row" overflow={PillGroupOverflow.wrap}>{childrens}</PillGroup>
      </p>
    </div>
  );
}

export function waitingForApproval(dep: Deployment, envId: number) {
  let preApproval = dep.preDeployApprovals.find(x=> x.releaseEnvironment.id === envId);
  if(preApproval !== undefined && preApproval.status === ApprovalStatus.Pending) {
    return true;
  }

  let postApproval = dep.postDeployApprovals.find(x=> x.releaseEnvironment.id === envId);
  if(postApproval !== undefined && postApproval.status === ApprovalStatus.Pending) {
    return true;
  }
  return false;
}