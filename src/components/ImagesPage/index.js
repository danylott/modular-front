import './classes.css';

import { useMutation, useQuery } from '@apollo/react-hooks';
import { Card, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';

import { CROP_STICKER, IMAGES } from '../../queries/images';

export default function ImagesPage() {
  const { currentClass } = window;
  const [choosing, setChoosing] = useState(false);
  const history = useHistory();

  const [cookies] = useCookies();

  useEffect(() => {
    if (!currentClass) {
      history.push('/classes');
    }
  });

  const { loading, error, data } = useQuery(IMAGES, {
    variables: { id: currentClass ? currentClass._id : '' },
    context: {
      headers: {
        token: `${cookies.token}`,
      },
    },
    fetchPolicy: 'network-only',
  });

  const [cropSticker] = useMutation(CROP_STICKER, {
    context: {
      headers: {
        token: `${cookies.token}`,
      },
    },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const imageClick = (currentImage) => () => {
    setChoosing(true);

    cropSticker({ variables: { id: currentImage._id } })
      .then((res) => {
        window.currentImage = res.data.createSticker;
        setChoosing(false);
        history.push('image/');
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="page">
      <h1>Choose Image to Create Text Markup</h1>
      {data.class.images.filter((image) => image.path_labeled).length === 0
        && <p>No images with markup! Please create image markup at first</p>}
      {choosing ? <Spin size="large" /> : (
        <div className="cards">
          {data.class.images.map((image) => (image.path_labeled ? (
            <div key={image.path} className="card">
              <Card
                bordered={false}
                style={{ width: 400 }}
                size="small"
                bodyStyle={{ textAlign: 'left' }}
                onClick={imageClick(image)}
              >
                <img width="100%" alt={image.path} src={`${process.env.REACT_APP_IMAGES_URL}${`${image.path_labeled}?${new Date().getTime()}`}`} />
              </Card>
            </div>
          ) : null))}
        </div>
      )}
    </div>
  );
}
