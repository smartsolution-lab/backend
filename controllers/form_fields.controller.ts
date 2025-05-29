import FormField from '../models/form_field.model';

// create FormField Code
export const postFormFiled = async (req, res, next) => {
    try {
        if (!!req?.body?._id) {
            await FormField.findByIdAndUpdate(req?.body?._id, {...req?.body});
            return res.status(200).json({
                error: false,
                msg: "updated successful",
            })
        }
        let {input_name, input_type, placeholder, field_required, status, step_name, select_options, link} = req.body;
        const field_name = input_name;
        input_name = input_name?.trim()?.split(' ')?.join('_');
        const insertData = {
            field_name,
            input_name,
            input_type,
            placeholder,
            field_required,
            status,
            step_name,
            select_options,
            link
        };
        delete req?.body?._id;
        const newFormField = await FormField.create(insertData);
        if (!newFormField) return res.status(400).json({msg: 'Wrong input! try again..', error: true});
        return res.status(200).json({
            error: false,
            msg: "Created successfully",
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            error: true,
            msg: "Server failed"
        })

    }
}

export const getAll = async (req, res, next) => {
    try {
        const fields = await FormField.find({});
        return res.status(200).json({
            error: false,
            data: fields
        })
    } catch (err) {
        return res.status(500).json({
            error: true,
            msg: err.message
        })
    }
}

export const deleteField = async (req, res, next) => {
    try {
        const {query} = req;
        await FormField.findByIdAndDelete(query?._id);
        return res.status(200).json({
            error: false,
            msg: "Delete success"
        })
    } catch (err) {
        return res.status(500).json({
            error: true,
            msg: err.message
        })
    }
}