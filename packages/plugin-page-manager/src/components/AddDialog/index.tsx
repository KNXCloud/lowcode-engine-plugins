import { Dialog, Input } from '@alifd/next';
import React, { useState } from 'react';

export interface ListItemProps {
  type?: 'folder' | 'file';
  title?: string;
  visible: boolean;
  prefix?: string;
  onOk: (value: string | undefined) => void;
  onCancel: () => void;
}

export const AddDialog = ({
  title = 'title',
  visible = false,
  type = 'folder',
  prefix,
  onOk,
  onCancel,
}: ListItemProps) => {
  const [value, setValue] = useState<string>();

  return (
    <Dialog
      v2
      title={title}
      visible={visible}
      onOk={() => {
        onOk(value);
        setValue(undefined);
      }}
      onCancel={() => {
        onCancel();
        setValue(undefined);
      }}
      onClose={() => {
        onCancel();
        setValue(undefined);
      }}
      style={{ width: '33vw', minWidth: '450px' }}
    >
      <Input
        addonTextBefore={prefix ? prefix : null}
        addonTextAfter={type === 'folder' ? null : '.vue'}
        size="small"
        placeholder="请输入页面地址"
        style={{ width: '100%' }}
        onChange={(val) => setValue(val)}
      />
    </Dialog>
  );
};

AddDialog.displayName = 'ListItem';
