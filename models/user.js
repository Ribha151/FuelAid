const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
	address: {
		type: String,
		required: true
	},
	phone: {
		type: Number,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	gender: {
		type: String,
		enum: ["male", "female"]
	},
	address: String,
	latitude: Number,
  	longitude: Number,

	phone: Number,
	joinedTime: {
		type: Date,
		default: Date.now
	},
	vehicleType: {
		type: String,
		enum: ['Bike', 'Car', 'Truck', 'Other']
	  },
	  vehicleModel: {
		type: String,
		trim: true
	  },
	  licensePlate: {
		type: String,
		trim: true,
		unique: true
	  },

	role: {
		type: String,
		enum: ["admin", "customer", "mechanic","fueldeliveryboy"],
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
	profilePic: String,
	dl: {
		type: Number,
		required: true
	},
	age: Number,
	experience: Number,
	employer: {
	  type: String,
	}
});

const User = mongoose.model("users", userSchema);
module.exports = User;