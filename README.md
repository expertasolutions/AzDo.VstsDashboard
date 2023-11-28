# CI/CD dashboard

Provide a simple way to view all Builds and Releases on a single page.
The intention was to see what's currently happened into the CI/CD pipeline and provide quick feedback of what's going on. See ***[Release notes](https://github.com/expertasolutions/VstsDashboard/releases)***

![CICD_Screencapture](screenshots/CI_CD_Dashboard.png)

## **Important**:
- **Pipeline YAML**: Since ***October 2023***, I've reopen this extension, due to some Azure DevOps Rest API enhancement for Environments deployment history & Approval.

## Permissions Authorization
Don't forget to Authorize the Extension permission under your Azure DevOps/Server Organization Settings/Extensions/CI/CD Dashboard.

  ![Issue0141-01](screenshots/PermissionAuth.png)

## Azure DevOps Supported versions
- Azure DevOps Services
- Azure DevOps Server 2020 (18.170.30525.1) and later
- <s>Azure DevOps Server 2019 update 1 (17.153.29207.5) and later</s>
  
  See [Azure DevOps Server build numbers](https://learn.microsoft.com/en-us/azure/devops/user-guide/lookup-platform-version?view=azure-devops)

## More informations
- **UI Guidelines**: The UI of this extension has been developed in accordance of the [Formula Design System](https://developer.microsoft.com/en-ca/azure-devops) provided by Microsoft.

