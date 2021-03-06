import StatusCode from "./StatusCode";
import {ValidationError} from "class-validator";
import ValidationModel from "../../Application/Shared/ValidationModel";
import _ from "lodash";
import IStatusCode from "../../InterfaceAdapters/IPresentation/IStatusCode";

class FormatError
{
    getFormat = (message: any, statusCode: IStatusCode, errors: ValidationError[]): any =>
    {
        let validationModels: ValidationModel[] = [];

        if (!_.isEmpty(errors))
        {
            for (const error of errors)
            {
                const validationModel = new ValidationModel(error);
                validationModels.push(validationModel);
            }
        }

        return {
            'status': statusCode.status,
            'code': statusCode.code,
            'statusCode': statusCode.statusCode,
            'message': statusCode === StatusCode.HTTP_INTERNAL_SERVER_ERROR.code ? 'Internal Error Server' : message,
            'errors': _.isEmpty(validationModels) ? null : validationModels
        };
    };
}

export default FormatError;
