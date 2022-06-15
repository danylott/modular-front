import { gql } from 'apollo-boost';

export const COMPUTERS = gql`
  {
    computers {
        position
        name
        type
        active_model {
            path
        }
    }
  }
`;
