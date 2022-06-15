import { useQuery } from '@apollo/react-hooks';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';

import { USER } from '../../queries/users';

export default function CheckToken() {
  const history = useHistory();
  const [cookies] = useCookies();
  if (!cookies.token) {
    history.push('/');
  }
  const { error } = useQuery(USER, {
    context: {
      headers: {
        token: `${cookies.token}`,
      },
    },
    fetchPolicy: 'network-only',
  });
  if (error) {
    history.push('/');
  }
  return null;
}
