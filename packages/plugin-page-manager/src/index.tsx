import type { IPublicModelPluginContext } from '@alilc/lowcode-types';
import React from 'react';
import icon from './icon';
import { PageMenu } from './menu';
import 'uno.css';
import './style.css';

const plugin = ({ project, skeleton }: IPublicModelPluginContext) => {
  console.log('project', project.documents);
  return {
    name: 'pageManager',
    width: 154,
    // 依赖的插件（插件名数组）
    dep: [],
    // 插件对外暴露的数据和方法
    exports() {
      return {};
    },
    // 插件的初始化函数，在引擎初始化之后会立刻调用
    init() {
      const schemaDock = skeleton.add({
        area: 'leftArea',
        name: 'pageManager',
        type: 'PanelDock',
        props: {
          icon,
          description: '页面管理',
        },
        panelProps: {
          width: '400px',
          title: '页面管理',
        },
        content: <PageMenu project={project}></PageMenu>,
      });

      schemaDock && schemaDock.disable();
      project.onSimulatorRendererReady(() => {
        schemaDock.enable();
      });
    },
  };
};

plugin.pluginName = 'pageManager';

export default plugin;
