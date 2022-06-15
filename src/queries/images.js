import { gql } from 'apollo-boost';

export const IMAGES = gql`
    query class($id: String!) {
      class(id: $id){
        _id
        image_markup_path
        name
        make
        markup{
          field
          x
          y
          w
          h 
        }
        images{
          _id
          path
          path_labeled
          path_cropped
          status
        }
      }
    }
`;

export const SAVE_IMAGE = gql`
  mutation createImage($file: Upload! $cls_id: String!) {
    createImage(file: $file, cls_id: $cls_id) {
      _id
      path
      status
    }
  }
`;

export const CREATE_ANNOTATION = gql`
  mutation createAnnotation($id: String! $annotation: [Float]!) {
    createAnnotation(id: $id, annotation: $annotation) {
      _id
      path
      path_labeled
      annotation
    }
  }
`;

export const CROP_STICKER = gql`
  mutation createSticker($id: String!){
    createSticker(id: $id){
      _id
      path_cropped
      path
    }
  }
`;

export const DELETE_IMAGE = gql`
  mutation deleteImage($id: String!){
    deleteImage(id: $id){
      success
    }
  }
`;
