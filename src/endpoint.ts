import { User } from './users/usersController';
import {
  classToPlain,
  instanceToPlain,
  plainToClass,
  plainToInstance,
} from 'class-transformer';
import { ValidationError, validate } from 'class-validator';
import {
  Router,
  Request,
  Response,
  RequestHandler,
  NextFunction,
} from 'express';
import 'reflect-metadata';

export let DEFINITIONS: any = {};
export let PATHS: any = {};

export function validateSchema<T>(schema: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the request body against the class-validator schema
      const dtoInstance = plainToInstance(schema, req.body);

      const errors: ValidationError[] = await validate(dtoInstance);

      // If there are validation errors, return them
      if (errors.length > 0) {
        const errorMessages = errors
          .map((error: ValidationError) =>
            Object.values(error.constraints || {})
          )
          .join(', ');
        return res
          .status(400)
          .json({ message: 'Validation error', errors: errorMessages });
      }

      // If validation passes, move to the next middleware
      next();
    } catch (error) {
      // If any other error occurs, return a 500 error
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}

function classToJSONSchema(className: any) {
  const classInstance = new className();
  const properties: any = {};

  for (const key in classInstance) {
    // Exclude prototype properties and methods
    if (typeof classInstance[key] === 'function') {
      continue;
    }

    // Determine the type of property
    const propertyValue = classInstance[key];
    let jsonType;
    if (Array.isArray(propertyValue)) {
      const arrayType =
        propertyValue.length > 0 ? typeof propertyValue[0] : 'null';
      jsonType = 'array';
      properties[key] = {
        type: jsonType,
        items: { type: arrayType },
      };
    } else {
      const propertyType = typeof propertyValue;
      switch (propertyType) {
        case 'string':
          jsonType = 'string';
          break;
        case 'number':
          jsonType = 'number';
          break;
        case 'boolean':
          jsonType = 'boolean';
          break;
        // Consider other types if needed
        default:
          jsonType = 'null';
      }
      properties[key] = { type: jsonType };
    }
  }

  const schema = {
    title: className.name,
    type: 'object',
    properties,
    required: Object.keys(properties),
  };

  return schema;
}

// Define a class for defining endpoints
export class Endpoint {
  public router: Router;

  constructor() {
    this.router = Router();
    this.setupRoutes();
    this.swaggerGenerator();
  }

  // Collect routes from subclass prototypes
  private setupRoutes() {
    const prototype = Object.getPrototypeOf(this);
    const methods = Object.getOwnPropertyNames(prototype);
    const basePath = prototype['basePath'];
    methods.forEach((methodName) => {
      const method = prototype[methodName];
      if (typeof method === 'function') {
        const route = Reflect.getMetadata('route', method);
        const apiRequest: User = Reflect.getMetadata('request', method);

        if (route) {
          const { path, verb } = route;
          PATHS[`${basePath}${path}`] = {
            [verb]: {},
          };
          if (apiRequest) {
            PATHS[`${basePath}${path}`][verb] = {
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      $ref: `#/components/schemas/${User.name}`,
                    },
                  },
                },
              },
            };
            DEFINITIONS = {
              [User.name]: {
                ...classToJSONSchema(User),
              },
            };
          }
          if (typeof this.router[verb as keyof Router] === 'function') {
            if (apiRequest) {
              (this.router[verb as keyof Router] as Function)(
                path,
                validateSchema(apiRequest),
                method.bind(this) as RequestHandler
              );
            } else {
              (this.router[verb as keyof Router] as Function)(
                path,
                method.bind(this) as RequestHandler
              );
            }
          }
        }
      }
    });

    // GET SWAGGER

    const swagger = {
      openapi: '3.0.3',
      info: {
        title: 'Swagger Petstore - OpenAPI 3.0',
        description:
          "This is a sample Pet Store Server based on the OpenAPI 3.0 specification.  You can find out more about\nSwagger at [https://swagger.io](https://swagger.io). In the third iteration of the pet store, we've switched to the design first approach!\nYou can now help us improve the API whether it's by making changes to the definition itself or to the code.\nThat way, with time, we can improve the API in general, and expose some of the new features in OAS3.\n\n_If you're looking for the Swagger 2.0/OAS 2.0 version of Petstore, then click [here](https://editor.swagger.io/?url=https://petstore.swagger.io/v2/swagger.yaml). Alternatively, you can load via the `Edit > Load Petstore OAS 2.0` menu option!_\n\nSome useful links:\n- [The Pet Store repository](https://github.com/swagger-api/swagger-petstore)\n- [The source API definition for the Pet Store](https://github.com/swagger-api/swagger-petstore/blob/master/src/main/resources/openapi.yaml)",
        termsOfService: 'http://swagger.io/terms/',
        contact: {
          email: 'apiteam@swagger.io',
        },

        servers: [
          {
            url: 'http://localhost/',
          },
        ],
      },
      paths: PATHS,
      components: {
        schemas: DEFINITIONS,
      },
    };

    console.log(JSON.stringify(swagger));
  }

  private swaggerGenerator() {
    const prototype = Object.getPrototypeOf(this);
    const methods = Object.getOwnPropertyNames(prototype);
    const basePath = prototype['basePath'];
    methods.forEach((methodName) => {
      const method = prototype[methodName];

      if (typeof method === 'function') {
        const route = Reflect.getMetadata('route', method);
        const apiRequest = Reflect.getMetadata('request', method);
        if (route) {
        }
      }
    });
  }
}
