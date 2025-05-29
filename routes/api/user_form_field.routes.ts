import { Router } from 'express';

import {isDemoRequest, userAuth} from '../../auth';
import {
  createUserFormField, getOneUserFormField, getAllUserFormField,
  getSpecificUserRoleFormData, deleteUserFormField, updateUserFormField
} from '../../controllers/user_form_fields.controller';


const userFormFields = Router();
userFormFields.post('/create', isDemoRequest, createUserFormField);
userFormFields.post('/update', updateUserFormField);
userFormFields.get('/get-all', getAllUserFormField);
userFormFields.get('/get-one', getOneUserFormField);
userFormFields.get('/get-specific-role-data', getSpecificUserRoleFormData);
userFormFields.delete('/delete', isDemoRequest, deleteUserFormField);


export default userFormFields;