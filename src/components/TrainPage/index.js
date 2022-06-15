import './classes.css';

import { useMutation, useQuery } from '@apollo/react-hooks';
import { Button, Card, Spin } from 'antd';
import React, { useState } from 'react';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';

import { CLASSES, TRAIN_CLASSES } from '../../queries/classes';
import CheckAdmin from '../CheckAdmin';

export default function TrainPage() {
  const [cookies] = useCookies();

  const [trainClasses] = useMutation(TRAIN_CLASSES);
  const history = useHistory();

  const [selectedClasses, setSelectedClasses] = useState([]);
  const [training, setTraining] = useState(false);
  const { loading, error, data } = useQuery(CLASSES, {
    context: {
      headers: {
        token: cookies.token,
      },
    },
    fetchPolicy: 'network-only',
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const cardClick = (curentClass) => () => {
    if (selectedClasses.includes(curentClass.name)) {
      const cls = [...selectedClasses];
      const index = cls.indexOf(curentClass.name);
      cls.splice(index, 1);
      setSelectedClasses(cls);
    } else {
      setSelectedClasses((prevState) => [...prevState, curentClass.name]);
    }
  };

  async function startTraining() {
    setTraining(true);
    const cls = [...selectedClasses];
    const res = await trainClasses({ variables: { classes: cls } });
    if (res.data.trainClasses.success) {
      setTraining(false);
      setSelectedClasses([]);
      history.push('./models');
    }
  }

  return (
    <div className="cards_page">
      <CheckAdmin />
      { training
        ? <Spin size="large" />
        : (
          <div>
            <h1>Select Classes to Train:</h1>
            <div className="cards">
              {data.user.classes.map((el) => (
                <div key={el.name} className={selectedClasses.includes(el.name) ? 'card selected' : 'card'}>
                  <Card
                    title={el.name}
                    bordered={false}
                    style={{ width: 150 }}
                    size="small"
                    bodyStyle={{ textAlign: 'left' }}
                    onClick={cardClick(el)}
                  >
                    <p>{`Brand: ${el.make}`}</p>
                    <p>{`Status: ${el.status}`}</p>
                  </Card>
                </div>
              ))}
            </div>

            <Button style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 'bold' }} onClick={startTraining}>
              Start Training
            </Button>
          </div>
        )}
    </div>
  );
}
