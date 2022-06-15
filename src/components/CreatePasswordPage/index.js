import './classes.css';

import { useMutation, useQuery } from '@apollo/react-hooks';
import {
  Alert, Button, Card, Col, Form, Input, Row,
} from 'antd';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { CREATE_PASSWORD, USER_INFO } from '../../queries/users';

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 4, span: 16 },
};

export default function CreatePasswordPage() {
  const [form] = Form.useForm();
  const history = useHistory();
  /* eslint-disable-next-line camelcase */
  const { registration_uuid } = useParams();

  const { loading, error } = useQuery(USER_INFO, {
    /* eslint-disable-next-line camelcase */
    variables: { registration_uuid },
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      form.setFieldsValue({ email: data.userInfo.email });
    },
  });

  const [
    createPassword,
    { error: mutationError },
  ] = useMutation(CREATE_PASSWORD);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const onSumbit = () => {
    const formData = form.getFieldsValue();
    console.log(formData);
    createPassword({ variables: formData })
      .then(() => {
        window.message = 'You\'ve been successfully created password! Please login now!';
        history.push('/');
      })
      .catch((err) => console.log(err));
  };

  return (
    <Row className="login_page" justify="center" align="middle">
      <Col span={11} className="login">
        <Card
          bordered={false}
          size="default"
        >
          <h1>Create Your Password:</h1>
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
                disabled
                placeholder="Please input your email!"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password1"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password placeholder="Please input your password" />

            </Form.Item>

            <Form.Item
              label="Confirm password"
              name="password2"
              rules={[{ required: true, message: 'Please confirm your password!' }]}
            >
              <Input.Password placeholder="Please confirm your password" />

            </Form.Item>

            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit" onClick={onSumbit}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}
