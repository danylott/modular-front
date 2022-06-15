import { gql } from 'apollo-boost';

/* eslint-disable-next-line import/prefer-default-export */
export const LAST_RECOGNITION = gql`
  mutation lastRecognition($createdAfterDate: String){
    lastRecognition(createdAfterDate: $createdAfterDate) {
      positionId
      classId {
        name
        make
        status
      }
      barcode
      image
      score
      recognized {
        model
        size
        color
      }
      createdAt
    }
  }
`;
