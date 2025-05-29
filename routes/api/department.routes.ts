import {Router} from "express";
import {isDemoRequest, userAuth} from "../../auth";
import {
    postDepartment, departmentList, getDepartmentElements, getDepartment, delDepartment,
    getDepartmentWiseSubDepartmentList
} from "../../controllers/department.controller";
import roleRoutes from "./role.routes";

const departmentRoutes = Router()
departmentRoutes.get('/list', departmentList)
departmentRoutes.get('/elements', getDepartmentElements)
departmentRoutes.get('/sub-department-list', getDepartmentWiseSubDepartmentList)
departmentRoutes.get('/', getDepartment)
departmentRoutes.post('/', postDepartment)
departmentRoutes.delete('/', userAuth({isAdmin: true}), isDemoRequest, delDepartment)

export default departmentRoutes