import { gql } from 'apollo-boost';

export const CLASSES = gql`
  {
    user {
      is_admin
      classes{
        _id
        name
        make
        count_labeled_images
        image_markup_path
        author{
          name
        }
        images{
          path_labeled
        }
        markup{
          field
          x
          y
          w
          h 
        }
      }
    }
  }
`;

export const CLASS = gql`
  query class($id: String!){
    class(id: $id){
      _id
      name
      make
      image_markup_path
      count_labeled_images
      markup{
        field
        x
        y
        w
        h 
      }
    }
  }
`;

export const CREATE_CLASS = gql`
  mutation createClass($name: String!, $make:String!) {
    createClass(name: $name, make: $make) {
      _id
      name
      make
    }
  }
`;

export const UPDATE_CLASS = gql`
  mutation updateClass($name: String!, $make:String!, $markup: [ClassMarkupInput]) {
    updateClass(name: $name, make: $make, markup: $markup) {
      _id
      name
      make
    }
  }
`;

export const UPDATE_CLASS_MARKUP = gql`
  mutation updateClassMarkup($name: String!, $make:String!, $status:String, $markup: [ClassMarkupInput], $image:String!) {
    updateClassMarkup(name: $name, make: $make, status: $status, markup: $markup, image: $image) {
      _id
      name
      make
      status
    }
  }
`;

export const FIND_ON_IMAGE = gql`
  mutation findOnImage($file: Upload!) {
    findOnImage(file: $file) {
      found
      class {
        name
        make
        status
      }
      score
      color
      size
      model
    }
  }
`;

export const CROP_IMAGE = gql`
  mutation cropImage($file: Upload!) {
    cropImage(file: $file) {
      success
    }
  }
`;

export const TRAIN_CLASSES = gql`
  mutation trainClasses($classes: [String]!) {
    trainClasses(classes: $classes) {
      success
    }
  }
`;

export const DELETE_CLASS = gql`
  mutation deleteClass($id: String!) {
    deleteClass(id: $id) {
      success
    }
  }
`;
