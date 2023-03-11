import {
  type IPublicApiProject,
  type IPublicApiSkeleton,
  type IPublicApiEvent,
  type IPublicTypeRootSchema,
  IPublicEnumTransformStage,
} from '@alilc/lowcode-types';
import { Tab, Box, Radio } from '@alifd/next';
import React, { useCallback, useState } from 'react';
import { SaveIcon, JsEditor } from '../components';
import './index.less';

interface CodeEditorPaneProps {
  project: IPublicApiProject;
  event: IPublicApiEvent;
  skeleton: IPublicApiSkeleton;
}

type ScriptMode = 'setup' | 'options';

export const CodeEditorPane = ({ project }: CodeEditorPaneProps) => {
  const [scriptMode, setScriptMode] = useState<ScriptMode>('setup');
  const [jsCode, setJsCode] = useState(() => {
    if (!project.currentDocument) return '';
    const schema: IPublicTypeRootSchema = project.currentDocument.exportSchema(
      IPublicEnumTransformStage.Render
    );
    console.log(schema.meta?.originCode);
    return '';
  });

  const doSave = useCallback(() => {
    console.log('save button clicked');
  }, []);

  return (
    <div className=":uno: flex flex-1 items-center text-15px w-full h-full vue-code-pane">
      <Tab
        className=":uno: h-full flex flex-col"
        shape="wrapped"
        size="small"
        extra={
          <Box direction="row" align="items-center" spacing={30}>
            <Radio.Group
              value={scriptMode}
              onChange={(mode) => setScriptMode(mode as ScriptMode)}
              dataSource={['setup', 'options']}
              shape="button"
            ></Radio.Group>
            <SaveIcon onClick={doSave}></SaveIcon>
          </Box>
        }
      >
        <Tab.Item title="index.js">
          <JsEditor></JsEditor>
        </Tab.Item>
        <Tab.Item title="index.css"></Tab.Item>
      </Tab>
    </div>
  );
};

CodeEditorPane.displayName = 'CodeEditorPane';
