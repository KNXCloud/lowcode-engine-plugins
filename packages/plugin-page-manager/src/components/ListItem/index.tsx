import { Dialog, Icon } from '@alifd/next';
import React from 'react';
import './index.less';

export interface ListItemProps {
  data: any;
  active: boolean;
  onDel: (key: null | string) => void;
  onSelect: (key: null | string) => void;
  onRename: (key: null | string) => void;
}

export const ListItem = ({
  data,
  active = false,
  onDel,
  onSelect,
  onRename,
}: ListItemProps) => {
  return (
    <div
      className="list-item"
      style={
        active
          ? {
              backgroundColor: '#f5f5f5',
            }
          : {}
      }
    >
      <div className="list-item-label" onClick={() => onSelect(data)}>
        <Icon type="form" size="small" />
        <span className="list-item-label-file" title={data.fileName}>
          {data.fileName}
        </span>
      </div>
      <div className="list-item-btns">
        <Icon
          type="edit"
          title="重名名"
          className="btn"
          onClick={() => {
            onRename(data);
          }}
          size="small"
        />

        <Icon
          type="ashbin"
          title="删除"
          className="btn"
          onClick={() => {
            Dialog.confirm({
              v2: true,
              title: '提示',
              content: '是否要删除当前project',
              messageProps: {
                type: 'error',
              },
              onOk: () => onDel(data),
            });
          }}
          size="small"
        />
      </div>
    </div>
  );
};

ListItem.displayName = 'ListItem';
