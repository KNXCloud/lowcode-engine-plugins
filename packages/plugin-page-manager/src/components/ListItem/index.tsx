import { Icon, Input } from '@alifd/next';
import React, { useState, useRef, useEffect } from 'react';
import './index.less';

export interface ListItemProps {
  data: any;
  onDel: (key: null | string) => void;
}

export const ListItem = ({ data, onDel }: ListItemProps) => {
  const inputRef = useRef<any>(null);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  useEffect(() => {
    if (isEdit) {
      console.log(isEdit, inputRef);
      inputRef.current?.focus();
    }
  }, [isEdit]);
  return (
    <div className="list-item">
      <div className="list-item-label" style={{ width: `${isEdit ? '100%' : '85%'}` }}>
        <Icon type="form" size="small" />
        {isEdit ? (
          <Input
            size="small"
            value={data.label}
            className="list-item-label-input"
            onBlur={(e) => {
              console.log('onBlur', e);
              setIsEdit(!isEdit);
            }}
            ref={inputRef}
          />
        ) : (
          <span className="list-item-label-file" title={data.label}>
            {data.label}
          </span>
        )}
      </div>
      {!isEdit && (
        <div className="list-item-btns">
          <Icon
            type="edit"
            title="编辑"
            className="btn"
            onClick={() => {
              setIsEdit(!isEdit);
              console.log('rename', data);
            }}
            size="small"
          />

          <Icon
            type="ashbin"
            title="删除"
            className="btn"
            onClick={() => {
              console.log('del', data);
              onDel(data.key);
            }}
            size="small"
          />
        </div>
      )}
    </div>
  );
};

ListItem.displayName = 'ListItem';
