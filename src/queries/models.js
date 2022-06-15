import { gql } from 'apollo-boost';

export const MODELS = gql`
  {
    models{
      _id
      path
      classes
      date_created
      is_active
    }
  }
`;

export const ACTIVATE_MODEL = gql`
  mutation activateModel($path: String!) {
    activateModel(path: $path) {
      path
      classes
      date_created
      is_active
    }
  }
`;

export const DELETE_MODEL = gql`
  mutation deleteModel($path: String!) {
    deleteModel(path: $path) {
      success
    }
  }
`;
