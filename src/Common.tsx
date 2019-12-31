import "es6-promise/auto";

import * as React from "react";
import * as ReactDOM from "react-dom";

import { SurfaceBackground, SurfaceContext } from "azure-devops-ui/Surface";

export function showRootComponent(component: React.ReactElement<any>) {
    //ReactDOM.render(component, document.getElementById("root"));
    ReactDOM.render(
        <SurfaceContext.Provider value={{ background: SurfaceBackground.neutral }}>
            {component}
        </SurfaceContext.Provider>,
        document.getElementById("root")
    )
}