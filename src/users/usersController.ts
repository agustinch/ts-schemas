import {
  Length,
  Contains,
  IsInt,
  Min,
  Max,
  IsEmail,
  IsFQDN,
  IsDate,
} from 'class-validator';
import { ApiRequest, Controller, Route } from '../decorator';
import { Endpoint } from '../endpoint';
import { Request } from 'express';

export class User {
  constructor() {
    this.title = '';
  }
  @IsEmail()
  title: string;
}

@Controller('/users')
export class UserEndpoint extends Endpoint {
  @Route('get', '/aa/:id')
  private getUser(req: Request<{ id: string }>, res: Response) {
    // Your logic to handle GET user requests
    console.log('Hi', req.params.id);
  }

  @Route('post', '/')
  @ApiRequest(User)
  private updateUser(req: Request<{}, {}, { hola: string }>, res: any) {
    // Your logic to handle PUT user requests
    res.status(201).send(req.body);
  }
}
