import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

// schema design
const schema = new mongoose.Schema({
    category: {
        type: mongoose.Types.ObjectId,
        ref: 'service_category',
    },
    service_package: {
        type: mongoose.Types.ObjectId,
        ref: 'service_package',
    },
    service: {
        type: mongoose.Types.ObjectId,
        ref: 'service',
    },
    service_vehicle: {
        type: mongoose.Types.ObjectId,
        ref: 'service_vehicle',
        // unique: true
    },
    currency: {
        type: String,
        trim: true,
    },
    base_fair: {
        type: Number,
        min: 0,
    },
    per_kilo_charge: {
        type: Number,
        min: 0,
    },
    waiting_charge: {
        type: Number,
        min: 0,
    },
    minimum_fair: {
        type: Number,
        min: 0,
    },
    cancellation_fee: {
        type: Number,
        min: 0,
    },
    commission_type: {
        type: String,
        enum: ["fixed_amount", "percentage"],
        trim: true,
    },
    company_commission: {
        type: Number,
        min: 0,
    },
    additional_fees: [
        {
            additional_fee_name: String,
            additional_fee: Number,
        },
    ]

}, {
    timestamps: true
});


schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const ServicePrice = mongoose.model("service_price", schema);

export default ServicePrice;