import type { Monaco } from '@monaco-editor/loader';
import type { IPublicTypeRootSchema, IPublicApiMaterial } from '@alilc/lowcode-types';
import React, {
  forwardRef,
  useCallback,
  useRef,
  useEffect,
  type MutableRefObject,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import MonacoEditor from '@alilc/lowcode-plugin-base-monaco-editor';
import '@alilc/lowcode-plugin-base-monaco-editor/lib/style';

import vueTypeCode from './types/vue';
import vueRouterTypeCode from './types/vue-router';
import { generate } from 'short-uuid';
import { isFunction } from '@knxcloud/lowcode-utils';
import { parseCode } from './parse';

export interface JsEditorProps {
  jsCode?: string;
  material: IPublicApiMaterial;
}

export interface JsEditorInst {
  code: MutableRefObject<string>;
  monaco: MutableRefObject<Monaco>;
  transformSchema(rawSchema: IPublicTypeRootSchema): IPublicTypeRootSchema | void;
}

function getLibraryMap(material: IPublicApiMaterial) {
  const packages = material.getAssets().packages ?? [];
  const packageMap: Record<string, string> = {
    vue: 'Vue',
    'vue-router': 'VueRouter',
  };
  packages.forEach(({ package: _pkg, library }) => {
    if (_pkg) {
      packageMap[_pkg] = library;
    }
  });
  return packageMap;
}

const JsEditor = forwardRef<JsEditorInst, JsEditorProps>((props, ref) => {
  const monacoRef = useRef<Monaco>();
  const codeRef = useRef<string>(props.jsCode || '');

  const [instance] = useState<JsEditorInst>(() => ({
    code: codeRef as MutableRefObject<string>,
    monaco: monacoRef as MutableRefObject<Monaco>,
    transformSchema(rawSchema: IPublicTypeRootSchema): IPublicTypeRootSchema | void {
      const code = codeRef.current;
      const transformed = { ...rawSchema };
      const libraryMap = getLibraryMap(props.material);
      const { state, methods, lifeCycles } = parseCode(
        transformed.id || (transformed.id = generate()),
        code,
        libraryMap
      );

      Object.keys(state).length > 0
        ? (transformed.state = state)
        : delete transformed.state;

      Object.keys(methods).length > 0
        ? (transformed.methods = methods)
        : delete transformed.methods;

      Object.keys(lifeCycles).length > 0
        ? (transformed.lifeCycles = lifeCycles)
        : delete transformed.lifeCycles;

      (transformed.meta ?? (transformed.meta = {})).originCode = code;

      return transformed;
    },
  }));

  useEffect(() => {
    if (isFunction(ref)) {
      ref(instance);
    } else if (ref) {
      ref.current = instance;
    }
  }, []);

  const initEditor = useCallback((monaco: Monaco) => {
    monacoRef.current = monaco;

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: true,
    });

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.Preserve,
      allowJs: true,
      typeRoots: ['node_modules/@types'],
    });

    monaco.languages.typescript.typescriptDefaults.addExtraLib(vueTypeCode, 'vue.d.ts');
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      vueRouterTypeCode,
      'vue-router.d.ts'
    );
  }, []);

  return (
    <MonacoEditor
      language="typescript"
      value={props.jsCode}
      height="100%"
      editorDidMount={initEditor}
      onChange={(code) => (codeRef.current = code)}
    ></MonacoEditor>
  );
});

JsEditor.displayName = 'JsEditor';
JsEditor.propTypes = {
  jsCode: PropTypes.string,
};

export default JsEditor;
