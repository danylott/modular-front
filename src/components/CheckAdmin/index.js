import { useQuery } from '@apollo/react-hooks';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';

import { USER } from '../../queries/users';

export default function CheckAdmin() {
  const history = useHistory();
  const [cookies] = useCookies();
  useQuery(USER, {
    context: {
      headers: {
        token: `${cookies.token}`,
      },
    },
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (!data.user.is_admin) {
        history.push('/');
      }
    },
  });

  return null;
}
