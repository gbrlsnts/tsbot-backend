export interface UserIdResponse {
  user: {
    id: number;
  };
}

export interface AccessToken {
  token: string;
}

export interface JwtPayload {
  email: string;
}
