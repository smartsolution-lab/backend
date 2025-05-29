import {Router} from 'express';

import {isDemoRequest, userAuth} from '../../auth';
import {
    delVehicle,
    postVehicleInfo,
    getVehicleInfo,
    getAllVehicleInfo,
    nearVehicleSearchFromUserPoint,
    updateDriverLocation,
    distanceCalculationFromUserLocationToDestination,
    nearestSelectedVehicleDetails,
    getFare,
    createVehicle,
    createVehicleSetting,
    fetchVehicleSetting,
    fetchVehicleSettings,
    fetchServiceWiseVehicles,
    fetchVehicleList,
    fetchVehicle,
    updateVehicleActive,
    fetchVehicleDriverWise,
    vehicleDocumentUpdate,
    verifyDriverVehicle,
    getDriverDocument,
    getTestingRideDistance,
    nearestVehiclesAndServiceVehicleTypes,
    getCurrentDriverPosition, deleteVehicleSetting
} from '../../controllers/vehicle.controller'


const vehicleRoutes = Router();
// vehicle
vehicleRoutes.get('/list', userAuth({isAdmin: true}), fetchVehicleList)
vehicleRoutes.get('/', userAuth({isAuth: true}), fetchVehicle)
vehicleRoutes.get('/driver-wise', userAuth({isDriver: true}), fetchVehicleDriverWise)
vehicleRoutes.post('/driver-document', userAuth({isAuth: true}), vehicleDocumentUpdate)
vehicleRoutes.get('/driver-document', userAuth({isAuth: true}), getDriverDocument)
vehicleRoutes.get('/service-wise-list', fetchServiceWiseVehicles)
vehicleRoutes.get('/details', nearestSelectedVehicleDetails)
vehicleRoutes.get('/verify', userAuth({isDriver: true}), verifyDriverVehicle)
vehicleRoutes.post('/', userAuth({isAuth: true}), createVehicle)
vehicleRoutes.delete('/', userAuth({isAdmin: true}), isDemoRequest, delVehicle);

vehicleRoutes.post('/setting', userAuth({isAdmin: true}), createVehicleSetting)
vehicleRoutes.get('/setting/list', userAuth({isAdmin: true}), fetchVehicleSettings)
vehicleRoutes.get('/setting', userAuth({isAdmin: true}), fetchVehicleSetting)
vehicleRoutes.delete('/setting', userAuth({isAdmin: true}), isDemoRequest, deleteVehicleSetting)

vehicleRoutes.post('/update-driver-location', updateDriverLocation)
vehicleRoutes.post('/update-active-status', updateVehicleActive)
vehicleRoutes.post('/nearest-vehicle-search', nearVehicleSearchFromUserPoint)
vehicleRoutes.post('/distance-calculation', distanceCalculationFromUserLocationToDestination)

vehicleRoutes.post('/fare', getFare)
vehicleRoutes.post('/fare-distance', getTestingRideDistance)

// service vehicle information
vehicleRoutes.post('/information/create', postVehicleInfo)
vehicleRoutes.get('/information', getVehicleInfo)
vehicleRoutes.get('/info-all', getAllVehicleInfo)

// new API
vehicleRoutes.post('/nearest-me', nearestVehiclesAndServiceVehicleTypes)
vehicleRoutes.get('/current-position', userAuth({isAuth: true}), getCurrentDriverPosition)


export default vehicleRoutes;