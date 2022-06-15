import './classes.css';

import { InboxOutlined } from '@ant-design/icons';
import { useMutation } from '@apollo/react-hooks';
import {
  Alert, Button, Form, Input, message, Spin, Upload,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';

import { CREATE_CLASS, UPDATE_CLASS } from '../../queries/classes';
import { SAVE_IMAGE } from '../../queries/images';

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 4, span: 16 },
};

export default function CreateClassPage() {
  const [form] = Form.useForm();
  const history = useHistory();

  const [currentClass, setCurrentClass] = useState(window.currentClass);
  const [fileList, setFileList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState();

  const name = currentClass ? currentClass.name : '';
  const make = currentClass ? currentClass.make : '';

  const [cookies] = useCookies();
  const context = {
    context: {
      headers: {
        token: `${cookies.token}`,
      },
    },
  };

  useEffect(() => {
    if (currentClass) {
      form.setFieldsValue({ name, make });
    }
  });

  const [createClass] = useMutation(CREATE_CLASS, context);
  const [updateClass] = useMutation(UPDATE_CLASS, context);
  const [saveImage] = useMutation(SAVE_IMAGE, context);

  const handleError = (err) => {
    console.log(err);
    err && setError(err.message);
    setSaving(false);
  };

  async function uploadFiles(cls) {
    /* eslint-disable no-await-in-loop */
    for (const file of fileList) {
      if (file) {
        console.log('file', file);
        await saveImage({ variables: { file, cls_id: cls._id } });
      }
    }
  }

  const onSubmit = () => {
    setSaving(true);
    const formData = form.getFieldsValue();
    if (currentClass) {
      updateClass({ variables: formData })
        .then((cls) => cls.data.updateClass)
        .then((res) => {
          setCurrentClass(res);
          window.currentClass = res;
          uploadFiles(currentClass)
            .then(() => {
              history.push('/class');
            })
            .catch((err) => handleError(err));
        })
        .catch((err) => handleError(err));
    } else {
      createClass({ variables: formData })
        .then((cls) => cls.data.createClass)
        .then((res) => {
          setCurrentClass(res);
          window.currentClass = res;
          uploadFiles(res)
            .then(() => {
              history.push('/class');
            })
            .catch((err) => handleError(err));
        })
        .catch((err) => handleError(err));
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const props = {
    onRemove: (file) => {
      setFileList((prevState) => {
        const index = prevState.indexOf(file);
        const newFileList = prevState.slice();
        newFileList.splice(index, 1);
        return newFileList;
      });
    },
    beforeUpload: (file) => {
      console.log('file type', file.type);
      if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
        message.error(`${file.name} is not a png or jpg file`);
      } else {
        setFileList((prevState) => [...prevState, file]);
      }
      return false;
    },
    fileList,
  };

  console.log(fileList);
  return (
    <div className="class_page">
      <h1>{currentClass ? `Edit Class "${currentClass.name}"` : 'Create New Class' }</h1>
      {error && <Alert style={{ maxWidth: 600, margin: 'auto' }} message={error.slice(15)} type="error" />}
      <Form
        form={form}
        {...layout}
        name="basic"
        initialValues={{ remember: true }}
        labelAlign="left"
        style={{ margin: '50px auto', maxWidth: 600 }}
        onFinish={() => onSubmit()}
        onFinishFailed={onFinishFailed}
      >

        <Form.Item
          label="Class name"
          name="name"
          rules={[{ required: true, message: 'Please input class name!' }]}
        >
          <Input
            disabled={currentClass}
            placeholder="Please input class name!"
          />
        </Form.Item>

        <Form.Item
          label="Brand"
          name="make"
          rules={[{ required: true, message: 'Please input class make!' }]}
        >
          <Input placeholder="Please input class make!" />
        </Form.Item>

        <Form.Item {...tailLayout} style={{ textAlign: 'left' }} label="Upload images">
          <Upload {...props} accept=".png, .jpg, .jpeg, .JPG, .PNG" multiple>
            <Button icon={<InboxOutlined />}>Select images</Button>
          </Upload>
        </Form.Item>

        {saving ? <Spin size="large" />
          : (
            <Form.Item {...tailLayout}>
              <Button className="button" type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          )}

      </Form>

    </div>
  );
}
