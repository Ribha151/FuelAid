const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const Hire = require("../models/hiring.js");
const Donation = require("../models/serviceRequest.js");
const geolib = require('geolib'); // npm install geolib


router.get("/admin/dashboard", middleware.ensureAdminLoggedIn, async (req,res) => {
	const numAdmins = await User.countDocuments({ role: "admin" });
	const numcustomers = await User.countDocuments({ role: "customer", verification_status: "Verified" });
	const nummechanics = await User.countDocuments({ role: "mechanic", verification_status: "Verified" });
	const numfueldeliveryboy = await User.countDocuments({ role: "fueldeliveryboy", verification_status: "Verified"});
	const numPendingDonations = await Donation.countDocuments({ status: "requested" });
	const numAcceptedDonations = await Donation.countDocuments({ status: "accepted" });
	// const numAssignedDonations = await Donation.countDocuments({ status: "assigned" });
	const numCollectedDonations = await Donation.countDocuments({ status: "completed" });
	res.render("admin/dashboard", {
		title: "Dashboard",
		numAdmins, numcustomers, nummechanics, numfueldeliveryboy, numPendingDonations, numAcceptedDonations, numCollectedDonations
	});
});

router.get("/admin/donations/pending", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const pendingDonations = await Donation.find({status: ["requested"]}).populate("customer");
		res.render("admin/pendingDonations", { title: "Pending Deliveries", pendingDonations });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/donations/previous", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const previousDonations = await Donation.find({ status: "completed" }).populate("customer");
		res.render("admin/previousDonations", { title: "Previous Deliveries", previousDonations });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/donation/view/:donationId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		const donation = await Donation.findById(donationId).populate("customer").populate("mechanic").populate("fueldeliveryboy");
		res.render("admin/donation", { title: "Delivery details", donation });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/delivery/view/:deliveryId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const deliveryId = req.params.deliveryId;
		const delivery = await Hire.findById(deliveryId);
		res.render("admin/delivery", { title: "Fuel Delivery Boy details", delivery});
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/donation/accept/:donationId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		await Donation.findByIdAndUpdate(donationId, { status: "accepted" });
		req.flash("success", "Delivery accepted successfully");
		res.redirect(`/admin/donation/view/${donationId}`);
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/donation/reject/:donationId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		await Donation.findByIdAndUpdate(donationId, { status: "rejected" });
		req.flash("success", "Delivery rejected successfully");
		res.redirect(`/admin/donation/view/${donationId}`);
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/donation/assign/:donationId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		const mechanics = await User.find({ role: "mechanic" });
		const donation = await Donation.findById(donationId).populate("customer");
		res.render("admin/assignmechanic", { title: "Assign mechanic", donation, mechanics });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.post("/admin/donation/assign/:donationId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		const {mechanic, adminTomechanicMsg} = req.body;
		await Donation.findByIdAndUpdate(donationId, { status: "assigned", mechanic, adminTomechanicMsg });
		req.flash("success", "mechanic assigned successfully");
		res.redirect(`/admin/donation/view/${donationId}`);
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/mechanics", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const mechanics = await User.find({ role: "mechanic" });
		res.render("admin/mechanics", { title: "List of mechanics", mechanics });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/fueldeliveryboys", middleware.ensureAdminLoggedIn, async (req, res) => {
    try {
        const fueldeliveryboys = await Hire.find({
            role: "fuelboy",
        });
		// const userfueldeliveryboys = await User.find({
		// 	role: "fueldeliveryboy",
		// });
		// const combinedboys = [...fueldeliveryboys, ...userfueldeliveryboys];

        res.render("admin/fueldeliveryboys", { title: "Fuel Delivery Boys", fueldeliveryboys });
    } catch (err) {
        console.log(err);
        req.flash("error", "Unable to load fuel delivery boys.");
        res.redirect("back");
    }
});

router.get("/admin/fuelrequests", middleware.ensureAdminLoggedIn, async (req, res) => {
    try {
        const fuelRequests = await Donation.find({ isFuelRequest: true, status: "requested" }).populate("customer");
        const fuelBoys = await User.find({ role: "fueldeliveryboy"});

        const updatedFuelRequests = [];

        for (let service of fuelRequests) {
            const serviceLocation = {
                latitude: service.latitude,
                longitude: service.longitude
            };

            const boysWithDistance = await Promise.all(
                fuelBoys.map(async (boy) => {
                    const ongoingDelivery = await Donation.findOne({
                        fueldeliveryboy: boy._id,
                        status: { $in: ["accepted", "assigned"] }
                    });

                    const boyLocation = {
                        latitude: boy.latitude,
                        longitude: boy.longitude
                    };

                    const distance = geolib.getDistance(serviceLocation, boyLocation) / 1000; // in km

                    return {
                        _id: boy._id,
                        firstName: boy.firstName,
                        lastName: boy.lastName,
                        address: boy.address,
                        phone: boy.phone,
                        status: ongoingDelivery ? "Busy" : "Free",
                        distance: parseFloat(distance.toFixed(2))
                    };
                })
            );

            // Filter those within 50 km
            const nearbyBoys = boysWithDistance.filter(boy => boy.distance <= 50);

            // Sort: Free first, then by distance
            nearbyBoys.sort((a, b) => {
                if (a.status === b.status) {
                    return a.distance - b.distance;
                }
                return a.status === "Free" ? -1 : 1;
            });

            updatedFuelRequests.push({
                ...service._doc,
                fuelBoys: nearbyBoys
            });
        }

        res.render("admin/fuelrequests", { title: "Fuel Delivery Requests", fuelRequests: updatedFuelRequests });

    } catch (err) {
        console.log(err);
        req.flash("error", "Error fetching fuel delivery requests.");
        res.redirect("back");
    }
});

router.post("/admin/assign-fuel-boy/:serviceId", middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
		const { serviceId } = req.params;
		const { fuelBoyId } = req.body;

		await Donation.findByIdAndUpdate(serviceId, {
			fueldeliveryboy: fuelBoyId,
			status: "accepted"
		});

		res.redirect("/admin/fuelrequests");
	} catch (err) {
		console.error(err);
		res.status(500).send("Error assigning delivery boy");
	}
});
//For complete fuel requests
router.get("/admin/completedfuelrequests", middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
		const acceptedfuel = await Donation.find({
			isFuelRequest: true,
			status: "completed"
		})
		.populate("customer")
		.populate("fueldeliveryboy");

		res.render("admin/completedfuelrequests", {
			title: "Complete Fuel Requests",
			acceptedfuel
		});
	} catch (err) {
		console.log(err);
		req.flash("error", "Error fetching accepted fuel delivery requests.");
		res.redirect("back");
	}
});

router.post("/admin/service/complete/:id", middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
	  const serviceId = req.params.id;
  
	  // Find the service by ID and check if it's assigned to the current mechanic
	  const service = await Donation.findOne({
		_id: serviceId,
		// fueldeliveryboy: req.user._id,
		status: "accepted"
	  });
  
	  if (!service) {
		req.flash("error", "Service not found or not authorized.");
		return res.redirect("back");
	  }
  
	  // Update status to 'completed'
	  service.status = "completed";
	  await service.save();
  
	  req.flash("success", "Service marked as completed.");
	  res.redirect("/admin/completedfuelrequests");
	} catch (err) {
	  console.error(err);
	  req.flash("error", "Error marking service as completed.");
	  res.redirect("back");
	}
  });

  router.post("/admin/service/inprogress/:id", middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
	  const service = await Donation.findById(req.params.id);
	  if (!service) {
		req.flash("error", "Service request not found.");
		return res.redirect("back");
	  }
  
	  service.status = "in-progress";
	  await service.save();
  
	  req.flash("success", "Service marked as In-Progress.");
	  res.redirect("/admin/completedfuelrequests");
	} catch (err) {
	  console.error(err);
	  req.flash("error", "Something went wrong.");
	  res.redirect("back");
	}
  });


router.get("/admin/profile", middleware.ensureAdminLoggedIn, (req,res) => {
	res.render("admin/profile", { title: "My profile" });
});

router.put("/admin/profile", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const id = req.user._id;
		const updateObj = req.body.admin;	// updateObj: {firstName, lastName, gender, address, phone}
		await User.findByIdAndUpdate(id, updateObj);
		
		req.flash("success", "Profile updated successfully");
		res.redirect("/admin/profile");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
	
});

router.get("/admin/verify-users", middleware.ensureAdminLoggedIn, async (req, res) => {
    try {
        const pendingUsers = await User.find({ 
			verification_status: "Pending", 
			role: { $in: ["customer", "mechanic"]} 
		});
		const pendingHires = await Hire.find({ verification_status: "Pending" });

        // Combine both lists
        const combinedPendingUsers = [...pendingUsers, ...pendingHires];

        res.render("admin/verify-users", { 
            title: "Verify Users", 
            pendingUsers: combinedPendingUsers 
        });
    } catch (err) {
        console.log(err);
        req.flash("error", "Some error occurred on the server.");
        res.redirect("back");
    }
});

// Approve user
router.post("/admin/verify-users/approve/:userId", middleware.ensureAdminLoggedIn, async (req, res) => {
    try {
        const { type } = req.body;
        const userId = req.params.userId;
		// console.log("Body received:", req.body);

        if (type === "customer" || type === "mechanic") {
            await User.findByIdAndUpdate(userId, { verification_status: "Verified" });
        } else if (type === "fuelboy") {
            await Hire.findByIdAndUpdate(userId, { verification_status: "Verified" });
        } else {
            req.flash("error", "Invalid user type");
            return res.redirect("back");
        }

        req.flash("success", "User approved successfully");
        res.redirect("/admin/verify-users");
    } catch (err) {
        console.log(err);
        req.flash("error", "Error approving user");
        res.redirect("back");
    }
});

// Reject user
router.post("/admin/verify-users/reject/:userId", middleware.ensureAdminLoggedIn, async (req, res) => {
    try {
        const { type } = req.body;
        const userId = req.params.userId;

        if (type === "customer" || type === "mechanic") {
            await User.findByIdAndUpdate(userId, { verification_status: "Rejected" });
        } else if (type === "fuelboy") {
            await Hire.findByIdAndUpdate(userId, { verification_status: "Rejected" });
        } else {
            req.flash("error", "Invalid user type");
            return res.redirect("back");
        }

        req.flash("success", "User rejected successfully");
        res.redirect("/admin/verify-users");
    } catch (err) {
        console.log(err);
        req.flash("error", "Error rejecting user");
        res.redirect("back");
    }
});


module.exports = router;