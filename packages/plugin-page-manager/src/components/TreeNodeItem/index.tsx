import { Icon, Input, Balloon, Button, Menu, Dropdown } from '@alifd/next';
import React, { useState } from 'react';
import './index.less';

export interface TreeNodeItemProps {
  data: any;
  type: 'folder' | 'file';
  onDel: (key: null | string) => void;
}

export const TreeNodeItem = ({ data, type, onDel }: TreeNodeItemProps) => {
  const [isEdit, setisEdit] = useState<boolean>(false);
  return (
    <div className="tree-node-item">
      <div
        className="tree-node-item-label"
        title={`${type === 'folder' ? '文件夹' : '文件'}: path/path/path`}
      >
        {type === 'folder' ? <Icon type="calendar" /> : <Icon type="form" />}
        {isEdit ? (
          <Input size="small" value={data.label} />
        ) : (
          <span
            className={`tree-node-item-label-${type === 'folder' ? 'folder' : 'file'}`}
          >
            {data.label}
          </span>
        )}
      </div>
      <div className="tree-node-item-btns">
        <Balloon
          v2
          autoFocus
          trigger={<Icon type="add" title="新建" className="btn" />}
          closable={false}
          triggerType="click"
          className="balloon"
          align="r"
        >
          <Input placeholder="Small" size="small" label="SIZE :" />
        </Balloon>
        <Icon
          type="edit"
          title="重命名"
          className="btn"
          onClick={() => {
            setisEdit(!isEdit);
            console.log('rename', data);
          }}
        />

        <Icon
          type="ashbin"
          title="删除"
          className="btn"
          onClick={() => {
            console.log('del', data);
            onDel(data.key);
          }}
        />
      </div>
    </div>
  );
};

TreeNodeItem.displayName = 'TreeNodeItem';
