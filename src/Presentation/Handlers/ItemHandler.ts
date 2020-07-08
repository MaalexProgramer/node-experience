import {NextFunction, Request, Response} from 'express';
import {controller, httpDelete, httpGet, httpPost, httpPut, request, response, next} from 'inversify-express-utils';
import { TYPES } from "../../types";
import {lazyInject} from "../../inversify.config";
import Responder from "../Shared/Responder";
import StatusCode from "../Shared/StatusCode";
import ValidatorRules from "../Middlewares/ValidatorRules";
import AuthorizeMiddleware from "../Middlewares/AuthorizeMiddleware";
import Permissions from "../../../config/Permissions";

import ItemTransformer from "../Transformers/Items/ItemTransformer";
import ItemRepRequest from "../Requests/Items/ItemRepRequest";
import IdRequest from "../Requests/Defaults/IdRequest";
import ItemRequestCriteria from "../Requests/Items/ItemRequestCriteria";
import ItemUpdateRequest from "../Requests/Items/ItemUpdateRequest";
import IItem from "../../InterfaceAdapters/IEntities/IItem";

import SaveItemUseCase from "../../Domain/UseCases/Item/SaveItemUseCase";
import ListItemsUseCase from "../../Domain/UseCases/Item/ListItemsUseCase";
import IPaginator from "../../InterfaceAdapters/Shared/IPaginator";
import GetItemUseCase from "../../Domain/UseCases/Item/GetItemUseCase";
import RemoveItemUseCase from "../../Domain/UseCases/Item/RemoveItemUseCase";

@controller('/api/items')
class ItemHandler
{
    @lazyInject(TYPES.Responder)
    private responder: Responder;

    @httpPost('/', ...ItemRepRequest.validate(), ValidatorRules, AuthorizeMiddleware(Permissions.ITEMS_SAVE))
    public async save (@request() req: Request, @response() res: Response, @next() nex: NextFunction)
    {
        const _request = new ItemRepRequest(req);
        const saveItemUseCase = new SaveItemUseCase();

        const item: IItem = await saveItemUseCase.handle(_request);

        this.responder.send(item, res, StatusCode.HTTP_CREATED, new ItemTransformer());
    }

    @httpGet('/', AuthorizeMiddleware(Permissions.ITEMS_LIST))
    public async list (@request() req: Request, @response() res: Response)
    {
        const _request = new ItemRequestCriteria(req);
        const listItemsUseCase = new ListItemsUseCase();

        const paginator: IPaginator = await listItemsUseCase.handle(_request);

        await this.responder.paginate(paginator, res, StatusCode.HTTP_OK, null);
    }

    @httpGet('/:id', ...IdRequest.validate(), ValidatorRules, AuthorizeMiddleware(Permissions.ITEMS_SHOW))
    public async getOne  (@request() req: Request, @response() res: Response, @next() nex: NextFunction)
    {
        const _request = new IdRequest(req);
        const getItemUseCase = new GetItemUseCase();

        const item: IItem = await getItemUseCase.handle(_request);

        this.responder.send(item, res, StatusCode.HTTP_OK, new ItemTransformer());
    }

    @httpPut('/:id', ...ItemUpdateRequest.validate(), ValidatorRules, AuthorizeMiddleware(Permissions.ITEMS_UPDATE))
    public async update (@request() req: Request, @response() res: Response, @next() nex: NextFunction)
    {
        const _request = new ItemUpdateRequest(req);
        const getItemUseCase = new GetItemUseCase();

        const item: IItem = await getItemUseCase.handle(_request);

        this.responder.send(item, res, StatusCode.HTTP_OK, new ItemTransformer());
    }

    @httpDelete('/:id', ...IdRequest.validate(), ValidatorRules, AuthorizeMiddleware(Permissions.ITEMS_DELETE))
    public async remove (@request() req: Request, @response() res: Response, @next() nex: NextFunction)
    {
        const _request = new IdRequest(req);
        const removeItemUseCase = new RemoveItemUseCase();

        const data = await removeItemUseCase.handle(_request);

        this.responder.send(data, res, StatusCode.HTTP_OK);
    }
}

export default ItemHandler;