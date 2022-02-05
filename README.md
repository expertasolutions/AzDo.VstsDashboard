# CI/CD dashboard

Provide a simple way to view all Builds and Releases on a single page.
The intention was to see what's currently happened into the CI/CD pipeline and provide quick feedback of what's going on. See ***[Release notes](https://github.com/expertasolutions/VstsDashboard/releases)***

![CICD_Screencapture](screenshots/CI_CD_Dashboard.png)

## **Important**:
- **Pipeline YAML**, due to missing Rest API functionality to extract Pipeline Deployment Stage in Pipeline Yaml, they’re not supporting viewing Deployment Stage health. There is a way to extract the information, but this will cause a major overhead in terms of usability of this extension to your users account request per min on Azure DevOps Service.
- **After February 5th, 2022**, there **no longer support** to enhance on this extension. Since we moved all of our Projects on GitHub

## Permissions Authorization
Don't forget to Authorize the Extension permission under your Azure DevOps/Server Organization Settings/Extensions/CI/CD Dashboard.

  ![Issue0141-01](screenshots/PermissionAuth.png)

## Azure DevOps Supported versions
- Azure DevOps Services
- Azure DevOps Server 2019 update 1 (17.153.29207.5) and later - see [Azure DevOps Server build numbers](https://docs.microsoft.com/en-us/azure/devops/release-notes/features-timeline#server-build-numbers)

## More informations
- **UI Guidelines**: The UI of this extension has been developed in accordance of the [Formula Design System](https://developer.microsoft.com/en-ca/azure-devops) provided by Microsoft.

