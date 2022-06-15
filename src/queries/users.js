import { gql } from 'apollo-boost';

export const USER = gql`
  {
    user{
      company
      name
      email
      is_admin
    }
  }
`;

export const USERS = gql`
  {
    users{
      _id
      company
      name
      email
      is_admin
    }
  }
`;

export const USER_INFO = gql`
  query userInfo($registration_uuid: String!){
    userInfo(registration_uuid: $registration_uuid) {
      _id
      name
      email
    }
  }
`;

export const LOGIN = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }
`;

export const REGISTER = gql`
  mutation createUser($company: String!, $name: String!, $email: String!) {
    createUser(company: $company, name: $name, email: $email) {
      name
      company
      email
    }
  }
`;

export const DELETE_USER = gql`
  mutation deleteUser($id: String!) {
    deleteUser(id: $id) {
      success
    }
  }
`;

export const CREATE_PASSWORD = gql`
  mutation createPassword($email: String!, $password1: String!, $password2: String!) {
    createPassword(email: $email, password1: $password1, password2: $password2) {
      name
      company
      email
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation resetPassword($email: String!) {
    resetPassword(email: $email) {
      name
      company
      email
    }
  }
`;
