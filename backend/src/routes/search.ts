import { Router } from 'express';
import { globalSearch } from '../controllers/searchController';

export const searchRouter = Router();

searchRouter.get('/', globalSearch);
