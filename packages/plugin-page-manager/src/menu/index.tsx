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
// const data = [
//   {
//     label: 'Page',
//     key: '1',
//     children: [
//       {
//         label: 'Form',
//         key: '2',
//         children: [
//           {
//             label: 'Input',
//             key: '4',
//           },
//           {
//             label: 'Select',
//             key: '5',
//           },
//         ],
//       },
//       {
//         label: 'Display',
//         key: '3',
//         children: [
//           {
//             label: 'Table',
//             key: '6',
//           },
//         ],
//       },
//     ],
//   },
// ];
const dataSource = [];

export const PageMenu = ({ project }: PageMenuProps) => {
  // openKeys
  // const [search, setSearch] = useState<string>();

  // const schema = project.exportSchema(IPublicEnumTransformStage.Render);
  // schema.meta.vueFolders
  // const vueFolders = schema?.meta?.vueFolders || [];
  // project.getDocumentByFileName()

  // project.onRemoveDocument

  const [activeKey, setActiveKey] = useState<string>('project');

  const [selectedKeys, setSelectedKeys] = useState<string[]>();
  // dictionary结构 schema.meta.vueFolders
  const [treeData, setTreeData] = useState<any[]>([]);
  // project列表
  const [listData, setListData] = useState<any[]>();
  // 新建/重命名弹窗
  const [visible, setVisible] = useState<boolean>(false);
  const [isAdd, setIsAdd] = useState<boolean>(false);
  const [current, setCurrent] = useState<any>();

  // 当前project/document id
  const [activeProjectId, setActiveProjectId] = useState<string>();

  const initialization = () => {
    const schema = project.exportSchema(IPublicEnumTransformStage.Render);
    const documents: IPublicModelDocumentModel[] = project.documents;
    // 当前project/document
    const currentDocument: IPublicModelDocumentModel | null = project.currentDocument;
    setActiveProjectId(currentDocument?.id);
    console.log('当前project/document', currentDocument);
    // const vueFolders = schema?.meta?.vueFolders || [];
    // console.log('project', project);
    console.log('schema', schema.componentsTree);
    setListData(schema.componentsTree);
    // console.log('documents', documents);
    // console.log('vueFolders', vueFolders);
  };

  const renderTreeNodes = (data) => {
    return (
      data &&
      data.map((item) => {
        if (item.children || item.children.length > 0) {
          return (
            <TreeNode
              label={<TreeNodeItem data={item} type="folder" onDel={onDel} />}
              key={item.key}
              className="treeNodes"
            >
              {renderTreeNodes(item.children)}
            </TreeNode>
          );
        }
        return (
          <TreeNode
            label={<TreeNodeItem data={item} type="file" onDel={onDel} />}
            key={item.key}
            className="treeNodes"
          />
        );
      })
    );
  };

  // 添加 project/document 弹窗
  const onAdd = () => {
    setVisible(true);
    setIsAdd(true);
  };

  // 添加project/document 操作
  const createPage = (fileName) => {
    const addParams: IPublicTypeRootSchema = { componentName: 'Page', fileName };
    console.log(111111111111, fileName, addParams);
    project.createDocument(addParams);
    setVisible(false);
    initialization();
  };

  // 删除 project/document
  const onDel = (key) => {
    const doc: IPublicModelDocumentModel | null = project.getDocumentById(key.docId);
    if (doc) project.removeDocument(doc);
    Message.success('删除成功！');
    initialization();
  };
  // 选择 project/document
  const onSelect = (key) => {
    const doc: IPublicModelDocumentModel | null = project.getDocumentById(key.docId);
    if (doc) project.openDocument(doc.id);
    initialization();
  };
  // 重命名 project/document 弹窗
  const onRename = (key) => {
    setCurrent(key);
    setIsAdd(false);
    setVisible(true);
  };

  // 重命名 project/document 操作
  const renamePage = (fileName) => {
    const schema = project.exportSchema(IPublicEnumTransformStage.Render);
    schema.componentsTree.forEach((e) => {
      if (e.docId == current.docId) {
        e.fileName = fileName;
      }
    });
    console.log('重命名', schema);
    project.importSchema(schema);
    setVisible(false);
    initialization();
  };
  useEffect(() => {
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
              title={`新建${activeKey === 'project' ? '文件' : '文件夹'}`}
              onClick={onAdd}
            >
              Add
            </Button>
          }
        >
          {/* List */}
          <Tab.Item title="Project" key="project">
            {listData && listData.length > 0 ? (
              listData.map((item) => (
                <ListItem
                  data={item}
                  onDel={onDel}
                  onSelect={onSelect}
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
        type={activeKey === 'project' ? 'file' : 'folder'}
        visible={visible}
        defaultValue={current?.fileName}
        onOk={isAdd ? createPage : renamePage}
        onCancel={() => {
          setVisible(false);
        }}
      ></AddDialog>
    </div>
  );
};

PageMenu.displayName = 'PageMenu';
