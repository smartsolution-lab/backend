import express from 'express';
const fileRoutes = express.Router();
import {userAuth,} from '../../auth';

import {
    uploadFiles
} from '../../controllers/files.controller';
import {upload} from "../../utils/fileProcess";


// const multiUpload = upload.fields([
//   { name: "profile_image", maxCount: 1 },
//   { name: "t2202a_form", maxCount: 1 },
//   { name: "notice_of_assessment", maxCount: 1 },
//   { name: "direct_deposit_form", maxCount: 1 },
//   { name: "drivers_license", maxCount: 1 },
//   { name: "uber_summary_pic", maxCount: 1 },
//   { name: "t4s", maxCount: 10 },
// ]);

// post 
fileRoutes.post('/aws', upload.any(), uploadFiles);

export default fileRoutes;