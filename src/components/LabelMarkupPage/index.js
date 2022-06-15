import './classes.css';

import { useMutation } from '@apollo/react-hooks';
import { Spin } from 'antd';
import React, { useState } from 'react';
import { useCookies } from 'react-cookie';
import ReactImageAnnotate from 'react-image-annotate';
import { useHistory } from 'react-router-dom';

import { CREATE_ANNOTATION } from '../../queries/images';

export default function LabelMarkupPage() {
  const [cookies] = useCookies();
  const history = useHistory();
  const { currentImage } = window;
  const { currentImages } = window;
  const path = currentImage ? process.env.REACT_APP_IMAGES_URL + currentImage.path : '';
  const [saving, setSaving] = useState(false);

  const [createAnnotation] = useMutation(CREATE_ANNOTATION, {
    context: {
      headers: {
        token: `${cookies.token}`,
      },
    },
  });

  const images = currentImages ? currentImages.reduce((acc, image) => {
    acc.push({
      src: process.env.REACT_APP_IMAGES_URL + image.path,
      name: image._id,
    });
    return acc;
  }, []) : [];

  async function createAnn(annotation, id) {
    await createAnnotation({
      variables: {
        id,
        annotation,
      },
    });
  }

  /* eslint-disable-next-line no-shadow */
  async function saveAnnotation(images) {
    for (const image of images) {
      if (image.regions && image.regions.length > 0) {
        const { points } = image.regions[0];
        const annotation = points.reduce((acc, point) => {
          acc.push(point[0]);
          acc.push(point[1]);
          return acc;
        }, []);
        if (annotation.length > 2) {
          /* eslint-disable-next-line no-await-in-loop */
          await createAnn(annotation, image.name);
        }
      }
    }
  }

  const onSubmit = (info) => {
    setSaving(true);
    saveAnnotation(info.images)
      .then(() => {
        history.push('/class');
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="page">
      {saving ? <Spin size="large" /> : (
        <div>
          <h1>Label Markup</h1>
          <p>(existed markup is hidden)</p>
          <div>
            {currentImages && (
            <ReactImageAnnotate
              selectedImage={path}
              taskDescription="Draw Only one Polygon - label annotation"
              images={images}
              enabledTools={['create-polygon']}
              showTags={false}
              onExit={(info) => onSubmit(info)}
            />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
