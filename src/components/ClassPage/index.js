import './classPage.css';

import { CloseCircleOutlined, EditOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { Button, Popconfirm, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link, useHistory } from 'react-router-dom';

import { DELETE_CLASS } from '../../queries/classes';
import { DELETE_IMAGE, IMAGES } from '../../queries/images';

export default function ClassPage() {
  const history = useHistory();
  const [cookies] = useCookies();
  const { currentClass } = window;
  const [dataSource, setDataSource] = useState();

  const { loading, error, data } = useQuery(IMAGES, {
    variables: { id: currentClass ? currentClass._id : '' },
    context: {
      headers: {
        token: `${cookies.token}`,
      },
    },
    onCompleted: (resp) => {
      setDataSource(resp.class.images.map((image) => ({
        key: image._id,
        id: image._id,
        path: image,
        status: image.status,
        markup: image,
        delete: image,
      })));
    },
    fetchPolicy: 'network-only',
  });

  const [deleteClass] = useMutation(DELETE_CLASS, {
    context: {
      headers: {
        token: `${cookies.token}`,
      },
    },
  });

  const [deleteImage] = useMutation(DELETE_IMAGE, {
    context: {
      headers: {
        token: `${cookies.token}`,
      },
    },
  });

  useEffect(() => {
    if (!currentClass) {
      history.push('/classes');
    }
  });

  const markupImage = (image) => {
    window.currentImage = image;
    window.currentImages = data && data.class.images;
    history.push('/label-markup');
  };

  const editMarkup = () => {
    window.currentClass = data.class;
    history.push('/choose-image');
  };

  async function deleteClsAsync() {
    await deleteClass({ variables: { id: currentClass._id } });
    history.push('/classes');
  }

  const delImage = (im) => {
    deleteImage({ variables: { id: im._id } })
      .then(() => {
        setDataSource([...dataSource.filter((old) => old.id !== im._id)]);
      })
      .catch((err) => console.log(err));
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'path',
      render: (image) => (
          <img width="600px" alt={image.path} src={`${process.env.REACT_APP_IMAGES_URL}${(image.status === 'awaiting markup') ? image.path : `${image.path_labeled}?${new Date().getTime()}`}`} />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Markup',
      dataIndex: 'markup',
      render: (image) => (
          <Button onClick={() => markupImage(image)} type={image.status === 'awaiting markup' ? 'primary' : 'dashed'}>
            {image.status === 'awaiting markup' ? 'Create Markup' : 'Edit Markup'}
          </Button>
      ),
    },
    {
      title: 'Delete',
      dataIndex: 'delete',
      render: (image) => (
          <Popconfirm placement="leftTop" title="Are you sure you want to delete this image?" onConfirm={() => delImage(image)} okText="Yes" cancelText="No">
            <Button type="dashed">
              delete
            </Button>
          </Popconfirm>
      ),
    },
  ];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
      <div className="class_page">
        <h1>
          Class &quot;
          {data.class.name}
          &quot;
          <Link style={{ margin: 'auto 20px' }} to="/create-class">
            <EditOutlined
                style={{ fontSize: 'xxx-large' }}
                className="button"
            />
          </Link>
          <Popconfirm placement="leftTop" title="Are you sure you want to delete this class with all images?" onConfirm={deleteClsAsync} okText="Yes" cancelText="No">
            <CloseCircleOutlined
                style={{ fontSize: 'xxx-large', borderRadius: '25px' }}
                className="button"
            />
          </Popconfirm>
        </h1>

        <div className="text_markup">
          <h2>Text Markup</h2>
          {data.class.image_markup_path && (
              <img
                  width="600px"
                  alt={data.class.image_markup_path}
                  src={`${process.env.REACT_APP_IMAGES_URL}${`${data.class.image_markup_path}?${new Date().getTime()}`}`}
              />
          )}
          <Button
              onClick={() => editMarkup()}
              style={{ margin: 'auto 20px' }}
              type="primary"
              disabled={dataSource
              && dataSource.filter((image) => image.markup.path_labeled).length === 0}
          >
            {data.class.image_markup_path ? 'Edit Text Markup' : 'Add Text Markup'}
          </Button>
        </div>

        <div>
          <Table dataSource={dataSource} columns={columns} pagination={{ pageSize: 5 }} />
        </div>

      </div>
  );
}
