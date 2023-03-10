import type { IWidget } from '@alilc/lowcode-editor-skeleton';
import * as React from 'react';
import { init, plugins, project, skeleton, material } from '@alilc/lowcode-engine';
import SchemaPlugin from '@alilc/lowcode-plugin-schema';
import ComponentsPane from '@alilc/lowcode-plugin-components-pane';
import { setupHostEnvironment } from '@knxcloud/lowcode-utils';
import { getProjectSchemaToLocalStorage, saveSchema } from './utils/store';
import { Button, Message } from '@alifd/next';
import './editor.scss';

const save = async () => {
  await saveSchema();
  Message.success('成功保存到本地');
};

(async () => {
  await plugins.register(SchemaPlugin);

  // 注册组件面板
  const componentsPane = skeleton.add({
    area: 'leftArea',
    type: 'PanelDock',
    name: 'componentsPane',
    content: ComponentsPane,
    props: {
      align: 'top',
      icon: 'zujianku',
      description: '组件库',
    },
  }) as IWidget;

  componentsPane.disable?.();
  project.onSimulatorRendererReady(() => {
    componentsPane.enable?.();
  });

  const loadedAssets = await fetch('http://127.0.0.1:9000/assets.json')
    .then((res) => res.json())
    .catch(() => null);
  loadedAssets && material.setAssets(loadedAssets);

  const projectSchema = getProjectSchemaToLocalStorage();
  const schema = projectSchema
    ? projectSchema['componentsTree'].pop()
    : { fileName: '/', componentName: 'Page' };

  project.onSimulatorRendererReady(() => {
    project.openDocument(schema);
  });

  skeleton.add({
    name: 'saveSample',
    area: 'topArea',
    type: 'Widget',
    props: { align: 'right' },
    content: <Button onClick={save}>保存到本地</Button>,
  });

  setupHostEnvironment(project, '/js/vue.runtime.global.js');

  const container = document.getElementById('lce-container');
  if (container) {
    await init(container, {
      enableCondition: true,
      enableCanvasLock: true,
      supportVariableGlobally: true,
      simulatorUrl: ['/js/vue-simulator-renderer.js', '/js/vue-simulator-renderer.css'],
    });
  }
})();
