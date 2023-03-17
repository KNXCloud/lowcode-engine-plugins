import type {
  IPublicApiProject,
  // IPublicApiSkeleton,
  // IPublicApiEvent,
  // IPublicTypeRootSchema,
  // IPublicEnumTransformStage,
  // IPublicApiMaterial,
} from '@alilc/lowcode-types';
import React, { useState } from 'react';
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

  // const schema = project.exportSchema();

  // schema.meta.vueFolders

  // project.getDocumentByFileName()

  // project.onRemoveDocument

  const [activeKey, setActiveKey] = useState<string>('project');

  const [selectedKeys, setSelectedKeys] = useState<string[]>();
  // dictionary结构 schema.meta.vueFolders
  const [treeData, setTreeData] = useState<any[]>([]);
  // project列表
  const [listData, setListData] = useState<any[]>([
    {
      label:
        '少时诵诗书所所所所所所所所所所所所所所所所所所所所所所所所所所所少时诵诗书所所所所所所所所所所所所所所所所所所所所所所所所所所所',
      key: '3',
    },
  ]);
  console.log('project', project);
  const [visible, setVisible] = useState<boolean>(false);

  const renderTreeNodes = (data) => {
    return (
      data &&
      data.map((item) => {
        if (item.children || item.children.length > 0) {
          return (
            <TreeNode
              label={<TreeNodeItem data={item} type="folder" onDel={delNodes} />}
              key={item.key}
              className="treeNodes"
            >
              {renderTreeNodes(item.children)}
            </TreeNode>
          );
        }
        return (
          <TreeNode
            label={<TreeNodeItem data={item} type="file" onDel={delNodes} />}
            key={item.key}
            className="treeNodes"
          />
        );
      })
    );
  };

  const delNodes = (key) => {
    console.log('delNodes-key', key);
  };

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
              onClick={() => setVisible(true)}
            >
              Add
            </Button>
          }
        >
          {/* List */}
          <Tab.Item title="Project" key="project">
            {listData && listData.length > 0 ? (
              listData.map((item) => (
                <ListItem data={item} onDel={delNodes} key={item.key} />
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
        title="新建"
        type={activeKey === 'project' ? 'file' : 'folder'}
        visible={visible}
        onOk={() => {
          setVisible(false);
        }}
        onCancel={() => {
          setVisible(false);
        }}
      ></AddDialog>
    </div>
  );
};

PageMenu.displayName = 'PageMenu';
