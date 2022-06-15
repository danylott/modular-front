import './classes.css';

import { useMutation } from '@apollo/react-hooks';
import {
  Button, Card, Col, Form, Input, message, Row,
} from 'antd';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { RESET_PASSWORD } from '../../queries/users';

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 4, span: 16 },
};

export default function ForgotPasswordPage() {
  const [form] = Form.useForm();

  useEffect(() => {
    window.message && message.success(window.message.content);
  }, []);

  const [
    resetPassword,
  ] = useMutation(RESET_PASSWORD);

  const onSubmit = () => {
    const formData = form.getFieldsValue();
    resetPassword({ variables: formData })
      .then(() => {
        message.success('Instructions for reseting password were sent to your email!');
      })
      .catch((err) => {
        err?.graphQLErrors[0]?.extensions?.code === 'CUSTOM_ERROR_CODE'
        && message.error(err.graphQLErrors[0].message);
      });
  };

  return (
    <Row className="login_page" justify="center" align="middle">
      <Col span={11} className="login">
        <Card
          bordered={false}
          size="default"
        >
          <h1>Log in:</h1>
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

            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit" onClick={onSubmit}>
                Reset
              </Button>
            </Form.Item>
            <Link {...tailLayout} to="/">
              back to log in
            </Link>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}
