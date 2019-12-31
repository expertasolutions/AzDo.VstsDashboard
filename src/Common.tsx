import "es6-promise/auto";

import * as React from "react";
import * as ReactDOM from "react-dom";

export function showRootComponent(component: React.ReactElement<any>) {
    alert('Hello from common.tsx');
    ReactDOM.render(component, document.getElementById("root"));
}