import User from '../models/user.model'
import { s3Upload } from '../utils/awsS3Bucket';

export const uploadFiles = async (req, res, next) => {
    try {
        const { _id } = res.locals.user || {};
        const user = await User.findById(_id);
        if(!user) {
            return res.status(500).json({
                error: true,
                msg: "Permission Denied"
            })
        }
        const results = (await s3Upload(req.files, user?.phone)).map(d => d.Location);
        return res.status(200).json({
            error: false,
            msg: 'File uploaded successfully!',
            data: results
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        })
    }
}