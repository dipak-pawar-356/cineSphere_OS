import React from "react";
import { Alert, AlertProps } from "./alert";

export function SuccessMessage({ title = "Operation Successful", children, ...props }: Omit<AlertProps, "type">) {
  return (
    <Alert type="success" title={title} {...props}>
      {children}
    </Alert>
  );
}

export function WarningMessage({ title = "Warning Alert", children, ...props }: Omit<AlertProps, "type">) {
  return (
    <Alert type="warning" title={title} {...props}>
      {children}
    </Alert>
  );
}

export function ErrorMessage({ title = "Error Encountered", children, ...props }: Omit<AlertProps, "type">) {
  return (
    <Alert type="danger" title={title} {...props}>
      {children}
    </Alert>
  );
}

export function InfoMessage({ title = "Notice Information", children, ...props }: Omit<AlertProps, "type">) {
  return (
    <Alert type="info" title={title} {...props}>
      {children}
    </Alert>
  );
}

