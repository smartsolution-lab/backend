import {Router} from "express";
import {isDemoRequest, userAuth} from "../../auth";
import {
    fetchServiceCategories,
    fetchServiceCategory,
    postServiceCategory,
    delServiceCategory,
    getServiceCategoryElements,
    fetchServiceCategoriesForApp,
    fetchAllServicesInDetails,
    postCategoryInfo,
    delCategoryInfo,
    getCategoryInfo,
    postCategoryHeading, getCategoryHeading
} from "../../controllers/service_categroy.controller";
import {
    postServicePackage,
    getServicePackages,
    getServicePackage,
    delServicePackage
} from "../../controllers/service_package.controller";
import {
    delService,
    fetchService,
    fetchServiceList,
    fetchServices,
    fetchServicesCategoryWise,
    postService,
    fetchCategoriesPackagesByService,
    postServiceVehicle,
    fetchServiceVehicleList,
    fetchServiceVehicle,
    delServiceVehicle,
} from "../../controllers/service.controller";


const serviceCategoryRoutes = Router()
// service category
serviceCategoryRoutes.get('/category/list', userAuth({isAuth: true}), fetchServiceCategories)
serviceCategoryRoutes.get('/category-list', fetchServiceCategoriesForApp)
serviceCategoryRoutes.get('/category/elements', getServiceCategoryElements)
serviceCategoryRoutes.get('/category', fetchServiceCategory)
serviceCategoryRoutes.post('/category', userAuth({isAdmin: true}), isDemoRequest, postServiceCategory)
serviceCategoryRoutes.delete('/category', userAuth({isAdmin: true}), isDemoRequest, delServiceCategory)

serviceCategoryRoutes.post('/category/heading', userAuth({isAdmin: true}), isDemoRequest, postCategoryHeading)
serviceCategoryRoutes.get('/category/heading', getCategoryHeading)

serviceCategoryRoutes.post('/category/info', userAuth({isAdmin: true}), isDemoRequest, postCategoryInfo)
serviceCategoryRoutes.get('/category/info', getCategoryInfo)
serviceCategoryRoutes.delete('/category/info', userAuth({isAdmin: true}), isDemoRequest, userAuth({isAdmin: true}), delCategoryInfo)

// service package
serviceCategoryRoutes.get('/package/list', getServicePackages)
serviceCategoryRoutes.get('/package', getServicePackage)
serviceCategoryRoutes.post('/package', userAuth({isAdmin: true}), isDemoRequest, postServicePackage)
serviceCategoryRoutes.delete('/package', userAuth({isAdmin: true}), isDemoRequest, delServicePackage)

// services
serviceCategoryRoutes.get('/list', fetchServices)
serviceCategoryRoutes.get('/service-categories-packages', userAuth({isAuth: true}), fetchCategoriesPackagesByService)
serviceCategoryRoutes.get('/category-wise-list', fetchServicesCategoryWise)
serviceCategoryRoutes.get('/list-short-info', fetchServiceList)
serviceCategoryRoutes.get('/', fetchService)
serviceCategoryRoutes.get('/fetch-all', fetchAllServicesInDetails)
serviceCategoryRoutes.post('/', userAuth({isAdmin: true}), isDemoRequest, postService)
serviceCategoryRoutes.delete('/', userAuth({isAdmin: true}), isDemoRequest, delService);

// service vehicle
serviceCategoryRoutes.get('/vehicle/list', fetchServiceVehicleList)
serviceCategoryRoutes.get('/vehicle', fetchServiceVehicle)
serviceCategoryRoutes.post('/vehicle', userAuth({isAdmin: true}), isDemoRequest, postServiceVehicle)
serviceCategoryRoutes.delete('/vehicle', userAuth({isAdmin: true}), isDemoRequest, delServiceVehicle);


export default serviceCategoryRoutes