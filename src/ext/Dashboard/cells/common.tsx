import * as React from "react";
import { css } from "azure-devops-ui/Util";
import { Icon, IIconProps } from "azure-devops-ui/Icon";
import { Status, IStatusProps, Statuses, StatusSize } from "azure-devops-ui/Status";
import { IColor } from "azure-devops-ui/Utilities/Color";
import { BuildResult, BuildStatus } from "azure-devops-extension-api/Build";
import { Deployment, DeploymentStatus, ReleaseReference, ApprovalStatus, ReleaseDefinition } from "azure-devops-extension-api/Release";
import { Pill, PillVariant } from "azure-devops-ui/Pill";
import { PillGroup, PillGroupOverflow } from "azure-devops-ui/PillGroup";
import { Build } from "azure-devops-extension-api/Build";
import { Link } from "azure-devops-ui/Link";
import { PipelineEnvironment } from "../dataContext";

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


export function getReleaseTagFromBuild(build: Build, releases: Array<Deployment>, environments: Array<PipelineEnvironment>, allRelease: boolean) {
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

    for(let relRef=0;relRef<releaseReferences.length;relRef++){
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
  return getReleaseTagFromBuildV2(build, environments, allRelease);
}

export function getReleaseTagFromBuildV2(build: Build, environments: Array<PipelineEnvironment>, allRelease: boolean) {
  if(build === undefined) {
    return (<div>Not deployed yet</div>)
  }
  let allDeplRecords: any[] = [];
  for(let i=0;i<environments.length;i++) {
    if(environments[i] !== undefined) {
      allDeplRecords.push(...environments[i].deploymentRecords);
    }
  }

  let buildDeplRecords: any[] = allDeplRecords.find(x=> x.definition.id === build.definition.id);
  console.log("buildDeplRecords");
  console.log(buildDeplRecords);

  return (<div>Not deployed yet</div>)
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