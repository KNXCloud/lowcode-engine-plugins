import { Dialog, Input } from '@alifd/next';
import React, { useState, useEffect } from 'react';

export interface ListItemProps {
  type?: 'folder' | 'file';
  title?: string;
  visible: boolean;
  // prefix?: string;
  defaultValue?: string;
  onOk: (value: string | undefined) => void;
  onCancel: () => void;
}

export const AddDialog = ({
  title = 'title',
  visible = false,
  type = 'folder',
  // prefix = '',
  defaultValue,
  onOk,
  onCancel,
}: ListItemProps) => {
  const [value, setValue] = useState<string>();
  useEffect(() => {
    if (type !== 'folder') {
      setValue(defaultValue?.split('.vue')[0]);
    } else {
      setValue(defaultValue);
    }
  }, [defaultValue]);
  return (
    <Dialog
      v2
      title={title}
      visible={visible}
      onOk={() => {
        // onOk(`${prefix}${value}${type === 'folder' ? '' : '.vue'}`);
        onOk(`${value}${type === 'folder' ? '' : '.vue'}`);
        setValue('');
      }}
      onCancel={() => {
        onCancel();
        setValue('');
      }}
      onClose={() => {
        onCancel();
        setValue('');
      }}
      style={{ width: '33vw', minWidth: '450px' }}
    >
      <Input
        // addonTextBefore={prefix ? prefix : null}
        addonTextAfter={type === 'folder' ? null : '.vue'}
        size="small"
        placeholder="请输入页面地址"
        style={{ width: '100%' }}
        value={value}
        onChange={(val) => setValue(val)}
      />
    </Dialog>
  );
};

AddDialog.displayName = 'ListItem';
