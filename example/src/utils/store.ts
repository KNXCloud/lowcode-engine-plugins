import { material, project } from '@alilc/lowcode-engine';
import { IPublicEnumTransformStage } from '@alilc/lowcode-types';

export const setPackgesToLocalStorage = async () => {
  const packages = material.getAssets().packages;
  window.localStorage.setItem('packages', JSON.stringify(packages));
};

export const setProjectSchemaToLocalStorage = () => {
  window.localStorage.setItem(
    'projectSchema',
    JSON.stringify(project.exportSchema(IPublicEnumTransformStage.Save))
  );
};

export const getProjectSchemaToLocalStorage = () => {
  const data = window.localStorage.getItem('projectSchema');
  return data && JSON.parse(data);
};

export const saveSchema = async () => {
  setProjectSchemaToLocalStorage();
  await setPackgesToLocalStorage();
};
