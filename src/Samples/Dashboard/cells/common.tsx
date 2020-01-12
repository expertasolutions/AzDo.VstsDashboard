import * as React from "react";
import { css } from "azure-devops-ui/Util";
import { Icon, IIconProps } from "azure-devops-ui/Icon";
import { Status, IStatusProps, Statuses, StatusSize } from "azure-devops-ui/Status";
import { IColor } from "azure-devops-ui/Utilities/Color";
import { BuildResult, BuildStatus } from "azure-devops-extension-api/Build";
import { Deployment, DeploymentStatus, ReleaseReference } from "azure-devops-extension-api/Release";
import { Pill, PillVariant } from "azure-devops-ui/Pill";
import { PillGroup, PillGroupOverflow } from "azure-devops-ui/PillGroup";
import { Build } from "azure-devops-extension-api/Build";


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

export function getReleaseStatus(depl: Deployment) : IStatusIndicatorData {
  const indicatorData: IStatusIndicatorData = {
    label: "NA",
    statusProps: { ...Statuses.Queued, ariaLabel: "None" },
    color: lightGray,
  };
  
  return getReleaseIndicator(depl.deploymentStatus);
}

export function getReleaseIndicator(status: DeploymentStatus) : IStatusIndicatorData {
  const indicatorData: IStatusIndicatorData = {
    label: "NA",
    statusProps: { ...Statuses.Queued, ariaLabel: "None" },
    color: lightGreen
  };

  if(status === undefined){
    status = DeploymentStatus.Undefined;
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

export function getReleaseTagFromBuild(build: Build, releases: Array<Deployment>) {
  let deploys = releases.filter(
    x=> x.release.artifacts.find(
      a=> {
        let version = a.definitionReference["version"];
        return version.id === build.id.toString();
      }
    ) != null
  );

  let children = [];

  let releaseReferences = Array<ReleaseReference>();
  for(let i=0;i<deploys.length;i++) {
    let dep = deploys[i];
    if(releaseReferences.find(x=> x.id === dep.release.id) === undefined){
      releaseReferences.push(dep.release);
    }
  }

  let content = [];

  for(let relRef=0;relRef<releaseReferences.length;relRef++){
    let relRefInfo = releaseReferences[relRef];
    let lastRelease = Array<Deployment>();
    let releaseDeploys = deploys.filter(x=> x.release.id == relRefInfo.id);

    for(let i=0;i<releaseDeploys.length;i++){
      let dep = releaseDeploys[i];
      let lastDeploys = releaseDeploys.filter(x=> x.releaseEnvironment.id === dep.releaseEnvironment.id)
                                      .sort((x,y) => {
                                        return x.startedOn.getDate() - y.startedOn.getDate();
                                      });

      let lastDep = lastDeploys[0];
      if(lastRelease.find(x => x.releaseEnvironment.name === lastDep.releaseEnvironment.name) === undefined){
        lastRelease.push(lastDep);

        let relStatusInfo = getReleaseStatus(lastDep);
        children.push(<Pill color={relStatusInfo.color} variant={PillVariant.colored}>
                      <Status {...relStatusInfo.statusProps} className="icon-small-margin" size={StatusSize.s} />&nbsp;{lastDep.releaseEnvironment.name}</Pill>)
      }
    }
    if(deploys.length > 0) {
      content.push(<div><b>{relRefInfo.name}</b><p><PillGroup className="flex-row" overflow={PillGroupOverflow.wrap}>{children}</PillGroup></p></div>);
    }
  }

  if(releaseReferences.length > 0){
    return content;
  }
  return <div>Not deploy yet</div>
}