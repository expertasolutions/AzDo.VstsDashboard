# VstsDashboard

## Objectives

Provide a simple way to view all Builds and Releases on a single page.
The intend was to see what's currently happenned into the CI/CD pipeline and provide quick feedback of what's going on

## Local setup

1) Create a file named 'vsts.appsettings.json' into the folder 'Configs/Docker'.
    This file will not get push into git (see .gitignore files)
2) Copy the content of the file 'vsts.appsettings.template.json' into your file 'vsts.appsettings.json'
3) Put your AzureDevOps value into these properties
- OrgName: name of your AzureDevOps subscription
- PAT: Personal Access Token from you AzureDevOps (just give access in read to build and release scope)

## Build it from command line or vscode terminal
1) With the command line or vscode terminal, go into 'Builds' folder
2) Type this command 'docker-compose build && docker-compose up' and wait
3) Open a web browser on 'http://localhost:3000' and tada !!!

## Next: 
- How to build and release it to Kubernetes cluster with AzureDevOps Build and Release pipeline