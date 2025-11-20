import { ApiService } from '../api/api.service';
import { ConfigInterface } from '../../../models/interfaces/config.interface';

export class BaseConfigApiService<T> extends ApiService<T> implements ConfigInterface<T> {
  protected url = `/`;
  iniConfig: Record<string, any> = {
    lastLogin: '01/01/1970',
  };

  getConfig(callback: (config: T) => void) {
    return this.http
      .get<T[]>(this.url, {
        params: {
          userId: this.userId,
        },
      })
      .pipe(this.basicResponseTapParser(callback));
  }

  initConfigForNewUser(userId: string) {
    return this.http.post<T>(this.url, { ...this.iniConfig, userId });
  }
}
