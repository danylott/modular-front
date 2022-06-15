import { gql } from 'apollo-boost';

export const APPLICATIONS = gql`
    {
        user{
            is_admin
            applications {
                _id
                date_start
                date_end
                date_created
                classes
                author {
                    name
                }
                status
            }
        }
    }
`;

export const CREATE_APPLICATION = gql`
    mutation createApplication($date_start: String!, $date_end: String!, $classes: [String!]!) {
        createApplication(date_start: $date_start, date_end: $date_end, classes: $classes) {
            date_start
            date_end
            classes
            date_created
            status
        }
    }
`;

export const DELETE_APPLICATION = gql`
    mutation deleteApplication($id: String!) {
        deleteApplication(id: $id) {
            success
        }
    }
`;
