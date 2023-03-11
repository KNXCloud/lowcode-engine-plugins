import React from 'react';
import MonacoEditor from '@alilc/lowcode-plugin-base-monaco-editor';
import '@alilc/lowcode-plugin-base-monaco-editor/lib/style';

export interface JsEditorProps {
  jsCode?: string;
}

const JsEditor: React.FC<JsEditorProps> = (props) => {
  return <MonacoEditor language="typescript" value={props.jsCode}></MonacoEditor>;
};

export default JsEditor;
