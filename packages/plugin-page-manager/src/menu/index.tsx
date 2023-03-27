import {
  type IPublicApiProject,
  // IPublicApiSkeleton,
  // IPublicApiEvent,
  type IPublicTypeRootSchema,
  IPublicEnumTransformStage,
  type IPublicModelDocumentModel,
  // IPublicApiMaterial,
} from '@alilc/lowcode-types';
import React, { useState, useEffect } from 'react';
import './index.less';
import { Button, Tree, Search, Tab, Message } from '@alifd/next';
import { TreeNodeItem } from '../components/TreeNodeItem';
import { ListItem } from '../components/ListItem';
import { AddDialog } from '../components/AddDialog';

// export interface ErrorTipProps {
//   onClick: () => void;
//   isDisabled?: boolean;
// }
const TreeNode = Tree.Node;

export interface PageMenuProps {
  project: IPublicApiProject;
}

export interface Dictionary {
  pathName: string;
  label?: string;
  children: Dictionary[];
  files: string[];
}

export interface LowCodeMeta {
  /**
   * 永远等 {@link meta.roure.path}
   */
  componentName: 'Page';
  fileName?: string;
  meta?: {
    route: {
      /**
       * 页面的 RouteKey
       */
      name: string;
      /**
       * 页面路由
       */
      path: string;
      meta: {
        /**
         * 页面 title
         */
        title: string;
      };
    };
  };
}

export const PageMenu = ({ project }: PageMenuProps) => {
  // const schema = project.exportSchema(IPublicEnumTransformStage.Render);
  // schema.meta.vueFolders
  // const vueFolders = schema?.meta?.vueFolders || [];

  const [activeKey, setActiveKey] = useState<string>('page');

  const [selectedKeys, setSelectedKeys] = useState<string[]>();
  // dictionary结构 schema.meta.vueFolders
  const [treeData, setTreeData] = useState<any[]>([]);
  // project列表
  const [listData, setListData] = useState<any[]>();
  // 新建/重命名弹窗
  const [visible, setVisible] = useState<boolean>(false);
  const [isAdd, setIsAdd] = useState<boolean>(false);
  const [currentDocId, setCurrentDocId] = useState<string>();
  const [currentFileName, setCurrentFileName] = useState<string>();

  // 当前project/document id
  const [activeProjectId, setActiveProjectId] = useState<string>();

  const initialization = () => {
    const schema = project.exportSchema(IPublicEnumTransformStage.Render);
    const currentDocument: IPublicModelDocumentModel | null = project.currentDocument;
    setActiveProjectId(currentDocument?.id);
    const componentsTree = schema.componentsTree.filter(
      (val) => val.componentName === 'Page'
    );
    setListData(componentsTree);
    console.log('schema', schema);
    console.log('componentsTree', JSON.stringify(componentsTree));
  };

  const renderTreeNodes = (data) => {
    return (
      data &&
      data.map((item) => {
        if (item.children || item.children.length > 0) {
          return (
            <TreeNode
              label={<TreeNodeItem data={item} type="folder" onDel={delPage} />}
              key={item.key}
              className="treeNodes"
            >
              {renderTreeNodes(item.children)}
            </TreeNode>
          );
        }
        return (
          <TreeNode
            label={<TreeNodeItem data={item} type="file" onDel={delPage} />}
            key={item.key}
            className="treeNodes"
          />
        );
      })
    );
  };

  const onAdd = () => {
    setVisible(true);
    setIsAdd(true);
  };

  const createPage = (fileName) => {
    const addParams: IPublicTypeRootSchema = { componentName: 'Page', fileName };
    project.createDocument(addParams);
    setVisible(false);
    initialization();
  };

  const delPage = (docId) => {
    const doc: IPublicModelDocumentModel | null = project.getDocumentById(docId);
    if (doc) project.removeDocument(doc);
    Message.success('删除成功！');
    initialization();
  };

  const selectPage = (docId) => {
    if (docId) project.openDocument(docId);
    initialization();
  };

  const onRename = (docId, fileName) => {
    setCurrentFileName(fileName);
    setCurrentDocId(docId);
    setIsAdd(false);
    setVisible(true);
  };

  const renamePage = (fileName) => {
    const doc: IPublicModelDocumentModel | null = project.getDocumentById(
      currentDocId || ''
    );
    let schema = doc?.exportSchema(IPublicEnumTransformStage.Render);
    schema = { ...schema, fileName };
    doc?.importSchema(schema);
    setVisible(false);
    Message.success('重命名成功！');
    setCurrentFileName('');
    setCurrentDocId('');
    initialization();
  };

  useEffect(() => {
    const arr: IPublicTypeRootSchema[] = [
      { componentName: 'Page', fileName: 'page/index.vue' },
      { componentName: 'Page', fileName: 'page/aaa/index.vue' },
      { componentName: 'Page', fileName: 'page/aaa/aaa_aaa/index.vue' },
      { componentName: 'Page', fileName: 'page/bbb/index.vue' },
    ];
    arr.forEach((item) => {
      project.createDocument(item);
    });
    initialization();
  }, []);
  return (
    <div className="menu-box">
      <div className="menu-box-search">
        <Search
          key="2"
          shape="simple"
          hasClear
          onSearch={(val) => console.log('search_click:', val)}
        />
      </div>
      <div className="menu-box-tree">
        <Tab
          size="small"
          activeKey={activeKey}
          onChange={(key) => setActiveKey(key)}
          extra={
            <Button
              size="small"
              text
              type="primary"
              title={`新建${activeKey === 'page' ? '文件' : '文件夹'}`}
              onClick={onAdd}
            >
              Add
            </Button>
          }
        >
          {/* List */}
          <Tab.Item title="Page" key="page">
            {listData && listData.length > 0 ? (
              listData.map((item) => (
                <ListItem
                  data={item}
                  onDel={delPage}
                  onSelect={selectPage}
                  onRename={onRename}
                  key={item.docId}
                  active={item.docId === activeProjectId}
                />
              ))
            ) : (
              <Message type="notice" title="提示">
                ( ･´ω`･ ) 啥子都没得儿咯 ~
              </Message>
            )}
          </Tab.Item>
          <Tab.Item title="Directory" key="directory">
            {/* Tree */}
            {treeData && treeData.length > 0 ? (
              <Tree
                defaultExpandAll
                selectedKeys={selectedKeys}
                // showLine
                isNodeBlock={{ defaultPaddingLeft: 8 }}
                onSelect={(keys) => {
                  setSelectedKeys(keys);
                  console.log(keys);
                }}
              >
                {renderTreeNodes(treeData)}
              </Tree>
            ) : (
              <Message type="notice" title="提示">
                ( ･´ω`･ ) 啥子都没得儿咯 ~
              </Message>
            )}
          </Tab.Item>
        </Tab>
      </div>
      <AddDialog
        title={`${isAdd ? '新建' : '重命名'}`}
        type={activeKey === 'page' ? 'file' : 'folder'}
        visible={visible}
        defaultValue={currentFileName}
        onOk={isAdd ? createPage : renamePage}
        onCancel={() => {
          setVisible(false);
        }}
      ></AddDialog>
    </div>
  );
};

PageMenu.displayName = 'PageMenu';
