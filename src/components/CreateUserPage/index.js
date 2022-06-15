import './classes.css';

import { useMutation } from '@apollo/react-hooks';
import {
  Alert, Button, Form, Input,
} from 'antd';
import React from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';

import { REGISTER } from '../../queries/users';

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 4, span: 16 },
};

export default function UserPage() {
  const [form] = Form.useForm();
  const [cookies] = useCookies();
  const history = useHistory();

  const [
    login,
    { error: mutationError },
  ] = useMutation(REGISTER, {
    context: {
      headers: {
        token: cookies.token,
      },
    },
  });

  async function registerForm(data) {
    try {
      await login({ variables: data });
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  const onSubmit = () => {
    const formData = form.getFieldsValue();
    registerForm(formData)
      .then((success) => {
        if (success) {
          window.message = `User was created! We have sent an invitation to provided ${formData.email}`;
          history.push('/users');
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="login_page">
      <h1>Create User:</h1>
      <Form
        form={form}
        {...layout}
        name="basic"
        initialValues={{ remember: true }}
        labelAlign="left"
        style={{ margin: '50px auto', maxWidth: 600 }}
      >

        {mutationError
        && mutationError.graphQLErrors
        && mutationError.graphQLErrors[0]
        && mutationError.graphQLErrors[0].extensions
        && mutationError.graphQLErrors[0].extensions.code === 'CUSTOM_ERROR_CODE' && (
        <Alert
          type="error"
          style={{ margin: '50px auto', maxWidth: 600 }}
          message={mutationError.graphQLErrors[0].message}
        />
        )}

        <Form.Item
          label="Company"
          name="company"
          rules={[{ required: true, message: 'Please input your company!' }]}
        >
          <Input
            placeholder="Please input your company!"
          />
        </Form.Item>

        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please input your name!' }]}
        >
          <Input
            placeholder="Please input your name!"
          />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Please input your email!' }]}
        >
          <Input
            placeholder="Please input your email!"
          />
        </Form.Item>

        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit" onClick={onSubmit}>
            Create
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
