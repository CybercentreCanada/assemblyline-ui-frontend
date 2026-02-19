import type { ComponentType, MemoExoticComponent, ReactNode } from 'react';
import React from 'react';
import { PathParams } from '../models/router.models';

export const buildPath = <Path extends string>(path: Path, params: PathParams<Path>) => {
  return path.replace(/:([^/]+)/g, (_, key: string) => {
    const value = params[key as keyof PathParams<Path>];
    return encodeURIComponent(String(value));
  });
};

export const toElement = (value: ReactNode | MemoExoticComponent<ComponentType<any>>) => {
  if (React.isValidElement(value)) {
    return value;
  }

  const Component = value as ComponentType<any>;
  return <Component />;
};
