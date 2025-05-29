import { Router } from 'express';
const roleRoutes = Router();

import {isDemoRequest, userAuth} from '../../auth';
import {
    postRole, getRoles, getRole, deleteRole, getPermissions, postPermissions,
    departmentWiseList
} from '../../controllers/role.controller'


roleRoutes.post('/', userAuth({isAdmin: true}), isDemoRequest, postRole)
roleRoutes.get('/list', getRoles)
roleRoutes.get('/department-wise-list', userAuth({isAdmin: true}), departmentWiseList)
roleRoutes.get('/', getRole)
roleRoutes.delete('/', userAuth({isAdmin: true}), isDemoRequest, deleteRole)

roleRoutes.post('/permissions', postPermissions)
roleRoutes.get('/permissions',  getPermissions)

export default roleRoutes;