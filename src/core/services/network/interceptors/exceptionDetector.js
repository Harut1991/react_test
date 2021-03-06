// @flow

/* import { history } from 'config/routes';
import CacheService from '../../storage/CacheService'; */

export default (data: Object) => {
  /* if (data.status === 401) {
      CacheService.clearStorage();
      history.push('/login');
      throw new Error(data.AlertMessage);
    } */

  if (data.HasError) {
    throw new Error(data.AlertMessage);
  }

  return data;
};
