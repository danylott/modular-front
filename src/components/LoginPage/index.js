import './classes.css';

import { useMutation } from '@apollo/react-hooks';
import {
  Alert, Button, Card, Col, Form, Input, message, Row,
} from 'antd';
import React, { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { Link, useHistory } from 'react-router-dom';

import { LOGIN } from '../../queries/users';

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 4, span: 16 },
};

export default function LoginPage() {
  const [form] = Form.useForm();
  const history = useHistory();
  // do not remove cookies from here!
  /* eslint-disable-next-line no-unused-vars */
  const [cookies, setCookie, removeCookie] = useCookies(['token']);

  useEffect(() => {
    window.message && message.success(window.message);
    window.message = null;
  }, []);

  const [
    login,
    { error: mutationError },
  ] = useMutation(LOGIN);

  async function loginForm(data) {
    removeCookie('token');
    try {
      const res = await login({ variables: data });
      setCookie('token', res.data.login.token);
      return true;
    } catch (e) {
      return false;
    }
  }

  const onSubmit = () => {
    const formData = form.getFieldsValue();
    loginForm(formData)
      .then((success) => {
        if (success) {
          history.push('/classes');
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Row className="login_page" justify="center" align="middle">
      <Col span={11} className="login">
        <Card
          bordered={false}
          size="default"
        >
          <img
            alt="Krack logo"
            style={{ width: '40%' }}
            src={`${process.env.REACT_APP_IMAGES_URL}krack.svg`}
          />
          <h1>Log in:</h1>
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
          <Form
            form={form}
            {...layout}
            name="basic"
            initialValues={{ remember: true }}
            labelAlign="left"
            style={{ margin: '50px auto', maxWidth: 600 }}
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Please input your email!' }]}
            >
              <Input
                placeholder="Please input your email!"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password placeholder="Please input your password" />

            </Form.Item>

            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit" onClick={onSubmit}>
                Log in
              </Button>
            </Form.Item>
            <Link {...tailLayout} to="/create-password/forgot/">
              Forgot password?
            </Link>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}
