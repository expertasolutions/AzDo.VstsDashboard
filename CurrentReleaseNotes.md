## Issues fixes

- ### [Issue0107](https://github.com/expertasolutions/VstsDashboard/issues/107)
  - According to the use of npm [azure-devops-extension-api](https://github.com/Microsoft/azure-devops-extension-api) module, there no possibility to use back this extension with the capability to choose which 'api-version' the module make request to the Azure DevOps Rest API call. The 'api-version' is currently hard-coded in the [azure-devops-extension-api](https://github.com/Microsoft/azure-devops-extension-api) node module. To make it work with previous version, I should need to downgrade the current 'azure-devops-extension-api' package, which I don't want to do, because in the moment I want to make sure to make it works properly on the current Azure DevOps Server and Azure DevOps online service.
  - Assign a minimal demand to api-version >= 5.1 to only support Azure DevOps Online and Azure DevOps Server higher than version 17.153.*. For more inforamtion about Azure DevOps Server version, please refer to this [version list](https://docs.microsoft.com/en-us/azure/devops/release-notes/features-timeline#server-build-numbers)

- ### [Issue0117](https://github.com/expertasolutions/VstsDashboard/issues/117)
  - more to come

- ### [Issue0126](https://github.com/expertasolutions/VstsDashboard/issues/126)
  - Convert Classic Release Pipeline to CI/CD Yaml Pipeline

- ### Other changes
  - UI display fix when no data is found.

- ### Packages Dependencies update
  - Update [azure-devops-extension-api](https://github.com/Microsoft/azure-devops-extension-api) from 1.150.0 to 1.153.2
  - Npm audit fix, reducing the number vulnerabilities from 39500 to 322

#### All these issues are part of the milestone [Delivery-200507](https://github.com/expertasolutions/VstsDashboard/milestone/3)