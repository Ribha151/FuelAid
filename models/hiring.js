const mongoose = require("mongoose");

const hiringSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    acn: {
        type: Number,
        required: true
    },
    dl: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        enum: ["male", "female"]
    },
    address: String,
    latitude: Number,
    longitude: Number,
    age: Number,
    experience: Number,
    employer: {
      type: String,
    },
    vehicleNumber: {
      type: String,
    },
    phone: Number,
    joinedTime: {
        type: Date,
        default: Date.now
    },
    vehicleType: {
        type: String,
        enum: ['Bike', 'Car', 'Truck','Scooter', 'Other']
      },
      vehicleModel: {
        type: String,
        trim: true
      },
    role: {
        type: String,
        enum: ["fuelboy"],
        required: true
    },
    verification_status: {
        type: String,
        enum: ["Pending", "Verified", "Rejected"],
        default: "Pending"
    },
    experience: {
        type: Number // years of experience
    },
    availability: {
        type: String // e.g., "9am - 6pm"
    },
    profilePic: String
});

const Hire = mongoose.model("hires", hiringSchema);
module.exports = Hire;